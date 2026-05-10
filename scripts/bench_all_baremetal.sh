#!/bin/bash
# bench_all_baremetal.sh — Part 3 chart data on bare-metal Linux (Arch)
# Measures: fioQdLatency (mode × QD), fioCpuUsage (QD=16), fioCpuThroughput (CPU load × {interrupt, sqpoll}),
#           adaptiveTimeline + adaptiveBandwidth (Week 3 self-switching, requires patched fio).
# Output: results-baremetal/*.json + TS-ready blocks at the end (paste back to update experiments.ts).
#
# The adaptive phase requires the fio fork with the --adaptive_mode option
# (engines/io_uring.c). Without it, Phase 3 will fail with "unknown option".
#
# usage:
#   sudo bash bench_all_baremetal.sh                              # file-based, 1 GB random in /tmp
#   sudo TESTFILE=/dev/nvme0n1 bash bench_all_baremetal.sh        # raw block device (read-only safe)
#   RUNTIME=5 sudo bash bench_all_baremetal.sh                    # quick smoke test (~2 min)
#
# Pre-req for IOPOLL: nvme.poll_queues > 0
#   echo 'options nvme poll_queues=4' | sudo tee /etc/modprobe.d/nvme.conf
#   sudo mkinitcpio -P && sudo reboot
#
# NOTE: do NOT use `set -e` — it conflicts with [ ... ] && ... idioms in run_cpu_load
#       and would kill the script when stress_pid is empty in the idle case.

TESTFILE="${TESTFILE:-/tmp/bench_testfile}"
TESTSIZE_MB="${TESTSIZE_MB:-1024}"
RUNTIME="${RUNTIME:-30}"
OUTDIR="${OUTDIR:-results-baremetal}"
QDS=(1 4 16 64 256)
CORES=$(nproc)
HALF=$((CORES / 2))

# install deps via pacman if missing
need=()
for t in fio stress-ng jq; do command -v "$t" >/dev/null || need+=("$t"); done
if [ "${#need[@]}" -gt 0 ]; then
  echo "Installing: ${need[*]}"
  pacman -Sy --noconfirm "${need[@]}"
fi

[ "$EUID" -eq 0 ] || { echo "Run with sudo." >&2; exit 1; }

# IOPOLL needs nvme.poll_queues > 0; otherwise --hipri=1 falls back to interrupt path
poll_q=$(cat /sys/module/nvme/parameters/poll_queues 2>/dev/null || echo 0)
echo "nvme.poll_queues = $poll_q"
if [ "$poll_q" = "0" ]; then
  echo "  WARN: poll_queues=0 → IOPOLL data will look identical to interrupt."
  echo "  Enable: 'options nvme poll_queues=4' in /etc/modprobe.d/nvme.conf, then mkinitcpio -p linux && reboot."
fi
echo

# create test file (random bytes so filesystems with compression don't cheat)
# Block device: read-only randread, never dd. Regular file: create with random data.
if [ -b "$TESTFILE" ]; then
  echo "TESTFILE=$TESTFILE is a block device — raw randread (no creation)."
else
  expected_bytes=$((TESTSIZE_MB * 1024 * 1024))
  if [ ! -f "$TESTFILE" ] || [ "$(stat -c%s "$TESTFILE" 2>/dev/null)" != "$expected_bytes" ]; then
    echo "Creating $TESTFILE (${TESTSIZE_MB} MB random)..."
    dd if=/dev/urandom of="$TESTFILE" bs=1M count="$TESTSIZE_MB" status=progress
  fi
fi

# pin frequencies for stable measurements (no-op if cpupower missing)
if command -v cpupower >/dev/null; then
  cpupower frequency-set -g performance >/dev/null 2>&1 || true
fi

mkdir -p "$OUTDIR"
TOTAL=$((15 + 6 + 1))
# Phase 3 (adaptive) runs for 3*RUNTIME; account for it separately.
TOTAL_SECS=$(( (15 + 6) * RUNTIME + 3 * RUNTIME ))
echo "Will run $TOTAL fio jobs ≈ $((TOTAL_SECS / 60))min"
echo

# --- Phase 1: mode × QD (15 runs) ---
echo "==== Phase 1: mode × QD ===="
for mode in default sqpoll iopoll; do
  EXTRA=""
  case "$mode" in
    sqpoll) EXTRA="--sqthread_poll=1" ;;
    iopoll) EXTRA="--hipri=1" ;;
  esac
  for qd in "${QDS[@]}"; do
    echo 3 > /proc/sys/vm/drop_caches
    echo ">>> mode=$mode qd=$qd"
    fio --name="${mode}-qd${qd}" \
        --ioengine=io_uring \
        --rw=randread --bs=4k --direct=1 \
        --iodepth="$qd" \
        --filename="$TESTFILE" \
        --runtime="$RUNTIME" --time_based \
        --output-format=json $EXTRA \
        --output="$OUTDIR/${mode}-qd${qd}.json" >/dev/null
  done
done

# --- Phase 2: CPU load × {interrupt, sqpoll} at QD=16 (6 runs) ---
echo
echo "==== Phase 2: CPU load matrix ===="
run_cpu_load() {
  local label="$1" stress_n="$2" stress_pid=""
  if [ "$stress_n" -gt 0 ]; then
    stress-ng --cpu "$stress_n" --timeout $((2*RUNTIME))s >/dev/null 2>&1 &
    stress_pid=$!
    sleep 1
  fi
  for mode in interrupt sqpoll; do
    local EXTRA=""
    if [ "$mode" = "sqpoll" ]; then EXTRA="--sqthread_poll=1"; fi
    echo 3 > /proc/sys/vm/drop_caches
    echo ">>> cpu=$label mode=$mode"
    fio --name="cpu-${label}-${mode}" \
        --ioengine=io_uring \
        --rw=randread --bs=4k --direct=1 \
        --iodepth=16 \
        --filename="$TESTFILE" \
        --runtime="$RUNTIME" --time_based \
        --output-format=json $EXTRA \
        --output="$OUTDIR/cpu-${label}-${mode}.json" >/dev/null
  done
  if [ -n "$stress_pid" ]; then
    kill "$stress_pid" 2>/dev/null
    wait "$stress_pid" 2>/dev/null
  fi
  return 0
}

run_cpu_load "idle" 0
run_cpu_load "50"   "$HALF"
run_cpu_load "100"  "$CORES"

# --- Phase 3: adaptive (1 run, ~3× RUNTIME, requires patched fio) ---
# Verifies the fio --adaptive_mode option: starts in SQPOLL, drops to interrupt
# when stress-ng pushes CPU above the threshold, returns to SQPOLL afterward.
# The patched fio prints "io_uring: adaptive switch -> {polling,interrupt} at t=…"
# to stderr; we capture it as the timeline.
echo
echo "==== Phase 3: adaptive ===="
ADAPT_RUNTIME=$((RUNTIME * 3))
ADAPT_LOG="$OUTDIR/adaptive.stderr"
ADAPT_BWPREFIX="$OUTDIR/adaptive_bw"
echo 3 > /proc/sys/vm/drop_caches

# spawn cycling CPU pressure: idle, then load, then idle (one full cycle)
(
  sleep $((ADAPT_RUNTIME / 4))
  stress-ng --cpu "$CORES" --timeout $((ADAPT_RUNTIME / 2))s >/dev/null 2>&1
) &
ADAPT_STRESS_PID=$!

echo ">>> adaptive: ${ADAPT_RUNTIME}s, CPU stress for the middle half"
fio --name="adaptive" \
    --ioengine=io_uring \
    --rw=randread --bs=4k --direct=1 \
    --iodepth=64 \
    --filename="$TESTFILE" \
    --runtime="$ADAPT_RUNTIME" --time_based \
    --output-format=json \
    --output="$OUTDIR/adaptive.json" \
    --write_bw_log="$ADAPT_BWPREFIX" --log_avg_msec=100 \
    --adaptive_mode="cpu_hi=70:qd_lo=8:cooldown_ms=500" \
    2> >(tee "$ADAPT_LOG" >&2) >/dev/null

wait "$ADAPT_STRESS_PID" 2>/dev/null

# --- Phase 4: parse → TS-ready blocks ---
echo
echo "============================================================"
echo "  PASTE EVERYTHING BELOW BACK TO CLAUDE"
echo "  env: $(uname -r), nproc=$CORES, poll_queues=$poll_q"
echo "============================================================"
echo

echo "// ---- fioQdLatency (μs, mean) ----"
for qd in "${QDS[@]}"; do
  it=$(jq '.jobs[0].read.lat_ns.mean / 1000' "$OUTDIR/default-qd${qd}.json")
  sp=$(jq '.jobs[0].read.lat_ns.mean / 1000' "$OUTDIR/sqpoll-qd${qd}.json")
  ip=$(jq '.jobs[0].read.lat_ns.mean / 1000' "$OUTDIR/iopoll-qd${qd}.json")
  printf "  { qd: %d, interrupt: %.1f, sqpoll: %.1f, iopoll: %.1f },\n" \
    "$qd" "$it" "$sp" "$ip"
done

echo
echo "// ---- fioCpuUsage (QD=16, %) ----"
for pair in "Interrupt:default-qd16" "SQPOLL:sqpoll-qd16" "IOPOLL:iopoll-qd16"; do
  l="${pair%%:*}"; b="${pair##*:}"
  u=$(jq '.jobs[0].usr_cpu' "$OUTDIR/${b}.json")
  s=$(jq '.jobs[0].sys_cpu' "$OUTDIR/${b}.json")
  printf "  { mode: '%s', usrCpu: %.0f, sysCpu: %.0f },\n" "$l" "$u" "$s"
done

echo
echo "// ---- fioCpuThroughput (MB/s) ----"
for pair in "Idle:idle" "50%:50" "100%:100"; do
  d="${pair%%:*}"; k="${pair##*:}"
  it=$(jq '.jobs[0].read.bw_bytes / 1048576' "$OUTDIR/cpu-${k}-interrupt.json")
  sp=$(jq '.jobs[0].read.bw_bytes / 1048576' "$OUTDIR/cpu-${k}-sqpoll.json")
  printf "  { cpuLoad: '%s', interrupt: %.0f, sqpoll: %.0f },\n" "$d" "$it" "$sp"
done

echo
echo "// ---- adaptiveTimeline (mode transitions, t in ms) ----"
echo "// stderr lines from patched fio: 'io_uring: adaptive switch -> <mode> at t=N ms ...'"
if [ -f "$ADAPT_LOG" ]; then
  # Always start in polling; stamp transitions from the log.
  echo "  { tMs: 0, mode: 'polling' },"
  grep -E "adaptive switch -> (polling|interrupt) at t=" "$ADAPT_LOG" | \
    sed -E "s/.*adaptive switch -> ([a-z]+) at t=([0-9]+) ms.*/  { tMs: \2, mode: '\1' },/"
fi

echo
echo "// ---- adaptiveBandwidth (MB/s, 100ms buckets) ----"
echo "// from $ADAPT_BWPREFIX_bw.*.log: csv 'time_ms,bw_KiBps,ddir,bs,prio'"
ADAPT_BW_FILE=$(ls "${ADAPT_BWPREFIX}"_bw.*.log 2>/dev/null | head -1)
if [ -n "$ADAPT_BW_FILE" ]; then
  awk -F', *' 'NR>0 { printf "  { tMs: %d, mbps: %.1f },\n", $1, $2/1024 }' "$ADAPT_BW_FILE" | head -200
fi

echo
echo "Done. JSON in $OUTDIR/, adaptive stderr in $ADAPT_LOG"
