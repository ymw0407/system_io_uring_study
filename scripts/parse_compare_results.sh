#!/bin/bash
# parse_compare_results.sh — Re-emit the TS-ready blocks from saved
# results-compare/ artifacts. Useful when bench_compare.sh ran but its
# stdout was lost (or you want to re-parse without re-benchmarking).
#
# usage:
#   bash scripts/parse_compare_results.sh [OUTDIR]
#   OUTDIR defaults to "results-compare"
#
# Reads from OUTDIR/cmp-{config}.json, OUTDIR/cmp-{config}_bw.*.log,
# OUTDIR/cmp-adaptive.stderr — same files bench_compare.sh produces.

set -u
OUTDIR="${1:-results-compare}"

# Schedule constants (must match bench_compare.sh defaults; override via env)
LOAD1_START=${LOAD1_START:-15}
LOAD1_DUR=${LOAD1_DUR:-10}
LOAD2_START=${LOAD2_START:-40}
LOAD2_DUR=${LOAD2_DUR:-10}

[ -d "$OUTDIR" ] || { echo "OUTDIR not found: $OUTDIR" >&2; exit 1; }
for t in jq python3; do
  command -v "$t" >/dev/null || { echo "Missing: $t" >&2; exit 1; }
done

# Auto-detect which configs have artifacts
CONFIGS=()
for c in polling interrupt iopoll adaptive; do
  [ -f "$OUTDIR/cmp-${c}.json" ] && CONFIGS+=("$c")
done

if [ "${#CONFIGS[@]}" -eq 0 ]; then
  echo "No cmp-*.json found in $OUTDIR" >&2
  exit 1
fi

echo "// configs detected: ${CONFIGS[*]}"
echo

echo "// ---- cmpSummary (per-config integrated metrics) ----"
for config in "${CONFIGS[@]}"; do
  json="$OUTDIR/cmp-${config}.json"
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
echo "// ---- latency percentiles (deeper view) ----"
for config in "${CONFIGS[@]}"; do
  echo "// --- $config ---"
  jq -r '.jobs[0].read.clat_ns.percentile | to_entries[] | "//   p\(.key): \(.value/1000) us"' "$OUTDIR/cmp-${config}.json"
done
