import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	SongTableColumnSchema,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { createStore } from "jotai";
import { describe, expect, it } from "vitest";

import type { DeviceSettingsRepository } from "../../../common/repositories/DeviceSettingsRepository";
import { deviceSettingsRepositoryAtom } from "../../../common/states/atoms/deviceSettingsRepositoryAtom";
import { songTableColumnLayoutKeyForTag } from "../../functions/songTableColumnLayout";
import type { SongTableColumnLayout } from "../../types/songTableTypes";
import { songTableStateAsyncAtom, songTableStateAtom } from "./songTableAtom";
import { songTableColumnLayoutAtom } from "./songTableColumnLayoutAtom";

function createFakeDeviceSettingsRepository(
	initial: Record<string, unknown> = {},
): DeviceSettingsRepository {
	const backing = new Map<string, unknown>(Object.entries(initial));
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

describe("songTableStateAtom", () => {
	it("trusts the server's tag list/order but overlays sort and width from the device layout", async () => {
		const store = createStore();
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository(),
		);
		const layout: SongTableColumnLayout = {
			[songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)]: {
				widthFlex: 250,
				sortOrder: 0,
				isSortDesc: true,
			},
		};
		store.set(songTableColumnLayoutAtom, layout);

		const serverState = create(SongTableStateSchema, {
			columns: [
				create(SongTableColumnSchema, {
					tag: Song_MetadataTag.TITLE,
					// Stale server-side values that must be ignored in favor of
					// the device layout.
					sortOrder: 99,
					isSortDesc: false,
					widthFlex: 1,
				}),
				create(SongTableColumnSchema, {
					tag: Song_MetadataTag.ARTIST,
					widthFlex: 1,
				}),
			],
		});
		store.set(songTableStateAsyncAtom, Promise.resolve(serverState));
		store.get(songTableStateAtom); // primes the async->sync unwrap
		await flush();

		const result = store.get(songTableStateAtom);
		expect(result?.columns.map((c) => c.tag)).toEqual([
			Song_MetadataTag.TITLE,
			Song_MetadataTag.ARTIST,
		]);
		expect(result?.columns[0].widthFlex).toBe(250);
		expect(result?.columns[0].sortOrder).toBe(0);
		expect(result?.columns[0].isSortDesc).toBe(true);
		// No device entry for ARTIST: width_flex keeps the server's existing
		// value (never collapses to 0) and sort defaults to "unsorted".
		expect(result?.columns[1].widthFlex).toBe(1);
		expect(result?.columns[1].sortOrder).toBeUndefined();
		expect(result?.columns[1].isSortDesc).toBe(false);
	});

	it("re-evaluates when the device column layout changes (reactivity regression)", async () => {
		const store = createStore();
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository(),
		);
		const serverState = create(SongTableStateSchema, {
			columns: [
				create(SongTableColumnSchema, {
					tag: Song_MetadataTag.TITLE,
					widthFlex: 1,
				}),
			],
		});
		store.set(songTableStateAsyncAtom, Promise.resolve(serverState));
		store.get(songTableStateAtom);
		await flush();

		expect(store.get(songTableStateAtom)?.columns[0].widthFlex).toBe(1);

		store.set(songTableColumnLayoutAtom, {
			[songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)]: {
				widthFlex: 400,
				isSortDesc: false,
			},
		});

		expect(store.get(songTableStateAtom)?.columns[0].widthFlex).toBe(400);
	});
});
