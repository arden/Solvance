#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

# Check Node.js version
REQUIRED_NODE_VERSION="20.9.0"
CURRENT_NODE_VERSION=$(node -v | cut -d'v' -f2)

if [[ $(printf '%s\n%s' "$REQUIRED_NODE_VERSION" "$CURRENT_NODE_VERSION" | sort -V | head -n1) != "$REQUIRED_NODE_VERSION" ]]; then
    echo "Error: Node.js version $CURRENT_NODE_VERSION is too old. Next.js 16 requires at least v$REQUIRED_NODE_VERSION."
    echo "Please upgrade your Node.js version."
    exit 1
fi

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only

echo "Building the project..."
npx next build

echo "Build completed successfully!"
