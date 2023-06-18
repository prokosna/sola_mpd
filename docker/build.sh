#! /bin/bash

set -e

NO_CACHE_OPT=""
if [[ "$1" == "--no-cache" ]]; then
  NO_CACHE_OPT="--no-cache"
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." || exit; pwd -P)"
source "${ROOT_DIR}/docker/const.sh"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

UNIQUE_TAG="$(date +'%Y-%m-%d')-$(git describe --always)"
UNIQUE_IMAGE_NAME="${IMAGE_PREFIX}:${UNIQUE_TAG}"

docker build $NO_CACHE_OPT -f "${DIR}/Dockerfile" -t "$UNIQUE_IMAGE_NAME" "$ROOT_DIR"
docker tag "$UNIQUE_IMAGE_NAME" "$IMAGE_NAME"
