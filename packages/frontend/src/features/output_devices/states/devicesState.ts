import { useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchOutputDevices } from "../utils/outputDeviceUtils";

const outputDevicesAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return undefined;
  }

  return await fetchOutputDevices(mpdClient, profile);
});

const outputDevicesSyncAtom = atomWithSync(outputDevicesAtom);

/**
 * Hook to access the current state of output devices.
 * @returns The current state of output devices or undefined if not available.
 */
export function useOutputDevicesState() {
  return useAtomValue(outputDevicesSyncAtom);
}

/**
 * Hook to access the current enabled output device.
 * @returns The current enabled output device or undefined if not available.
 */
export function useEnabledOutputDeviceState() {
  const outputDevices = useAtomValue(outputDevicesSyncAtom);
  return outputDevices?.find((device) => device.isEnabled);
}

/**
 * Hook that returns a function to refresh the output devices state.
 * This function resets the output devices atom, triggering a re-fetch of the devices.
 * @returns A function that when called, refreshes the output devices state.
 */
export function useRefreshOutputDevicesState() {
  return useSetAtom(outputDevicesAtom);
}
