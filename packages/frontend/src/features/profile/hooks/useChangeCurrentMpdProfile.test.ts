import { create } from "@bufbuild/protobuf";
import {
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { act, renderHook } from "@testing-library/react";
import { getDefaultStore } from "jotai";
import { describe, expect, it } from "vitest";

import type { DeviceSettingsRepository } from "../../common";
import { deviceSettingsRepositoryAtom } from "../../common";
import {
	currentMpdProfileAtom,
	mpdProfileStateAsyncAtom,
	mpdProfileStateAtom,
} from "../states/atoms/mpdProfileAtom";

import { useChangeCurrentMpdProfile } from "./useChangeCurrentMpdProfile";

function createFakeDeviceSettingsRepository(): DeviceSettingsRepository {
	const backing = new Map<string, unknown>();
	return {
		get: (<T>(key: string, defaultValue?: T) =>
			backing.has(key)
				? (backing.get(key) as T)
				: defaultValue) as DeviceSettingsRepository["get"],
		set: (<T>(key: string, value: T) => {
			backing.set(key, value);
		}) as DeviceSettingsRepository["set"],
		remove: (key: string) => {
			backing.delete(key);
		},
		listKeys: (prefix: string) =>
			[...backing.keys()].filter((key) => key.startsWith(prefix)),
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("useChangeCurrentMpdProfile", () => {
	it(
		"switches the device selection without writing the server-mirrored " +
			"currentProfile (regression: switching must complete via " +
			"selectedProfileName alone)",
		async () => {
			// No <Provider>, so the hook's useAtomValue/useSetAtom fall back to
			// jotai's default store — get a handle on that same store to seed
			// and assert against it.
			const store = getDefaultStore();
			store.set(
				deviceSettingsRepositoryAtom,
				createFakeDeviceSettingsRepository(),
			);

			const profileA = create(MpdProfileSchema, {
				name: "A",
				host: "localhost",
				port: 6600,
			});
			const profileB = create(MpdProfileSchema, {
				name: "B",
				host: "localhost",
				port: 6601,
			});
			const state = create(MpdProfileStateSchema, {
				currentProfile: profileA,
				profiles: [profileA, profileB],
			});
			store.set(mpdProfileStateAsyncAtom, Promise.resolve(state));
			store.get(mpdProfileStateAtom); // primes the async->sync unwrap
			await flush();

			const { result } = renderHook(() => useChangeCurrentMpdProfile());

			await act(async () => {
				await result.current("B");
			});

			expect(store.get(currentMpdProfileAtom)?.name).toBe("B");
			expect(store.get(mpdProfileStateAtom)?.currentProfile?.name).toBe("A");
		},
	);
});
