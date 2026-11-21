import { create } from "@bufbuild/protobuf";
import {
	type MpdProfile,
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { type Song, SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	type DeviceSettingsRepository,
	deviceSettingsRepositoryAtom,
} from "../../../common";
import type { MpdClient } from "../../../mpd";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import {
	currentMpdProfileAtom,
	mpdProfileStateAsyncAtom,
} from "../../../profile/states/atoms/mpdProfileAtom";
import { selectedProfileNameAtom } from "../../../profile/states/atoms/selectedProfileNameAtom";
import {
	type AllSongsFastProgress,
	loadAllSongsFast,
} from "../../functions/allSongsFastLoading";
import { allSongsFastStateAtom } from "../atoms/allSongsFastStateAtom";
import { loadAllSongsFastActionAtom } from "./loadAllSongsFastActionAtom";

type PendingLoad = {
	options: {
		profile: MpdProfile;
		onProgress: (progress: AllSongsFastProgress) => void;
	};
	resolve: (progress: AllSongsFastProgress) => void;
};

const pendingLoads = vi.hoisted(() => [] as unknown[]) as PendingLoad[];

vi.mock("../../functions/allSongsFastLoading", () => ({
	loadAllSongsFast: vi.fn(
		(options: unknown) =>
			new Promise((resolve) => {
				pendingLoads.push({ options, resolve } as PendingLoad);
			}),
	),
}));

vi.mock("../../../stats/states/atoms/statsAtom", async () => {
	const { atom } = await import("jotai");
	return { statsAtom: atom(undefined) };
});

function buildSongs(count: number, prefix: string): Song[] {
	return Array.from({ length: count }, (_, i) =>
		create(SongSchema, { path: `${prefix}${i}` }),
	);
}

function createFakeDeviceSettings(): DeviceSettingsRepository {
	const backing = new Map<string, unknown>();
	return {
		get: ((key: string, defaultValue?: unknown) =>
			backing.has(key)
				? backing.get(key)
				: defaultValue) as DeviceSettingsRepository["get"],
		set: ((key: string, value: unknown) => {
			backing.set(key, value);
		}) as DeviceSettingsRepository["set"],
		remove: ((key: string) => {
			backing.delete(key);
		}) as DeviceSettingsRepository["remove"],
		listKeys: () => [],
	};
}

async function createStoreWithProfiles() {
	const store = createStore();
	const profiles = ["A", "B"].map((name) =>
		create(MpdProfileSchema, { name, host: "localhost", port: 6600 }),
	);
	store.set(deviceSettingsRepositoryAtom, createFakeDeviceSettings());
	store.set(mpdClientAtom, {} as MpdClient);
	store.set(
		mpdProfileStateAsyncAtom,
		Promise.resolve(
			create(MpdProfileStateSchema, {
				currentProfile: profiles[0],
				profiles,
			}),
		),
	);
	store.get(currentMpdProfileAtom);
	await new Promise((resolve) => setTimeout(resolve, 0));
	store.set(selectedProfileNameAtom, "A");
	return store;
}

describe("loadAllSongsFastActionAtom", () => {
	beforeEach(() => {
		pendingLoads.length = 0;
	});

	it("keeps accumulated songs for the same profile and does not reload", async () => {
		const store = await createStoreWithProfiles();

		const first = store.set(loadAllSongsFastActionAtom);
		const progress = { songs: buildSongs(2, "a"), offset: 2, hasMore: false };
		pendingLoads[0].options.onProgress(progress);
		pendingLoads[0].resolve(progress);
		await first;

		await store.set(loadAllSongsFastActionAtom);

		expect(store.get(allSongsFastStateAtom).songs).toHaveLength(2);
		expect(pendingLoads).toHaveLength(1);
	});

	it("shows the initial state for a new profile while the previous load is in flight, and loads for it", async () => {
		const store = await createStoreWithProfiles();

		const loadA = store.set(loadAllSongsFastActionAtom);
		expect(store.get(allSongsFastStateAtom).isLoading).toBe(true);

		store.set(selectedProfileNameAtom, "B");
		expect(store.get(allSongsFastStateAtom)).toMatchObject({
			songs: [],
			isLoading: false,
			hasMore: true,
		});

		const loadB = store.set(loadAllSongsFastActionAtom);
		expect(pendingLoads).toHaveLength(2);
		expect(pendingLoads[1].options.profile.name).toBe("B");

		const late = { songs: buildSongs(5, "a"), offset: 5, hasMore: true };
		pendingLoads[0].options.onProgress(late);
		expect(store.get(allSongsFastStateAtom).songs).toEqual([]);

		const done = { songs: buildSongs(1, "b"), offset: 1, hasMore: false };
		pendingLoads[1].options.onProgress(done);
		pendingLoads[1].resolve(done);
		pendingLoads[0].resolve(late);
		await Promise.all([loadA, loadB]);

		expect(store.get(allSongsFastStateAtom).songs.map((s) => s.path)).toEqual([
			"b0",
		]);
	});

	it("does not show another profile's songs after switching back", async () => {
		const store = await createStoreWithProfiles();

		const loadA = store.set(loadAllSongsFastActionAtom);
		const doneA = { songs: buildSongs(2, "a"), offset: 2, hasMore: false };
		pendingLoads[0].options.onProgress(doneA);
		pendingLoads[0].resolve(doneA);
		await loadA;

		store.set(selectedProfileNameAtom, "B");
		expect(store.get(allSongsFastStateAtom).songs).toEqual([]);

		const loadB = store.set(loadAllSongsFastActionAtom);
		const doneB = { songs: buildSongs(1, "b"), offset: 1, hasMore: false };
		pendingLoads[1].options.onProgress(doneB);
		pendingLoads[1].resolve(doneB);
		await loadB;

		store.set(selectedProfileNameAtom, "A");
		expect(store.get(allSongsFastStateAtom).songs).toEqual([]);
	});

	it("does not stay loading when the load finishes after a switch to a profile that wrote nothing", async () => {
		const store = await createStoreWithProfiles();

		const loadA = store.set(loadAllSongsFastActionAtom);
		store.set(selectedProfileNameAtom, "B");
		pendingLoads[0].resolve({
			songs: buildSongs(2, "a"),
			offset: 2,
			hasMore: false,
		});
		await loadA;

		store.set(selectedProfileNameAtom, "A");
		expect(store.get(allSongsFastStateAtom).isLoading).toBe(false);

		void store.set(loadAllSongsFastActionAtom);
		expect(pendingLoads).toHaveLength(2);
		expect(pendingLoads[1].options.profile.name).toBe("A");
	});

	it("does not stay loading when the load fails after a switch to a profile that wrote nothing", async () => {
		const store = await createStoreWithProfiles();
		let rejectLoad: (e: Error) => void = () => {};
		vi.mocked(loadAllSongsFast).mockImplementationOnce(
			() =>
				new Promise((_, reject) => {
					rejectLoad = reject;
				}),
		);

		const loadA = store.set(loadAllSongsFastActionAtom);
		const failure = expect(loadA).rejects.toThrow("boom");
		store.set(selectedProfileNameAtom, "B");
		rejectLoad(new Error("boom"));
		await failure;

		store.set(selectedProfileNameAtom, "A");
		expect(store.get(allSongsFastStateAtom).isLoading).toBe(false);

		void store.set(loadAllSongsFastActionAtom);
		expect(pendingLoads).toHaveLength(1);
		expect(pendingLoads[0].options.profile.name).toBe("A");
	});
});
