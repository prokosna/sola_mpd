import { atom, useAtomValue } from "jotai";
import { unwrap } from "jotai/utils";

import { socketAtom } from "../../socketio/states/socketio";
import { MpdClient } from "../utils/MpdClient";

const mpdClientAtom = atom(async (get) => {
  const socket = await get(socketAtom);
  return MpdClient.initialize(socket);
});

const unwrappedMpdClientAtom = unwrap(
  mpdClientAtom,
  (prev) => prev || undefined,
);

export { mpdClientAtom };

export function useMpdClientState() {
  return useAtomValue(unwrappedMpdClientAtom);
}
