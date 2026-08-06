#!/usr/bin/env bash
# Parse every site module before publishing. PARSE only -- never execute:
# these modules touch document/location/three, so importing them off-browser
# fails for reasons that have nothing to do with whether they are valid.
#
# 2026-08-07: a scripted edit to data.js dropped a comma and the file stopped
# parsing. It was pushed live. Verification at the time grepped the deployed
# bytes for "ready: true" -- which matches happily inside broken JavaScript.
# data.js is an ES module every other module imports, so one missing comma
# took down the whole page: reels, 3D scene, cases, resume. Bytes are not syntax.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
bad=0 n=0
for f in assets/js/*.js; do
  n=$((n+1))
  if ! err=$(node --check --input-type=module < "$f" 2>&1); then
    echo "✗ $f"; echo "$err" | head -3; bad=1
  fi
done
[ "$bad" = 0 ] && echo "JS 파싱 OK ($n 모듈)"
exit $bad
