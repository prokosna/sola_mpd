#! /bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." || exit; pwd -P)"
source "$ROOT_DIR/docker/const.sh"

EXTRA_ARGS=(
  --name "${CONTAINER_NAME}"
  -v $ROOT_DIR/music:/music
  -v $ROOT_DIR/playlists:/playlists
  -e "USER=mpd"
  --net host
)

docker run -id --rm "${EXTRA_ARGS[@]}" $IMAGE_NAME
