#!/usr/bin/env bash
# Serve the Grovix website at grovix.co.in through the Caddy server that
# FunnelHive already runs on this VPS (it owns ports 80/443).
#
# Run as root on the VPS:
#   curl -fsSL https://raw.githubusercontent.com/agarwalyash835-cell/website/claude/grovix-website-redesign-8jxcc5/deploy/vps-setup.sh | bash
#
# Safe to re-run: it pulls the latest site files and only adds the config once.
set -euo pipefail

REPO=https://github.com/agarwalyash835-cell/website.git
BRANCH=claude/grovix-website-redesign-8jxcc5
SITE_DIR=/opt/grovix-site
FH_DIR=/opt/funnelhive
CADDYFILE="$FH_DIR/deploy/Caddyfile"
OVERRIDE="$FH_DIR/docker-compose.override.yml"

# 1. Fetch or update the site files
if [ -d "$SITE_DIR/.git" ]; then
  echo "Updating site files in $SITE_DIR"
  git -C "$SITE_DIR" pull --ff-only
else
  echo "Downloading site files to $SITE_DIR"
  git clone --depth 1 --branch "$BRANCH" "$REPO" "$SITE_DIR"
fi

cd "$FH_DIR"

if grep -q "grovix.co.in" "$CADDYFILE" && [ -f "$OVERRIDE" ] && grep -q "/srv/grovix" "$OVERRIDE"; then
  echo "Caddy is already set up for grovix.co.in. Site files updated; nothing else to do."
  exit 0
fi

# 2. Back up FunnelHive's Caddy and compose overrides
ts=$(date +%Y%m%d-%H%M%S)
cp "$CADDYFILE" "$CADDYFILE.bak-$ts"
echo "Backed up Caddyfile to $CADDYFILE.bak-$ts"
if [ -f "$OVERRIDE" ]; then
  if ! grep -q "/srv/grovix" "$OVERRIDE"; then
    echo "ERROR: $OVERRIDE already exists. Add this volume to the caddy service by hand, then re-run:"
    echo "      - $SITE_DIR:/srv/grovix:ro"
    exit 1
  fi
fi

restore() {
  echo "Restoring previous Caddy config"
  cp "$CADDYFILE.bak-$ts" "$CADDYFILE"
  if [ "${created_override:-0}" = 1 ]; then rm -f "$OVERRIDE"; fi
}

# 3. Add the grovix.co.in site block
if ! grep -q "grovix.co.in" "$CADDYFILE"; then
  cat >> "$CADDYFILE" <<'EOF'

# Grovix website: static files from /opt/grovix-site
www.grovix.co.in {
	redir https://grovix.co.in{uri} permanent
}

grovix.co.in {
	root * /srv/grovix
	encode zstd gzip
	@private path /.git* /deploy/* /README.md
	respond @private 404
	file_server
}
EOF
fi

# 4. Mount the site files into the Caddy container
if [ ! -f "$OVERRIDE" ]; then
  cat > "$OVERRIDE" <<EOF
services:
  caddy:
    volumes:
      - $SITE_DIR:/srv/grovix:ro
EOF
  created_override=1
fi

# 5. Check the config before touching the running server
if ! docker compose --profile https run --rm --no-deps --entrypoint caddy caddy \
     validate --config /etc/caddy/Caddyfile --adapter caddyfile; then
  echo "ERROR: Caddy config check failed. Nothing was changed on the running server."
  restore
  exit 1
fi

# 6. Recreate only the Caddy container (FunnelHive app keeps running)
docker compose --profile https up -d --no-deps caddy

echo
echo "Done. Caddy now serves grovix.co.in from $SITE_DIR."
echo "HTTPS certificates are issued automatically once grovix.co.in points to this server."
