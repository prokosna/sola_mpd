#! /bin/bash

set -e

PORT_OPT="3001"
NETWORK_MODE="bridge"
RESTART_OPT="no"
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --port)
      PORT_OPT="$2"
      shift 2
      ;;
    --host)
      NETWORK_MODE="host"
      shift
      ;;
    --always)
      RESTART_OPT="always"
      shift
      ;;
    *)
      echo "Unknown parameter passed: $1"
      exit 1
      ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "$0")/.." || exit; pwd -P)"
source "$ROOT_DIR/docker/const.sh"

EXTRA_ARGS=(
  --name "${CONTAINER_NAME}"
  -e "USER=$USER"
)

if [[ "$NETWORK_MODE" = "host" ]]; then
  EXTRA_ARGS+=("--network" "host" "-e" "PORT=$PORT_OPT" "--restart=$RESTART_OPT")
else
  EXTRA_ARGS+=("-p" "$PORT_OPT:3001" "-e" "PORT=$PORT_OPT" "--restart=$RESTART_OPT")
fi

docker run -id "${EXTRA_ARGS[@]}" $IMAGE_NAME
