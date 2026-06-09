#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3000}"
READY_URL="${READY_URL:-$BASE_URL}"
BRU_BIN="${BRU_BIN:-$ROOT_DIR/node_modules/.bin/bru}"
SERVER_PID=""

cleanup() {
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID"
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

wait_for_server() {
  local attempts=60

  for ((i = 1; i <= attempts; i++)); do
    if curl -fsS "$READY_URL" >/dev/null 2>&1; then
      return 0
    fi

    if [[ -n "$SERVER_PID" ]] && ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "Next.js dev server exited before $READY_URL became ready" >&2
      return 1
    fi

    sleep 1
  done

  echo "Timed out waiting for $READY_URL" >&2
  return 1
}

trap cleanup EXIT

cd "$ROOT_DIR"

if curl -fsS "$READY_URL" >/dev/null 2>&1; then
  echo "Using existing server at $BASE_URL"
else
  echo "Starting Next.js dev server at $BASE_URL"
  bun run dev --hostname "$HOST" --port "$PORT" &
  SERVER_PID="$!"
  wait_for_server
fi

(
  cd tests/e2e/bruno
  "$BRU_BIN" run --env Local --env-var "baseUrl=$BASE_URL"
)
