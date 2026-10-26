#!/usr/bin/env bash
# Usage: scripts/preview.sh [start|stop|restart|status]  (env PORT, default 8000)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-8000}"
RUN="$ROOT/.preview"
PID="$RUN/server.pid"

running() { [[ -f "$PID" ]] && kill -0 "$(cat "$PID")" 2>/dev/null; }

start() {
  if running; then echo "sudah jalan (pid $(cat "$PID")): http://localhost:$PORT/prototypes/"; return; fi
  node "$ROOT/scripts/build.js"
  mkdir -p "$RUN"
  ln -sfn "$ROOT/dist" "$RUN/prototypes"
  nohup python3 -m http.server "$PORT" -d "$RUN" >"$RUN/server.log" 2>&1 &
  echo $! >"$PID"
  echo "jalan (pid $!): http://localhost:$PORT/prototypes/"
}

stop() {
  if running; then kill "$(cat "$PID")"; echo "dimatikan"; else echo "gak jalan"; fi
  rm -f "$PID"
}

case "${1:-start}" in
  start) start ;;
  stop) stop ;;
  restart) stop; start ;;
  status) if running; then echo "jalan (pid $(cat "$PID")): http://localhost:$PORT/prototypes/"; else echo "gak jalan"; fi ;;
  *) echo "usage: $0 [start|stop|restart|status]" >&2; exit 1 ;;
esac
