#!/usr/bin/env bash

set -euo pipefail

source .buildkite/scripts/common/util.sh

.buildkite/scripts/bootstrap.sh
.buildkite/scripts/download_build_artifacts.sh
.buildkite/scripts/setup_es_snapshot_cache.sh

export JOB=kibana-observability-onboarding-cypress

echo "--- Observability onboarding Cypress Tests"

cd "$XPACK_DIR"

node solutions/observability/plugins/observability_onboarding/scripts/test/e2e.js \
  --kibana-install-dir "$KIBANA_BUILD_LOCATION" \