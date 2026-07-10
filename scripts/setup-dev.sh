#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required."
  exit 1
fi

if [[ ! -d .venv ]]; then
  echo "Creating Python virtualenv in .venv ..."
  python3 -m venv .venv
fi

echo "Installing Python dependencies ..."
.venv/bin/python -m pip install --upgrade pip
.venv/bin/pip install -r requirements.txt

if [[ ! -f .env ]]; then
  echo "Creating .env from .env.example ..."
  cp .env.example .env
fi

echo "Running database migrations ..."
.venv/bin/python manage.py migrate

echo "Creating default dev login (dev.chair / devpassword) ..."
.venv/bin/python manage.py create_dev_user || true

echo "Installing frontend dependencies ..."
(cd frontend && npm install)

echo ""
echo "Setup complete. Start dev servers with:"
echo "  ./scripts/dev.sh"
echo "or in two terminals:"
echo "  .venv/bin/python manage.py runserver"
echo "  cd frontend && npm start"
