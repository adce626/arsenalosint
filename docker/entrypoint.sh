#!/bin/sh
# Generates public/app.config.json from the container environment so the
# Google Maps key lives in .env and never needs to be committed.
#
# Rules:
#   - If GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_MAP_ID is set, (re)write the
#     config file from them.
#   - If neither is set, leave any existing config file alone (a user may
#     maintain public/app.config.json by hand) and log what happened, so
#     an empty or missing .env is visible in `docker compose logs` instead
#     of silently blanking the key.
#
# APP_MODE=dev runs the Next.js dev server (hot reload, source mounted);
# otherwise the prebuilt standalone server is started (production image).

CONFIG=/app/public/app.config.json

if [ -n "$GOOGLE_MAPS_API_KEY" ] || [ -n "$GOOGLE_MAPS_MAP_ID" ]; then
  cat > "$CONFIG" <<EOF
{
  "googleMaps": {
    "apiKey": "${GOOGLE_MAPS_API_KEY}",
    "mapId": "${GOOGLE_MAPS_MAP_ID}"
  }
}
EOF
  echo "[entrypoint] Wrote $CONFIG from environment (.env)."
elif [ -f "$CONFIG" ]; then
  echo "[entrypoint] GOOGLE_MAPS_API_KEY not set - keeping existing $CONFIG untouched."
else
  echo "[entrypoint] GOOGLE_MAPS_API_KEY not set and no $CONFIG present."
  echo "[entrypoint] Google Maps mode will ask for a key in the app; OpenStreetMap mode works without one."
fi

if [ "$APP_MODE" = "dev" ]; then
  echo "[entrypoint] APP_MODE=dev -> starting Next.js dev server."
  exec npm run dev -- -H 0.0.0.0
fi

echo "[entrypoint] Starting production server on port ${PORT:-5173}."
exec node server.js
