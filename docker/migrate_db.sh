#!/bin/bash

set -e

echo "Checking for the previous sola_db volume..."
if ! docker volume ls -q | grep -q "^sola_db$"; then
    echo "INFO: sola_db volume not found"
    echo "INFO: This script is only for users migrating from a previous version. You don't need to run this!"
    exit 0
fi

echo "Checking for the new sola_mpd_db volume..."
if ! docker volume ls -q | grep -q "^sola_mpd_db$"; then
    echo "INFO: sola_mpd_db volume not found. Creating it with docker compose..."
    docker compose up -d
    docker compose stop
fi

echo "Starting data migration..."
docker run --rm \
    --mount source=sola_db,target=/source \
    --mount source=sola_mpd_db,target=/target \
    alpine:latest \
    sh -c 'cp -r /source/. /target/'

echo "INFO: Migration completed successfully!"
echo "You can now safely remove the old sola_db volume if you wish:"
echo "docker volume rm sola_db"
