import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { fetchOutputDevices } from "../../functions/outputDeviceFetching";

export const outputDevicesAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);

	if (profile === undefined) {
		return undefined;
	}

	return await fetchOutputDevices(mpdClient, profile);
});

const outputDevicesSafeAsyncAtom = atom(async (get) => {
	try {
		return await get(outputDevicesAsyncAtom);
	} catch (error) {
		console.error(error);
		return undefined;
	}
});

export const outputDevicesAtom = atomWithSync(outputDevicesSafeAsyncAtom);

export const enabledOutputDeviceAtom = atom((get) =>
	get(outputDevicesAtom)?.find((device) => device.isEnabled),
);
