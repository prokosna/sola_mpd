#! /bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." || exit; pwd -P)"
source "$ROOT_DIR/docker/const.sh"

docker stop $CONTAINER_NAME
