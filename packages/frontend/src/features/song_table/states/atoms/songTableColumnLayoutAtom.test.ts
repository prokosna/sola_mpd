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
	deviceSettingsRepositoryAtom,
} from "../../../common";
import { songTableColumnLayoutKeyForTag } from "../../functions/songTableColumnLayout";
import type { SongTableStateRepository } from "../../repositories/SongTableStateRepository";
import { songTableColumnLayoutAtom } from "./songTableColumnLayoutAtom";
import { songTableStateRepositoryAtom } from "./songTableStateRepositoryAtom";

const layoutKey = buildDeviceSettingKey(
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

describe("songTableColumnLayoutAtom hydration", () => {
	it("copies legacy width/sort values from the server when the device key is unset", async () => {
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
		const songTableStateRepository = createFakeSongTableStateRepository(
			async () => legacyState,
		);
		store.set(songTableStateRepositoryAtom, songTableStateRepository);

		store.get(songTableColumnLayoutAtom); // primes the async->sync unwrap
		await flush();

		const layout = store.get(songTableColumnLayoutAtom);
		expect(
			layout[songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)],
		).toEqual({ widthFlex: 180, sortOrder: 0, isSortDesc: true });
		expect(songTableStateRepository.fetch).toHaveBeenCalledTimes(1);
		expect(deviceRepository.set).toHaveBeenCalledWith(layoutKey, layout);
	});

	it("does not read the server again once the device key is already set", async () => {
		const deviceRepository = createFakeDeviceSettingsRepository({
			[layoutKey]: {
				[songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)]: {
					widthFlex: 300,
					sortOrder: undefined,
					isSortDesc: false,
				},
			},
		});
		const store = createStore();
		store.set(deviceSettingsRepositoryAtom, deviceRepository);
		const songTableStateRepository = createFakeSongTableStateRepository(
			async () => {
				throw new Error("must not be called once the device key is set");
			},
		);
		store.set(songTableStateRepositoryAtom, songTableStateRepository);

		store.get(songTableColumnLayoutAtom);
		await flush();

		const layout = store.get(songTableColumnLayoutAtom);
		expect(
			layout[songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)],
		).toEqual({ widthFlex: 300, sortOrder: undefined, isSortDesc: false });
		expect(songTableStateRepository.fetch).not.toHaveBeenCalled();
	});

	it("persists a new value to the device settings repository on write", () => {
		const store = createStore();
		const deviceRepository = createFakeDeviceSettingsRepository();
		store.set(deviceSettingsRepositoryAtom, deviceRepository);

		const newLayout = {
			[songTableColumnLayoutKeyForTag(Song_MetadataTag.ARTIST)]: {
				widthFlex: 120,
				isSortDesc: false,
			},
		};
		store.set(songTableColumnLayoutAtom, newLayout);

		expect(store.get(songTableColumnLayoutAtom)).toEqual(newLayout);
		expect(deviceRepository.set).toHaveBeenCalledWith(layoutKey, newLayout);
	});
});
