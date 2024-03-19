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

PARENT_DIR="$(cd "$(dirname "$0")/../../.." || exit; pwd -P)"
cp -r ${PARENT_DIR}/src/proto ${ROOT_DIR}/temp_proto

docker build $NO_CACHE_OPT -f "${DIR}/Dockerfile" -t "$UNIQUE_IMAGE_NAME" "$ROOT_DIR"
docker tag "$UNIQUE_IMAGE_NAME" "$IMAGE_NAME"

rm -rf ${ROOT_DIR}/temp_proto
