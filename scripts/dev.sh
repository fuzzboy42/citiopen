#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d .venv ]]; then
  echo "Run ./scripts/setup-dev.sh first."
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

trap 'kill 0' INT TERM EXIT

echo "Backend:  http://127.0.0.1:8000"
echo "Frontend: http://127.0.0.1:3000 (proxies API to :8000)"
echo "Press Ctrl+C to stop both."

.venv/bin/python manage.py runserver &
(cd frontend && npm start)
