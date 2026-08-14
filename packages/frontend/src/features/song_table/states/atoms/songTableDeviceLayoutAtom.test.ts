import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	SongTableColumnSchema,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";
import type { DeviceSettingsRepository } from "../../../common";
import {
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
	DEVICE_SETTING_KEY_SONG_TABLE_LAYOUT,
	deviceSettingsRepositoryAtom,
} from "../../../common";
import type { SongTableStateRepository } from "../../repositories/SongTableStateRepository";
import type { SongTableDeviceLayout } from "../../types/songTableTypes";
import { songTableDeviceLayoutAtom } from "./songTableDeviceLayoutAtom";
import { songTableStateRepositoryAtom } from "./songTableStateRepositoryAtom";

const layoutKey = buildDeviceSettingKey(DEVICE_SETTING_KEY_SONG_TABLE_LAYOUT);
const legacyLayoutKey = buildDeviceSettingKey(
	DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
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

function createFakeSongTableStateRepository(
	fetch: SongTableStateRepository["fetch"],
): SongTableStateRepository {
	return {
		fetch: vi.fn(fetch),
		save: vi.fn(async () => {}),
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("songTableDeviceLayoutAtom hydration", () => {
	it("is undefined while the migration is pending, not an empty layout", () => {
		const store = createStore();
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository(),
		);
		store.set(
			songTableStateRepositoryAtom,
			createFakeSongTableStateRepository(
				() => new Promise(() => {}), // never resolves within this test
			),
		);

		store.get(songTableDeviceLayoutAtom); // primes the async->sync unwrap

		expect(store.get(songTableDeviceLayoutAtom)).toBeUndefined();
	});

	// The async ordering is load-bearing (DESIGN.md §7): a device with no
	// local key must end up with the server's values, not the defaults, even
	// though the backend fetch is slow.
	it("waits for a slow backend fetch and ends up with the server's values, not the defaults", async () => {
		const store = createStore();
		const deviceRepository = createFakeDeviceSettingsRepository();
		store.set(deviceSettingsRepositoryAtom, deviceRepository);
		const legacyState = create(SongTableStateSchema, {
			columns: [
				create(SongTableColumnSchema, {
					tag: Song_MetadataTag.TITLE,
					sortOrder: 0,
					isSortDesc: true,
					widthFlex: 180,
				}),
			],
		});
		let resolveFetch: (() => void) | undefined;
		const songTableStateRepository = createFakeSongTableStateRepository(
			() =>
				new Promise((resolve) => {
					resolveFetch = () => resolve(legacyState);
				}),
		);
		store.set(songTableStateRepositoryAtom, songTableStateRepository);

		store.get(songTableDeviceLayoutAtom);
		await flush();
		expect(store.get(songTableDeviceLayoutAtom)).toBeUndefined();

		resolveFetch?.();
		await flush();

		const layout = store.get(songTableDeviceLayoutAtom);
		expect(layout?.widthFlexByTag[Song_MetadataTag.TITLE]).toBe(180);
		expect(layout?.sort).toEqual([
			{ tag: Song_MetadataTag.TITLE, isDesc: true },
		]);
		expect(deviceRepository.set).toHaveBeenCalledWith(layoutKey, layout);
	});

	it("uses the legacy device key without reaching the server when present", async () => {
		const legacyLayout = {
			[String(Song_MetadataTag.TITLE)]: {
				widthFlex: 300,
				sortOrder: undefined,
				isSortDesc: false,
			},
		};
		const deviceRepository = createFakeDeviceSettingsRepository({
			[legacyLayoutKey]: legacyLayout,
		});
		const store = createStore();
		store.set(deviceSettingsRepositoryAtom, deviceRepository);
		const songTableStateRepository = createFakeSongTableStateRepository(
			async () => {
				throw new Error("must not be called when the legacy key is set");
			},
		);
		store.set(songTableStateRepositoryAtom, songTableStateRepository);

		store.get(songTableDeviceLayoutAtom);
		await flush();

		const layout = store.get(songTableDeviceLayoutAtom);
		expect(layout?.widthFlexByTag[Song_MetadataTag.TITLE]).toBe(300);
		expect(songTableStateRepository.fetch).not.toHaveBeenCalled();
	});

	it("does not read either source once the new device key is already set", async () => {
		const layout: SongTableDeviceLayout = {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 400 },
			sort: [],
		};
		const deviceRepository = createFakeDeviceSettingsRepository({
			[layoutKey]: layout,
		});
		const store = createStore();
		store.set(deviceSettingsRepositoryAtom, deviceRepository);
		const songTableStateRepository = createFakeSongTableStateRepository(
			async () => {
				throw new Error("must not be called once the device key is set");
			},
		);
		store.set(songTableStateRepositoryAtom, songTableStateRepository);

		store.get(songTableDeviceLayoutAtom);
		await flush();

		expect(store.get(songTableDeviceLayoutAtom)).toEqual(layout);
		expect(songTableStateRepository.fetch).not.toHaveBeenCalled();
	});

	// A transient backend error must not be persisted as if it were the truth.
	it("leaves the key absent and runs on defaults for the session when the fetch fails", async () => {
		const deviceRepository = createFakeDeviceSettingsRepository();
		const store = createStore();
		store.set(deviceSettingsRepositoryAtom, deviceRepository);
		store.set(
			songTableStateRepositoryAtom,
			createFakeSongTableStateRepository(async () => {
				throw new Error("network error");
			}),
		);

		store.get(songTableDeviceLayoutAtom);
		await flush();

		expect(store.get(songTableDeviceLayoutAtom)).toEqual({
			widthFlexByTag: {},
			sort: [],
		});
		expect(deviceRepository.set).not.toHaveBeenCalled();
	});

	it("refuses to write while the migration is still pending", () => {
		const store = createStore();
		const deviceRepository = createFakeDeviceSettingsRepository();
		store.set(deviceSettingsRepositoryAtom, deviceRepository);
		store.set(
			songTableStateRepositoryAtom,
			createFakeSongTableStateRepository(() => new Promise(() => {})),
		);

		store.get(songTableDeviceLayoutAtom); // primes; migration never settles

		store.set(songTableDeviceLayoutAtom, {
			widthFlexByTag: { [Song_MetadataTag.ARTIST]: 999 },
			sort: [],
		});

		expect(store.get(songTableDeviceLayoutAtom)).toBeUndefined();
		expect(deviceRepository.set).not.toHaveBeenCalledWith(
			layoutKey,
			expect.anything(),
		);
	});

	it("persists a new value to the device settings repository once ready", async () => {
		const store = createStore();
		const deviceRepository = createFakeDeviceSettingsRepository({
			[layoutKey]: { widthFlexByTag: {}, sort: [] },
		});
		store.set(deviceSettingsRepositoryAtom, deviceRepository);
		store.set(
			songTableStateRepositoryAtom,
			createFakeSongTableStateRepository(async () =>
				create(SongTableStateSchema, {}),
			),
		);
		store.get(songTableDeviceLayoutAtom);
		await flush();

		const newLayout: SongTableDeviceLayout = {
			widthFlexByTag: { [Song_MetadataTag.ARTIST]: 120 },
			sort: [],
		};
		store.set(songTableDeviceLayoutAtom, newLayout);

		expect(store.get(songTableDeviceLayoutAtom)).toEqual(newLayout);
		expect(deviceRepository.set).toHaveBeenCalledWith(layoutKey, newLayout);
	});
});
