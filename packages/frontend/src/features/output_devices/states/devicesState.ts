import { useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchOutputDevices } from "../utils/outputDeviceUtils";

/**
 * Atom for MPD output devices.
 *
 * Fetches and manages device state.
 */
const outputDevicesAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileSyncAtom);

	if (profile === undefined) {
		return undefined;
	}

	return await fetchOutputDevices(mpdClient, profile);
});

/**
 * Synchronized atom for output devices.
 *
 * Ensures consistent updates across subscribers.
 */
const outputDevicesSyncAtom = atomWithSync(outputDevicesAtom);

/**
 * Hook for output devices list.
 *
 * Provides read-only access to device states.
 *
 * @returns Current devices or undefined
 */
export function useOutputDevicesState() {
	return useAtomValue(outputDevicesSyncAtom);
}

/**
 * Hook for enabled output device.
 *
 * Returns first enabled device in list.
 *
 * @returns Enabled device or undefined
 */
export function useEnabledOutputDeviceState() {
	const outputDevices = useAtomValue(outputDevicesSyncAtom);
	return outputDevices?.find((device) => device.isEnabled);
}

/**
 * Hook for refreshing device list.
 *
 * Triggers fresh device fetch.
 *
 * @returns Refresh function
 */
export function useRefreshOutputDevicesState() {
	return useSetAtom(outputDevicesAtom);
}
