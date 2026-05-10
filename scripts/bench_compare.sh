#!/bin/bash
# bench_compare.sh — 4-way comparison under a cycling external CPU load
#
# Compares fio io_uring strategies head-to-head on the SAME workload and
# the SAME load schedule. The interesting question this answers:
#   "Does runtime adaptive switching beat every fixed strategy when the
#    environment is non-stationary?"
#
# Configurations measured:
#   polling    — --sqthread_poll=1                 (always SQPOLL)
#   interrupt  — (no extra flag)                   (always interrupt)
#   iopoll     — --hipri=1                         (always IOPOLL; needs nvme.poll_queues>0)
#   adaptive   — --adaptive_mode=...               (patched fio: runtime switching)
#
# Workload (same for every config):
#   --rw=randread --bs=4k --direct=1 --iodepth=$QD --runtime=$RUNTIME
#
# Background load schedule (relative to each fio start, identical per config):
#   t=0..LOAD1_START         idle
#   t=LOAD1_START..+LOAD1_DUR    stress-ng --cpu N
#   t=...idle...
#   t=LOAD2_START..+LOAD2_DUR    stress-ng --cpu N
#   t=...idle...end
#
# Outputs (in $OUTDIR):
#   cmp-<config>.json         fio JSON (integrated stats)
#   cmp-<config>.stderr       fio stderr (adaptive transitions for the adaptive config)
#   cmp-<config>_bw.*.log     fio per-100ms bandwidth log
# Final stdout: TS-ready dataset blocks for src/data/experiments.ts.
#
# usage (run from anywhere; FIO must point to the patched binary that has
# the --adaptive_mode option):
#   sudo FIO=~/fio/fio bash bench_compare.sh
#   sudo FIO=~/fio/fio TESTFILE=/dev/nvme0n1 bash bench_compare.sh
#   sudo FIO=~/fio/fio RUNTIME=120 bash bench_compare.sh        # less variance
#   sudo FIO=~/fio/fio SKIP_IOPOLL=1 bash bench_compare.sh      # poll_queues=0
#
# ── RECIPES ─────────────────────────────────────────────────────────────────
# Default ("idle vs cycling load") often shows polling barely degrading
# because stress-ng workers spread across cores and SQPOLL keeps its core.
# To force a scenario where adaptive decisively beats polling, constrain CPU:
#
#   "Constrained" recipe — SQPOLL kthread + stress fight for the same core(s):
#     sudo FIO=~/fio/fio TESTFILE=/dev/nvme0n1 \
#         BENCH_CPU_MASK=0,1               \   # fio limited to CPU 0,1
#         FIO_SQPOLL_CPU=0                 \   # SQPOLL kthread pinned to CPU 0
#         STRESS_TASKSET=0,1               \   # stress also on CPU 0,1
#         STRESS_CPUS=2                    \   # 2 stress workers on those 2 cores
#         STRESS_METHOD=matrixprod         \   # heavier than default
#         ADAPT_OPT="cpu_hi=60:qd_lo=8:cooldown_ms=500" \
#         WARMUP_SECS=10                   \   # avoid cold-start skewing first config
#         bash bench_compare.sh
#
# In this recipe polling collapses (~2 cores busy, but only 1 effective for IO),
# interrupt does ok-ish, and adaptive should switch into interrupt during stress
# and back out, beating both. Verify by checking cmpAdaptiveTimeline has 4+
# transitions and cmpSummary shows adaptive ≥ polling AND adaptive ≥ interrupt.

set -u
FIO="${FIO:-./fio}"
TESTFILE="${TESTFILE:-/tmp/bench_testfile}"
TESTSIZE_MB="${TESTSIZE_MB:-1024}"
RUNTIME="${RUNTIME:-60}"
QD="${QD:-64}"
OUTDIR="${OUTDIR:-results-compare}"
ADAPT_OPT="${ADAPT_OPT:-cpu_hi=70:qd_lo=8:cooldown_ms=500}"
SKIP_IOPOLL="${SKIP_IOPOLL:-0}"
CORES=$(nproc)

# Optional constraints to force CPU contention (see RECIPES above)
BENCH_CPU_MASK="${BENCH_CPU_MASK:-}"     # taskset mask for fio (e.g. "0,1")
FIO_SQPOLL_CPU="${FIO_SQPOLL_CPU:-}"     # pin SQPOLL kthread to this CPU
STRESS_TASKSET="${STRESS_TASKSET:-}"     # taskset mask for stress-ng
STRESS_CPUS="${STRESS_CPUS:-$CORES}"     # number of stress-ng cpu workers
STRESS_METHOD="${STRESS_METHOD:-}"       # stress-ng --cpu-method (e.g. matrixprod)
WARMUP_SECS="${WARMUP_SECS:-0}"          # if >0, run a throwaway fio first

# Load schedule (seconds, relative to each fio start)
LOAD1_START=${LOAD1_START:-15}
LOAD1_DUR=${LOAD1_DUR:-10}
LOAD2_START=${LOAD2_START:-40}
LOAD2_DUR=${LOAD2_DUR:-10}

# ---------------- pre-flight ----------------
[ "$EUID" -eq 0 ] || { echo "Run with sudo." >&2; exit 1; }
for t in stress-ng jq python3; do
  command -v "$t" >/dev/null || { echo "Missing: $t" >&2; exit 1; }
done

# Resolve FIO to an absolute, executable path
if [ -x "$FIO" ]; then
  FIO=$(readlink -f "$FIO")
elif command -v "$FIO" >/dev/null 2>&1; then
  FIO=$(command -v "$FIO")
else
  echo "FIO=$FIO is not executable. Set FIO=/path/to/patched/fio." >&2
  exit 1
fi
echo "fio binary: $FIO ($("$FIO" --version 2>/dev/null | head -1))"

# Verify the patched binary actually has --adaptive_mode
if ! "$FIO" --enghelp=io_uring 2>/dev/null | grep -q '^adaptive_mode'; then
  echo "ERROR: $FIO does not expose adaptive_mode." >&2
  echo "  Build the patched fio first: cd ~/fio && make -j" >&2
  echo "  Or point FIO at the right binary: FIO=~/fio/fio bash $0" >&2
  exit 1
fi

if [ "$RUNTIME" -lt $((LOAD2_START + LOAD2_DUR + 5)) ]; then
  echo "WARN: RUNTIME=$RUNTIME may end before second load burst completes." >&2
fi

poll_q=$(cat /sys/module/nvme/parameters/poll_queues 2>/dev/null || echo 0)
echo "env: $(uname -r), nproc=$CORES, poll_queues=$poll_q"
if [ "$poll_q" = "0" ] && [ "$SKIP_IOPOLL" != "1" ]; then
  echo "  NOTE: nvme.poll_queues=0 → IOPOLL config will fall back to interrupt path."
  echo "  set SKIP_IOPOLL=1 to skip it, or fix /etc/modprobe.d/nvme.conf and reboot."
fi

mkdir -p "$OUTDIR"

# ---------------- test file ----------------
if [ -b "$TESTFILE" ]; then
  echo "TESTFILE=$TESTFILE is a block device — raw randread (no creation)."
else
  expected=$((TESTSIZE_MB * 1024 * 1024))
  if [ ! -f "$TESTFILE" ] || [ "$(stat -c%s "$TESTFILE" 2>/dev/null)" != "$expected" ]; then
    echo "Creating $TESTFILE (${TESTSIZE_MB} MB random)..."
    dd if=/dev/urandom of="$TESTFILE" bs=1M count="$TESTSIZE_MB" status=progress
  fi
fi

command -v cpupower >/dev/null && cpupower frequency-set -g performance >/dev/null 2>&1 || true

# kill any stray load processes if we abort
cleanup() { pkill -P $$ stress-ng 2>/dev/null || true; }
trap cleanup EXIT INT TERM

# ---------------- run a single config ----------------
# Build the stress-ng command once. Keep it identical across all configs.
build_stress_cmd() {
  local dur="$1"
  local cmd=("stress-ng" "--cpu" "$STRESS_CPUS" "--timeout" "${dur}s")
  [ -n "$STRESS_METHOD" ] && cmd+=("--cpu-method" "$STRESS_METHOD")
  if [ -n "$STRESS_TASKSET" ]; then
    printf 'taskset -c %s ' "$STRESS_TASKSET"
  fi
  printf '%s ' "${cmd[@]}"
}

# Spawns the load schedule in background. Identical timing for every config.
spawn_load_schedule() {
  local stress1 stress2
  stress1=$(build_stress_cmd "$LOAD1_DUR")
  stress2=$(build_stress_cmd "$LOAD2_DUR")
  (
    sleep "$LOAD1_START"
    eval "$stress1" >/dev/null 2>&1
    sleep $((LOAD2_START - LOAD1_START - LOAD1_DUR))
    eval "$stress2" >/dev/null 2>&1
  ) &
  echo $!
}

run_one() {
  local config="$1"
  local extra="$2"
  echo
  echo "==== ${config} ===="
  echo 3 > /proc/sys/vm/drop_caches
  sleep 1   # quiesce

  local sched_pid
  sched_pid=$(spawn_load_schedule)

  local sqpoll_pin=""
  case "$config" in
    polling|adaptive)
      [ -n "$FIO_SQPOLL_CPU" ] && sqpoll_pin="--sqthread_poll_cpu=$FIO_SQPOLL_CPU"
      ;;
  esac
  local prefix=()
  [ -n "$BENCH_CPU_MASK" ] && prefix=(taskset -c "$BENCH_CPU_MASK")

  # shellcheck disable=SC2086
  "${prefix[@]}" "$FIO" --name="cmp-${config}" \
      --ioengine=io_uring \
      --rw=randread --bs=4k --direct=1 \
      --iodepth="$QD" \
      --filename="$TESTFILE" \
      --runtime="$RUNTIME" --time_based \
      --output-format=json \
      --output="$OUTDIR/cmp-${config}.json" \
      --write_bw_log="$OUTDIR/cmp-${config}" --log_avg_msec=100 \
      $extra $sqpoll_pin \
      2> "$OUTDIR/cmp-${config}.stderr"

  wait "$sched_pid" 2>/dev/null || true
}

run_warmup() {
  echo
  echo "==== warmup (${WARMUP_SECS}s, throwaway) ===="
  local prefix=()
  [ -n "$BENCH_CPU_MASK" ] && prefix=(taskset -c "$BENCH_CPU_MASK")
  echo 3 > /proc/sys/vm/drop_caches
  "${prefix[@]}" "$FIO" --name=warmup \
      --ioengine=io_uring --rw=randread --bs=4k --direct=1 \
      --iodepth="$QD" --filename="$TESTFILE" \
      --runtime="$WARMUP_SECS" --time_based \
      --sqthread_poll=1 \
      --output=/dev/null --minimal >/dev/null 2>&1 || true
}

N_CONFIGS=4
[ "$SKIP_IOPOLL" = "1" ] && N_CONFIGS=3
TOTAL_SECS=$((N_CONFIGS * (RUNTIME + 5) + WARMUP_SECS))
echo "Will run ~$((TOTAL_SECS / 60)) min total."
[ -n "$BENCH_CPU_MASK" ]   && echo "  fio pinned to CPU: $BENCH_CPU_MASK"
[ -n "$FIO_SQPOLL_CPU" ]   && echo "  SQPOLL kthread pinned to CPU: $FIO_SQPOLL_CPU"
[ -n "$STRESS_TASKSET" ]   && echo "  stress-ng pinned to CPU: $STRESS_TASKSET"
[ -n "$STRESS_METHOD" ]    && echo "  stress-ng method: $STRESS_METHOD"
echo "  stress-ng workers: $STRESS_CPUS"

[ "$WARMUP_SECS" -gt 0 ] && run_warmup

run_one polling   "--sqthread_poll=1"
run_one interrupt ""
[ "$SKIP_IOPOLL" = "1" ] || run_one iopoll "--hipri=1"
run_one adaptive  "--adaptive_mode=$ADAPT_OPT"

# ---------------- parse → TS-ready blocks ----------------
echo
echo "============================================================"
echo "  PASTE BACK TO experiments.ts"
echo "  env: $(uname -r), nproc=$CORES, poll_queues=$poll_q,"
echo "       runtime=${RUNTIME}s, qd=${QD}, adapt=$ADAPT_OPT"
echo "       load schedule: stress at t=${LOAD1_START}s (+${LOAD1_DUR}s),"
echo "                                     t=${LOAD2_START}s (+${LOAD2_DUR}s)"
echo "============================================================"

# Configs that actually ran (skip iopoll if disabled)
CONFIGS=(polling interrupt)
[ "$SKIP_IOPOLL" = "1" ] || CONFIGS+=(iopoll)
CONFIGS+=(adaptive)

echo
echo "// ---- cmpSummary (per-config integrated metrics) ----"
for config in "${CONFIGS[@]}"; do
  json="$OUTDIR/cmp-${config}.json"
  [ -f "$json" ] || { echo "  // MISSING: $json"; continue; }
  iops=$(jq '.jobs[0].read.iops' "$json")
  mbps=$(jq '.jobs[0].read.bw_bytes / 1048576' "$json")
  mean_us=$(jq '.jobs[0].read.lat_ns.mean / 1000' "$json")
  p99_us=$(jq '.jobs[0].read.clat_ns.percentile."99.000000" / 1000' "$json")
  p999_us=$(jq '.jobs[0].read.clat_ns.percentile."99.900000" / 1000' "$json")
  usr=$(jq '.jobs[0].usr_cpu' "$json")
  sys=$(jq '.jobs[0].sys_cpu' "$json")
  printf "  { config: '%s', iops: %.0f, mbps: %.1f, meanUs: %.1f, p99Us: %.1f, p999Us: %.1f, usrCpu: %.1f, sysCpu: %.1f },\n" \
    "$config" "$iops" "$mbps" "$mean_us" "$p99_us" "$p999_us" "$usr" "$sys"
done

echo
echo "// ---- cmpBwTimeline (MB/s, 100ms buckets, merged across configs) ----"
echo "// schema: { tMs, polling?, interrupt?, iopoll?, adaptive? }"
python3 - "$OUTDIR" "${CONFIGS[@]}" <<'PY'
import sys, glob
from collections import defaultdict

outdir = sys.argv[1]
configs = sys.argv[2:]
data = defaultdict(dict)

for cfg in configs:
    files = sorted(glob.glob(f"{outdir}/cmp-{cfg}_bw.*.log"))
    if not files:
        print(f"  // MISSING bw log for {cfg}")
        continue
    with open(files[0]) as f:
        for line in f:
            parts = [p.strip() for p in line.split(',')]
            if len(parts) < 2:
                continue
            try:
                t = int(parts[0])
                mbps = float(parts[1]) / 1024
            except ValueError:
                continue
            data[t][cfg] = mbps

for t in sorted(data):
    row = data[t]
    pieces = [f"tMs: {t}"]
    for cfg in configs:
        if cfg in row:
            pieces.append(f"{cfg}: {row[cfg]:.1f}")
    print(f"  {{ {', '.join(pieces)} }},")
PY

echo
echo "// ---- cmpAdaptiveTimeline (mode transitions for the adaptive config) ----"
echo "  { tMs: 0, mode: 'polling' },"
if [ -f "$OUTDIR/cmp-adaptive.stderr" ]; then
  grep -E "adaptive switch -> (polling|interrupt) at t=" "$OUTDIR/cmp-adaptive.stderr" | \
    sed -E "s/.*adaptive switch -> ([a-z]+) at t=([0-9]+) ms.*/  { tMs: \2, mode: '\1' },/"
fi

echo
echo "// ---- cmpLoadSchedule (annotation overlay for charts) ----"
printf "  { tMs: 0, label: 'idle' },\n"
printf "  { tMs: %d, label: 'stress-1 start' },\n" $((LOAD1_START * 1000))
printf "  { tMs: %d, label: 'stress-1 end' },\n"   $(((LOAD1_START + LOAD1_DUR) * 1000))
printf "  { tMs: %d, label: 'stress-2 start' },\n" $((LOAD2_START * 1000))
printf "  { tMs: %d, label: 'stress-2 end' },\n"   $(((LOAD2_START + LOAD2_DUR) * 1000))

echo
echo "Done. Per-config artifacts in $OUTDIR/"
