import { create } from "@bufbuild/protobuf";
import {
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";
import type { DeviceSettingsRepository } from "../../../common";
import {
	buildDeviceProfileSettingKey,
	deviceSettingsRepositoryAtom,
} from "../../../common";
import type { MpdProfileStateRepository } from "../../repositories/MpdProfileStateRepository";
import {
	mpdProfileStateAsyncAtom,
	mpdProfileStateAtom,
} from "../atoms/mpdProfileAtom";
import { mpdProfileStateRepositoryAtom } from "../atoms/mpdProfileStateRepositoryAtom";

import { deleteMpdProfileActionAtom } from "./deleteMpdProfileActionAtom";

function createFakeMpdProfileStateRepository(): MpdProfileStateRepository {
	return {
		fetch: vi.fn(),
		save: vi.fn().mockResolvedValue(undefined),
	};
}

function createFakeDeviceSettingsRepository(
	initialKeys: string[] = [],
): DeviceSettingsRepository {
	const backing = new Set(initialKeys);
	return {
		get: vi.fn() as DeviceSettingsRepository["get"],
		set: vi.fn() as DeviceSettingsRepository["set"],
		remove: vi.fn((key: string) => {
			backing.delete(key);
		}) as DeviceSettingsRepository["remove"],
		listKeys: vi.fn((prefix: string) =>
			[...backing].filter((key) => key.startsWith(prefix)),
		) as DeviceSettingsRepository["listKeys"],
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("deleteMpdProfileActionAtom", () => {
	it("removes the profile, persists, updates local state, and sweeps its device settings", async () => {
		const store = createStore();
		const mpdProfileStateRepository = createFakeMpdProfileStateRepository();
		store.set(mpdProfileStateRepositoryAtom, mpdProfileStateRepository);
		const deletedKey = buildDeviceProfileSettingKey(
			"Home",
			"browserLastPosition",
		);
		const keptKey = buildDeviceProfileSettingKey(
			"Office",
			"browserLastPosition",
		);
		const deviceSettingsRepository = createFakeDeviceSettingsRepository([
			deletedKey,
			keptKey,
		]);
		store.set(deviceSettingsRepositoryAtom, deviceSettingsRepository);

		const profileHome = create(MpdProfileSchema, {
			name: "Home",
			host: "localhost",
			port: 6600,
		});
		const profileOffice = create(MpdProfileSchema, {
			name: "Office",
			host: "localhost",
			port: 6601,
		});
		const state = create(MpdProfileStateSchema, {
			currentProfile: profileHome,
			profiles: [profileHome, profileOffice],
		});
		store.set(mpdProfileStateAsyncAtom, Promise.resolve(state));

		await store.set(deleteMpdProfileActionAtom, { profileName: "Home" });

		expect(mpdProfileStateRepository.save).toHaveBeenCalledTimes(1);
		const savedState = (
			mpdProfileStateRepository.save as ReturnType<typeof vi.fn>
		).mock.calls[0][0];
		expect(savedState.profiles.map((p: { name: string }) => p.name)).toEqual([
			"Office",
		]);

		store.get(mpdProfileStateAtom); // primes the async->sync unwrap
		await flush();
		expect(store.get(mpdProfileStateAtom)?.profiles.map((p) => p.name)).toEqual(
			["Office"],
		);

		expect(deviceSettingsRepository.remove).toHaveBeenCalledWith(deletedKey);
		expect(
			deviceSettingsRepository.listKeys("sola:v1:device:profile:"),
		).toEqual([keptKey]);
	});

	it("does nothing when the profile is not found", async () => {
		const store = createStore();
		const mpdProfileStateRepository = createFakeMpdProfileStateRepository();
		store.set(mpdProfileStateRepositoryAtom, mpdProfileStateRepository);
		const deviceSettingsRepository = createFakeDeviceSettingsRepository();
		store.set(deviceSettingsRepositoryAtom, deviceSettingsRepository);

		const profileHome = create(MpdProfileSchema, {
			name: "Home",
			host: "localhost",
			port: 6600,
		});
		const state = create(MpdProfileStateSchema, {
			currentProfile: profileHome,
			profiles: [profileHome],
		});
		store.set(mpdProfileStateAsyncAtom, Promise.resolve(state));

		await store.set(deleteMpdProfileActionAtom, {
			profileName: "NonExistent",
		});

		expect(mpdProfileStateRepository.save).not.toHaveBeenCalled();
		expect(deviceSettingsRepository.remove).not.toHaveBeenCalled();
	});

	it("does not sweep when persisting the deletion fails", async () => {
		const store = createStore();
		const mpdProfileStateRepository: MpdProfileStateRepository = {
			fetch: vi.fn(),
			save: vi.fn().mockRejectedValue(new Error("network error")),
		};
		store.set(mpdProfileStateRepositoryAtom, mpdProfileStateRepository);
		const deviceSettingsRepository = createFakeDeviceSettingsRepository([
			buildDeviceProfileSettingKey("Home", "browserLastPosition"),
		]);
		store.set(deviceSettingsRepositoryAtom, deviceSettingsRepository);

		const profileHome = create(MpdProfileSchema, {
			name: "Home",
			host: "localhost",
			port: 6600,
		});
		const profileOffice = create(MpdProfileSchema, {
			name: "Office",
			host: "localhost",
			port: 6601,
		});
		const state = create(MpdProfileStateSchema, {
			currentProfile: profileHome,
			profiles: [profileHome, profileOffice],
		});
		store.set(mpdProfileStateAsyncAtom, Promise.resolve(state));

		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		await store.set(deleteMpdProfileActionAtom, { profileName: "Home" });

		expect(deviceSettingsRepository.remove).not.toHaveBeenCalled();

		errorSpy.mockRestore();
	});
});
