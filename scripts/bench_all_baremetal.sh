#!/bin/bash
# bench_all_baremetal.sh — Part 3 chart data on bare-metal Linux (Arch)
# Measures: fioQdLatency (mode × QD), fioCpuUsage (QD=16), fioCpuThroughput (CPU load × {interrupt, sqpoll}).
# Output: results-baremetal/*.json + TS-ready blocks at the end (paste back to update experiments.ts).
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
TOTAL=$((15 + 6))
echo "Will run $TOTAL fio jobs × ${RUNTIME}s ≈ $((TOTAL*RUNTIME/60))min"
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

# --- Phase 3: parse → TS-ready blocks ---
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
echo "Done. JSON in $OUTDIR/"
