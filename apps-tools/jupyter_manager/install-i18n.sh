#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
python3 -m pip install --break-system-packages --no-deps -r "$SCRIPT_DIR/requirements-i18n.txt"
