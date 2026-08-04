import { clone, create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	SongTableColumnSchema,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";
import { UpdateMode } from "../../../../types/stateTypes";
import type { DeviceSettingsRepository } from "../../../common";
import { deviceSettingsRepositoryAtom } from "../../../common";
import { songTableColumnLayoutKeyForTag } from "../../functions/songTableColumnLayout";
import type { SongTableStateRepository } from "../../repositories/SongTableStateRepository";
import {
	songTableStateAsyncAtom,
	songTableStateAtom,
} from "../atoms/songTableAtom";
import { songTableColumnLayoutAtom } from "../atoms/songTableColumnLayoutAtom";
import { songTableStateRepositoryAtom } from "../atoms/songTableStateRepositoryAtom";

import { updateSongTableStateActionAtom } from "./updateSongTableStateActionAtom";

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

function createFakeSongTableStateRepository(): SongTableStateRepository {
	return {
		fetch: vi.fn(async () => create(SongTableStateSchema, {})),
		save: vi.fn(async () => {}),
	};
}

function createColumn(
	tag: Song_MetadataTag,
	opts: { sortOrder?: number; isSortDesc?: boolean; widthFlex?: number } = {},
) {
	return create(SongTableColumnSchema, {
		tag,
		sortOrder: opts.sortOrder,
		isSortDesc: opts.isSortDesc ?? false,
		widthFlex: opts.widthFlex ?? 100,
	});
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

async function createReadyStore(
	initialColumns: ReturnType<typeof createColumn>[],
) {
	const store = createStore();
	store.set(deviceSettingsRepositoryAtom, createFakeDeviceSettingsRepository());
	const songTableStateRepository = createFakeSongTableStateRepository();
	store.set(songTableStateRepositoryAtom, songTableStateRepository);
	const initialState = create(SongTableStateSchema, {
		columns: initialColumns,
	});
	store.set(songTableStateAsyncAtom, Promise.resolve(initialState));
	store.get(songTableStateAtom); // primes the async->sync unwrap
	await flush();
	return { store, songTableStateRepository };
}

describe("updateSongTableStateActionAtom", () => {
	it("persists to the server when the tag list/order changes", async () => {
		const { store, songTableStateRepository } = await createReadyStore([
			createColumn(Song_MetadataTag.TITLE),
			createColumn(Song_MetadataTag.ARTIST),
		]);
		const newState = create(SongTableStateSchema, {
			columns: [
				createColumn(Song_MetadataTag.ARTIST),
				createColumn(Song_MetadataTag.TITLE),
			],
		});

		await store.set(updateSongTableStateActionAtom, {
			state: newState,
			mode: UpdateMode.PERSIST | UpdateMode.LOCAL_STATE,
		});

		expect(songTableStateRepository.save).toHaveBeenCalledWith(newState);
		expect(store.get(songTableStateAtom)?.columns.map((c) => c.tag)).toEqual([
			Song_MetadataTag.ARTIST,
			Song_MetadataTag.TITLE,
		]);
	});

	it("updates only the device layout for a width-only change, without hitting the server", async () => {
		const { store, songTableStateRepository } = await createReadyStore([
			createColumn(Song_MetadataTag.TITLE, { widthFlex: 100 }),
		]);
		const newState = create(SongTableStateSchema, {
			columns: [createColumn(Song_MetadataTag.TITLE, { widthFlex: 300 })],
		});

		await store.set(updateSongTableStateActionAtom, {
			state: newState,
			mode: UpdateMode.PERSIST,
		});

		expect(songTableStateRepository.save).not.toHaveBeenCalled();
		expect(
			store.get(songTableColumnLayoutAtom)[
				songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)
			].widthFlex,
		).toBe(300);
		expect(store.get(songTableStateAtom)?.columns[0].widthFlex).toBe(300);
	});

	it("updates only the device layout for a sort-only change, without hitting the server", async () => {
		const { store, songTableStateRepository } = await createReadyStore([
			createColumn(Song_MetadataTag.TITLE, { sortOrder: 0, isSortDesc: false }),
		]);
		const newState = create(SongTableStateSchema, {
			columns: [
				createColumn(Song_MetadataTag.TITLE, {
					sortOrder: 0,
					isSortDesc: true,
				}),
			],
		});

		await store.set(updateSongTableStateActionAtom, {
			state: newState,
			mode: UpdateMode.PERSIST,
		});

		expect(songTableStateRepository.save).not.toHaveBeenCalled();
		expect(
			store.get(songTableColumnLayoutAtom)[
				songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)
			].isSortDesc,
		).toBe(true);
		expect(store.get(songTableStateAtom)?.columns[0].isSortDesc).toBe(true);
	});

	it("does not touch the device layout when nothing actually changed", async () => {
		const { store, songTableStateRepository } = await createReadyStore([
			createColumn(Song_MetadataTag.TITLE, { widthFlex: 100 }),
		]);
		const layoutBefore = store.get(songTableColumnLayoutAtom);
		const currentState = store.get(songTableStateAtom);
		if (currentState === undefined) {
			throw new Error("songTableStateAtom must be primed by createReadyStore");
		}
		const unchangedState = clone(SongTableStateSchema, currentState);

		await store.set(updateSongTableStateActionAtom, {
			state: unchangedState,
			mode: UpdateMode.PERSIST,
		});

		expect(songTableStateRepository.save).not.toHaveBeenCalled();
		expect(store.get(songTableColumnLayoutAtom)).toBe(layoutBefore);
	});
});
