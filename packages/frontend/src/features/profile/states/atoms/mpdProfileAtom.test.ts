import { create } from "@bufbuild/protobuf";
import {
	type MpdProfile,
	MpdProfileSchema,
	type MpdProfileState,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";
import {
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME,
} from "../../../common/const/deviceSettingKeys";
import type { DeviceSettingsRepository } from "../../../common/repositories/DeviceSettingsRepository";
import { deviceSettingsRepositoryAtom } from "../../../common/states/atoms/deviceSettingsRepositoryAtom";

import {
	currentMpdProfileAtom,
	mpdProfileStateAsyncAtom,
} from "./mpdProfileAtom";
import { selectedProfileNameAtom } from "./selectedProfileNameAtom";

const selectedProfileNameKey = buildDeviceSettingKey(
	DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME,
);

function createFakeDeviceSettingsRepository(
	initial: Record<string, unknown> = {},
): DeviceSettingsRepository {
	const backing = new Map<string, unknown>(Object.entries(initial));
	return {
		get: vi.fn((key: string, defaultValue?: unknown) =>
			backing.has(key) ? backing.get(key) : defaultValue,
		) as DeviceSettingsRepository["get"],
		set: vi.fn((key: string, value: unknown) => {
			backing.set(key, value);
		}) as DeviceSettingsRepository["set"],
		remove: vi.fn((key: string) => {
			backing.delete(key);
		}) as DeviceSettingsRepository["remove"],
		listKeys: vi.fn((prefix: string) =>
			[...backing.keys()].filter((key) => key.startsWith(prefix)),
		) as DeviceSettingsRepository["listKeys"],
	};
}

function buildProfile(name: string): MpdProfile {
	return create(MpdProfileSchema, { name, host: "localhost", port: 6600 });
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Builds a store with mpdProfileStateAsyncAtom pre-resolved (bypassing the
 * repository fetch) and lets the async->sync unwrap settle, so
 * currentMpdProfileAtom can be read synchronously afterwards.
 */
async function createReadyStore(params: {
	state: MpdProfileState;
	selectedProfileName?: string;
}) {
	const store = createStore();
	store.set(
		deviceSettingsRepositoryAtom,
		createFakeDeviceSettingsRepository(
			params.selectedProfileName === undefined
				? {}
				: { [selectedProfileNameKey]: params.selectedProfileName },
		),
	);
	store.set(mpdProfileStateAsyncAtom, Promise.resolve(params.state));
	store.get(currentMpdProfileAtom); // primes the unwrap promise cache
	await flush();
	return store;
}

describe("currentMpdProfileAtom", () => {
	it("re-evaluates when selectedProfileNameAtom changes (reactivity regression)", async () => {
		const profileA = buildProfile("A");
		const profileB = buildProfile("B");
		const state = create(MpdProfileStateSchema, {
			currentProfile: profileA,
			profiles: [profileA, profileB],
		});
		const store = await createReadyStore({ state });

		expect(store.get(currentMpdProfileAtom)?.name).toBe("A");

		store.set(selectedProfileNameAtom, "B");

		expect(store.get(currentMpdProfileAtom)?.name).toBe("B");
	});

	it("uses the device-selected profile when it is present in the list", async () => {
		const profileA = buildProfile("A");
		const profileB = buildProfile("B");
		const state = create(MpdProfileStateSchema, {
			currentProfile: profileA,
			profiles: [profileA, profileB],
		});
		const store = await createReadyStore({ state, selectedProfileName: "B" });

		expect(store.get(currentMpdProfileAtom)?.name).toBe("B");
	});

	it("falls back to the server default when the device value is absent from the list", async () => {
		const profileA = buildProfile("A");
		const profileB = buildProfile("B");
		const state = create(MpdProfileStateSchema, {
			currentProfile: profileA,
			profiles: [profileA, profileB],
		});
		const store = await createReadyStore({
			state,
			selectedProfileName: "Deleted",
		});

		expect(store.get(currentMpdProfileAtom)?.name).toBe("A");
	});

	it("falls back to the first profile when the server default is itself absent from the list", async () => {
		const profileA = buildProfile("A");
		const profileB = buildProfile("B");
		const staleDefault = buildProfile("Stale");
		const state = create(MpdProfileStateSchema, {
			currentProfile: staleDefault,
			profiles: [profileA, profileB],
		});
		const store = await createReadyStore({ state });

		expect(store.get(currentMpdProfileAtom)?.name).toBe("A");
	});

	it("returns undefined when there are no profiles", async () => {
		const state = create(MpdProfileStateSchema, { profiles: [] });
		const store = await createReadyStore({ state });

		expect(store.get(currentMpdProfileAtom)).toBeUndefined();
	});
});
