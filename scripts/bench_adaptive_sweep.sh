#!/bin/bash
# bench_adaptive_sweep.sh — Part 4 의 두 차트 (adaptiveQdLatency,
# adaptiveComparison) 를 실제 측정값으로 채우기 위한 sweep.
#
# Phase 1: QD sweep (5 QD × 3 모드 = 15 runs) → adaptiveQdLatency
#   - adaptive C 5 runs (QD=1,4,16,64,256)
#   - fio interrupt 5 runs (같은 QD)
#   - fio SQPOLL 5 runs (같은 QD)
#
# Phase 2: CPU 부하 sweep (3 부하 × 3 모드 = 9 runs) → adaptiveComparison
#   - adaptive C / fio int / fio sqp 각각 idle, 50%, 100% 부하에서
#
# 출력: results-adaptive/ 안에 raw 파일들 + stdout 마지막에 TS 블록 두 개.
#
# usage (베어메탈 권장):
#   chmod +x scripts/bench_adaptive_sweep.sh
#   sudo bash scripts/bench_adaptive_sweep.sh
#   sudo TESTFILE=/dev/nvme0n1 bash scripts/bench_adaptive_sweep.sh
#   sudo RUNTIME_FIO=15 bash scripts/bench_adaptive_sweep.sh   # 빠르게
#
# 필요한 패키지: fio, stress-ng, jq, liburing-dev

set -u
TESTFILE="${TESTFILE:-/tmp/bench_testfile}"
TESTSIZE_MB="${TESTSIZE_MB:-1024}"
RUNTIME_FIO="${RUNTIME_FIO:-20}"
OUTDIR="${OUTDIR:-results-adaptive}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BENCH="$SCRIPT_DIR/bench_adaptive"

QDS=(1 4 16 64 256)

[ "$EUID" -eq 0 ] || { echo "Run with sudo." >&2; exit 1; }
for t in fio stress-ng jq gcc; do
  command -v "$t" >/dev/null || { echo "Missing tool: $t" >&2; exit 1; }
done

# bench_adaptive 자동 빌드
if [ ! -x "$BENCH" ] || [ "$SCRIPT_DIR/bench_adaptive.c" -nt "$BENCH" ]; then
  echo "Building bench_adaptive..."
  gcc -O2 -o "$BENCH" "$SCRIPT_DIR/bench_adaptive.c" -luring \
    || { echo "Build failed." >&2; exit 1; }
fi

# 테스트 파일 준비
if [ -b "$TESTFILE" ]; then
  echo "TESTFILE=$TESTFILE — block device 사용."
else
  expected=$((TESTSIZE_MB * 1024 * 1024))
  if [ ! -f "$TESTFILE" ] || [ "$(stat -c%s "$TESTFILE" 2>/dev/null)" != "$expected" ]; then
    echo "Creating $TESTFILE (${TESTSIZE_MB} MB)..."
    dd if=/dev/urandom of="$TESTFILE" bs=1M count="$TESTSIZE_MB" status=progress
  fi
fi

# 성능 모드 (있으면)
command -v cpupower >/dev/null && \
  cpupower frequency-set -g performance >/dev/null 2>&1 || true

mkdir -p "$OUTDIR"

CORES=$(nproc)
HALF=$((CORES / 2))

run_fio() {
  local name="$1" extra="$2" qd="$3" outpath="$4"
  echo 3 > /proc/sys/vm/drop_caches
  # shellcheck disable=SC2086
  fio --name="$name" --ioengine=io_uring \
      --rw=randread --bs=4k --direct=1 \
      --iodepth="$qd" --filename="$TESTFILE" \
      --runtime="$RUNTIME_FIO" --time_based \
      --output-format=json --output="$outpath" \
      $extra >/dev/null
}

run_adaptive() {
  local qd="$1" outpath="$2"
  echo 3 > /proc/sys/vm/drop_caches
  "$BENCH" "$TESTFILE" "$qd" > "$outpath" 2>&1
}

# ──────────────────────────────────────────────
# Phase 1: QD sweep
# ──────────────────────────────────────────────
echo
echo "==== Phase 1: QD sweep ($((${#QDS[@]} * 3)) runs) ===="

for qd in "${QDS[@]}"; do
  echo ">>> adaptive QD=$qd"
  run_adaptive "$qd" "$OUTDIR/adaptive-qd${qd}.txt"

  echo ">>> fio interrupt QD=$qd"
  run_fio "int-qd${qd}" "" "$qd" "$OUTDIR/fio-int-qd${qd}.json"

  echo ">>> fio sqpoll QD=$qd"
  run_fio "sqp-qd${qd}" "--sqthread_poll=1" "$qd" "$OUTDIR/fio-sqp-qd${qd}.json"
done

# ──────────────────────────────────────────────
# Phase 2: CPU 부하 sweep (QD=16 고정)
# ──────────────────────────────────────────────
echo
echo "==== Phase 2: CPU load × mode (9 runs at QD=16) ===="

cpu_run() {
  local stress_n="$1" label="$2"
  local stress_pid=""
  if [ "$stress_n" -gt 0 ]; then
    stress-ng --cpu "$stress_n" --timeout 90s >/dev/null 2>&1 &
    stress_pid=$!
    sleep 1
  fi

  echo ">>> adaptive cpu=$label"
  run_adaptive 16 "$OUTDIR/adaptive-cpu${label}.txt"

  echo ">>> fio interrupt cpu=$label"
  run_fio "int-cpu${label}" "" 16 "$OUTDIR/fio-int-cpu${label}.json"

  echo ">>> fio sqpoll cpu=$label"
  run_fio "sqp-cpu${label}" "--sqthread_poll=1" 16 \
    "$OUTDIR/fio-sqp-cpu${label}.json"

  if [ -n "$stress_pid" ]; then
    kill "$stress_pid" 2>/dev/null
    wait "$stress_pid" 2>/dev/null
  fi
}

cpu_run 0          "idle"
cpu_run "$HALF"    "50"
cpu_run "$CORES"   "100"

# ──────────────────────────────────────────────
# 결과 파싱 → TS 블록 출력
# ──────────────────────────────────────────────
echo
echo "============================================================"
echo "  PASTE BACK TO src/data/experiments.ts"
echo "  env: $(uname -r), $CORES cores, runtime ${RUNTIME_FIO}s (fio), 10s (adaptive)"
echo "============================================================"

grep_value() {
  # grep_value "<file>" "<prefix>"
  grep -oP "(?<=^$2: )[0-9.]+" "$1" | head -1
}

echo
echo "// ---- adaptiveQdLatency (μs, mean) — Bench/Arch 실측 ----"
echo "export const adaptiveQdLatency: AdaptiveQdPoint[] = ["
for qd in "${QDS[@]}"; do
  int_lat=$(jq '.jobs[0].read.lat_ns.mean / 1000' "$OUTDIR/fio-int-qd${qd}.json")
  sqp_lat=$(jq '.jobs[0].read.lat_ns.mean / 1000' "$OUTDIR/fio-sqp-qd${qd}.json")
  adp_lat=$(grep_value "$OUTDIR/adaptive-qd${qd}.txt" "Mean latency")
  printf "  { qd: %d, fioInterrupt: %.1f, fioSqpoll: %.1f, adaptiveC: %s },\n" \
    "$qd" "$int_lat" "$sqp_lat" "$adp_lat"
done
echo "];"

echo
echo "// ---- adaptiveComparison (MB/s) — Bench/Arch 실측 ----"
echo "export const adaptiveComparison: AdaptiveComparisonPoint[] = ["
for pair in "Idle:idle" "50%:50" "100%:100"; do
  label="${pair%%:*}"; key="${pair##*:}"
  int_bw=$(jq '.jobs[0].read.bw_bytes / 1048576' "$OUTDIR/fio-int-cpu${key}.json")
  sqp_bw=$(jq '.jobs[0].read.bw_bytes / 1048576' "$OUTDIR/fio-sqp-cpu${key}.json")
  adp_bw=$(grep_value "$OUTDIR/adaptive-cpu${key}.txt" "Throughput")
  printf "  { cpuLoad: '%s', fioInterrupt: %.0f, fioSqpoll: %.0f, adaptiveC: %s },\n" \
    "$label" "$int_bw" "$sqp_bw" "$adp_bw"
done
echo "];"

echo
echo "// ---- 보너스: adaptive 의 mode time fraction (polling %) ----"
for pair in "Idle:idle" "50%:50" "100%:100"; do
  label="${pair%%:*}"; key="${pair##*:}"
  frac=$(grep_value "$OUTDIR/adaptive-cpu${key}.txt" "Polling fraction")
  printf "// cpu=%-4s : %s%% polling\n" "$label" "$frac"
done

echo
echo "Done. Raw results in $OUTDIR/"
