#! /bin/bash

set -e

PORT_OPT="3001"
if [[ "$1" == "--port" ]]; then
  PORT_OPT="$2"
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." || exit; pwd -P)"
source "$ROOT_DIR/docker/const.sh"

EXTRA_ARGS=(
  --name "${CONTAINER_NAME}"
  -e "USER=$USER"
  -p $PORT_OPT:3001
)

docker run -id --rm "${EXTRA_ARGS[@]}" $IMAGE_NAME
