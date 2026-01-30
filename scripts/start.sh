#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"

start_service() {
    cd "${COZE_WORKSPACE_PATH}"

    # Check Node.js version
    REQUIRED_NODE_VERSION="20.9.0"
    CURRENT_NODE_VERSION=$(node -v | cut -d'v' -f2)

    if [[ $(printf '%s\n%s' "$REQUIRED_NODE_VERSION" "$CURRENT_NODE_VERSION" | sort -V | head -n1) != "$REQUIRED_NODE_VERSION" ]]; then
        echo "Error: Node.js version $CURRENT_NODE_VERSION is too old. Next.js 16 requires at least v$REQUIRED_NODE_VERSION."
        echo "Please upgrade your Node.js version."
        exit 1
    fi

    echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
    npx next start --port ${DEPLOY_RUN_PORT}
}

echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
start_service
