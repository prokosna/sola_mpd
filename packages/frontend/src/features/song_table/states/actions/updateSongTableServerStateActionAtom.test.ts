import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	SongTableColumnSchema,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import { UpdateMode } from "../../../../types/stateTypes";
import type { SongTableStateRepository } from "../../repositories/SongTableStateRepository";
import { songTableStateAsyncAtom } from "../atoms/songTableAtom";
import { songTableStateRepositoryAtom } from "../atoms/songTableStateRepositoryAtom";

import { updateSongTableServerStateActionAtom } from "./updateSongTableServerStateActionAtom";

function createFakeSongTableStateRepository(
	save: SongTableStateRepository["save"] = vi.fn(async () => {}),
): SongTableStateRepository {
	return {
		fetch: vi.fn(async () => create(SongTableStateSchema, {})),
		save,
	};
}

describe("updateSongTableServerStateActionAtom", () => {
	it("always persists exactly what it's given, with no routing or diffing", async () => {
		const store = createStore();
		const songTableStateRepository = createFakeSongTableStateRepository();
		store.set(songTableStateRepositoryAtom, songTableStateRepository);

		// A width-only change: the device-aware write actions would route
		// this to the device layout and never call save(). This action must
		// still reach the server, because it's the Raw Data escape hatch.
		const newState = create(SongTableStateSchema, {
			columns: [
				create(SongTableColumnSchema, {
					tag: Song_MetadataTag.TITLE,
					widthFlex: 300,
				}),
			],
		});

		await store.set(updateSongTableServerStateActionAtom, {
			state: newState,
			mode: UpdateMode.PERSIST | UpdateMode.LOCAL_STATE,
		});

		expect(songTableStateRepository.save).toHaveBeenCalledWith(newState);
		// Set directly with a plain (already-resolved) value, so it's
		// readable synchronously without going through atomWithSync/unwrap.
		expect(store.get(songTableStateAsyncAtom)).toBe(newState);
	});

	it("does not update local state when PERSIST fails", async () => {
		const save = vi.fn(async () => {
			throw new Error("disk full");
		});
		const store = createStore();
		store.set(
			songTableStateRepositoryAtom,
			createFakeSongTableStateRepository(save),
		);
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const newState = create(SongTableStateSchema, { columns: [] });
		await store.set(updateSongTableServerStateActionAtom, {
			state: newState,
			mode: UpdateMode.PERSIST | UpdateMode.LOCAL_STATE,
		});

		expect(save).toHaveBeenCalledWith(newState);
		expect(store.get(songTableStateAsyncAtom)).not.toBe(newState);

		errorSpy.mockRestore();
	});

	it("skips the server entirely when PERSIST is not requested", async () => {
		const store = createStore();
		const songTableStateRepository = createFakeSongTableStateRepository();
		store.set(songTableStateRepositoryAtom, songTableStateRepository);

		const newState = create(SongTableStateSchema, { columns: [] });
		await store.set(updateSongTableServerStateActionAtom, {
			state: newState,
			mode: UpdateMode.LOCAL_STATE,
		});

		expect(songTableStateRepository.save).not.toHaveBeenCalled();
	});
});
