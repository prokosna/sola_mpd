#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_info() {
    echo -e "${GREEN}INFO:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

print_step "Checking Previous Volume"
if ! docker volume ls -q | grep -q "^sola_db$"; then
    print_info "sola_db volume not found"
    print_info "This script is only for users migrating from a previous version. You don't need to run this!"
    exit 0
fi

print_step "Checking New Volume"
if ! docker volume ls -q | grep -q "^sola_mpd_db$"; then
    print_info "sola_mpd_db volume not found. Creating it with docker compose..."
    docker compose create
fi

print_step "Starting Data Migration"
echo -e "${BLUE}Copying data...${NC}"
docker run --rm \
    --mount source=sola_db,target=/source \
    --mount source=sola_mpd_db,target=/target \
    alpine:latest \
    sh -c 'cp -r /source/. /target/'

print_step "Migration Complete"
print_info "Migration completed successfully! 🎉"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "You can now safely remove the old sola_db volume if you wish:"
echo -e "${GREEN}docker volume rm sola_db${NC}"
