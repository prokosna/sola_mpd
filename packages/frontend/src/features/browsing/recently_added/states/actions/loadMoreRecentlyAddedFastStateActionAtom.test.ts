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
} from "../../../../common";
import type { MpdClient } from "../../../../mpd";
import { mpdClientAtom } from "../../../../mpd/states/atoms/mpdClientAtom";
import {
	currentMpdProfileAtom,
	mpdProfileStateAsyncAtom,
} from "../../../../profile/states/atoms/mpdProfileAtom";
import { selectedProfileNameAtom } from "../../../../profile/states/atoms/selectedProfileNameAtom";
import { recentlyAddedFastStateAtom } from "../atoms/recentlyAddedFastStateAtom";
import { loadMoreRecentlyAddedFastStateActionAtom } from "./loadMoreRecentlyAddedFastStateActionAtom";

type PendingFetch = {
	profile: MpdProfile;
	resolve: (songs: Song[]) => void;
	reject: (error: Error) => void;
};

const pendingFetches = vi.hoisted(() => [] as unknown[]) as PendingFetch[];

vi.mock("../../functions/recentlyAddedFastFetch", () => ({
	computeSinceTime: () => new Date(0),
	fetchRecentlyAddedFastDelta: vi.fn(
		(_client: unknown, profile: MpdProfile) =>
			new Promise<Song[]>((resolve, reject) => {
				pendingFetches.push({ profile, resolve, reject });
			}),
	),
}));

vi.mock("../../../../stats/states/atoms/statsAtom", async () => {
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

async function settle(
	run: Promise<void>,
	fetchIndex: number,
	songs: Song[],
): Promise<void> {
	pendingFetches[fetchIndex].resolve(songs);
	await run;
}

describe("loadMoreRecentlyAddedFastStateActionAtom", () => {
	beforeEach(() => {
		pendingFetches.length = 0;
	});

	it("keeps accumulated songs while the profile is unchanged", async () => {
		const store = await createStoreWithProfiles();

		await settle(
			store.set(loadMoreRecentlyAddedFastStateActionAtom),
			0,
			buildSongs(2, "a"),
		);

		expect(store.get(recentlyAddedFastStateAtom).songs).toHaveLength(2);
		expect(store.get(recentlyAddedFastStateAtom).isLoading).toBe(false);
	});

	it("shows the initial state for a new profile while the previous load is in flight, and loads for it", async () => {
		const store = await createStoreWithProfiles();

		const loadA = store.set(loadMoreRecentlyAddedFastStateActionAtom);
		expect(store.get(recentlyAddedFastStateAtom).isLoading).toBe(true);

		store.set(selectedProfileNameAtom, "B");
		expect(store.get(recentlyAddedFastStateAtom)).toMatchObject({
			songs: [],
			isLoading: false,
		});

		const loadB = store.set(loadMoreRecentlyAddedFastStateActionAtom);
		expect(pendingFetches).toHaveLength(2);
		expect(pendingFetches[1].profile.name).toBe("B");

		await settle(loadA, 0, buildSongs(5, "a"));
		expect(store.get(recentlyAddedFastStateAtom).songs).toEqual([]);

		await settle(loadB, 1, buildSongs(1, "b"));
		expect(
			store.get(recentlyAddedFastStateAtom).songs.map((s) => s.path),
		).toEqual(["b0"]);
	});

	it("does not show another profile's songs after switching back", async () => {
		const store = await createStoreWithProfiles();

		await settle(
			store.set(loadMoreRecentlyAddedFastStateActionAtom),
			0,
			buildSongs(2, "a"),
		);

		store.set(selectedProfileNameAtom, "B");
		expect(store.get(recentlyAddedFastStateAtom).songs).toEqual([]);

		await settle(
			store.set(loadMoreRecentlyAddedFastStateActionAtom),
			1,
			buildSongs(1, "b"),
		);

		store.set(selectedProfileNameAtom, "A");
		expect(store.get(recentlyAddedFastStateAtom).songs).toEqual([]);
	});

	it("does not stay loading when the load finishes after a switch to a profile that wrote nothing", async () => {
		const store = await createStoreWithProfiles();

		const loadA = store.set(loadMoreRecentlyAddedFastStateActionAtom);
		store.set(selectedProfileNameAtom, "B");
		await settle(loadA, 0, buildSongs(2, "a"));

		store.set(selectedProfileNameAtom, "A");
		expect(store.get(recentlyAddedFastStateAtom).isLoading).toBe(false);

		void store.set(loadMoreRecentlyAddedFastStateActionAtom);
		expect(pendingFetches).toHaveLength(2);
		expect(pendingFetches[1].profile.name).toBe("A");
	});

	it("does not stay loading when the load fails after a switch to a profile that wrote nothing", async () => {
		const store = await createStoreWithProfiles();

		const loadA = store.set(loadMoreRecentlyAddedFastStateActionAtom);
		const failure = expect(loadA).rejects.toThrow("boom");
		store.set(selectedProfileNameAtom, "B");
		pendingFetches[0].reject(new Error("boom"));
		await failure;

		store.set(selectedProfileNameAtom, "A");
		expect(store.get(recentlyAddedFastStateAtom).isLoading).toBe(false);

		void store.set(loadMoreRecentlyAddedFastStateActionAtom);
		expect(pendingFetches).toHaveLength(2);
		expect(pendingFetches[1].profile.name).toBe("A");
	});
});
