import { useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/persistent";
import { fetchOutputDevices } from "../helpers/api";

const outputDevicesAtom = atomWithRefresh(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);

  if (currentMpdProfile === undefined) {
    return undefined;
  }

  return await fetchOutputDevices(mpdClient, currentMpdProfile);
});

const unwrappedOutputDevicesAtom = unwrap(
  outputDevicesAtom,
  (prev) => prev || undefined,
);

export function useOutputDevicesState() {
  return useAtomValue(unwrappedOutputDevicesAtom);
}

export function useRefreshOutputDevicesState() {
  return useSetAtom(outputDevicesAtom);
}
