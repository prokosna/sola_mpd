import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	type Song,
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { SongTableContextMenuItemParams } from "../../song_table/types/songTableTypes";
import { SongTableKeyType } from "../../song_table/types/songTableTypes";
import {
	getSongTableContextMenuClear,
	getSongTableContextMenuDropDuplicates,
	getSongTableContextMenuRemove,
} from "./playlistContextMenuItems";

function makeSong(path: string): Song {
	const song = create(SongSchema, { path });
	song.metadata[Song_MetadataTag.ID] = create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value: path }),
		},
	});
	return song;
}

function makeParams(overrides: {
	clickedSong: Song;
	selectedSortedSongs?: Song[];
	sortedSongs?: Song[];
}): SongTableContextMenuItemParams {
	return {
		columns: [] as SongTableColumn[],
		clickedSong: overrides.clickedSong,
		sortedSongs: overrides.sortedSongs ?? [overrides.clickedSong],
		selectedSortedSongs: overrides.selectedSortedSongs ?? [],
	};
}

type RemovePlaylistSongsArgs = {
	targetSongs: Song[];
	allSongs: Song[];
	playlistName: string;
	songTableKeyType: SongTableKeyType;
};

describe("getSongTableContextMenuRemove", () => {
	it("removes the clicked song when not in the current selection", async () => {
		const showNotification = vi.fn();
		const removePlaylistSongs = vi.fn((_params: RemovePlaylistSongsArgs) =>
			Promise.resolve(),
		);
		const clicked = makeSong("a");
		const selected = makeSong("b");

		const item = getSongTableContextMenuRemove(
			SongTableKeyType.PATH,
			"playlist-1",
			showNotification,
			removePlaylistSongs,
		);

		await item.onClick?.(
			makeParams({
				clickedSong: clicked,
				selectedSortedSongs: [selected],
				sortedSongs: [clicked, selected],
			}),
		);

		expect(removePlaylistSongs).toHaveBeenCalledTimes(1);
		const call = removePlaylistSongs.mock.calls[0]?.[0];
		expect(call?.targetSongs).toEqual([clicked]);
		expect(call?.playlistName).toBe("playlist-1");
		expect(call?.songTableKeyType).toBe(SongTableKeyType.PATH);
		expect(call?.allSongs).toEqual([clicked, selected]);
		expect(showNotification).toHaveBeenCalledWith(
			expect.objectContaining({ status: "success" }),
		);
	});

	it("removes the current selection when the clicked song is already selected", async () => {
		const showNotification = vi.fn();
		const removePlaylistSongs = vi.fn((_params: RemovePlaylistSongsArgs) =>
			Promise.resolve(),
		);
		const a = makeSong("a");
		const b = makeSong("b");

		const item = getSongTableContextMenuRemove(
			SongTableKeyType.PATH,
			"playlist",
			showNotification,
			removePlaylistSongs,
		);

		await item.onClick?.(
			makeParams({
				clickedSong: a,
				selectedSortedSongs: [a, b],
				sortedSongs: [a, b],
			}),
		);

		expect(removePlaylistSongs.mock.calls[0]?.[0]?.targetSongs).toEqual([a, b]);
	});

	it("no-ops and does not notify when called without params", async () => {
		const showNotification = vi.fn();
		const removePlaylistSongs = vi.fn((_params: RemovePlaylistSongsArgs) =>
			Promise.resolve(),
		);

		const item = getSongTableContextMenuRemove(
			SongTableKeyType.PATH,
			"p",
			showNotification,
			removePlaylistSongs,
		);

		await item.onClick?.(undefined);

		expect(removePlaylistSongs).not.toHaveBeenCalled();
		expect(showNotification).not.toHaveBeenCalled();
	});
});

describe("getSongTableContextMenuClear", () => {
	it("clears the playlist and notifies success", async () => {
		const showNotification = vi.fn();
		const clearPlaylist = vi.fn(() => Promise.resolve());

		const item = getSongTableContextMenuClear(
			"my-playlist",
			showNotification,
			clearPlaylist,
		);

		await item.onClick?.(makeParams({ clickedSong: makeSong("a") }));

		expect(clearPlaylist).toHaveBeenCalledWith("my-playlist");
		expect(showNotification).toHaveBeenCalledWith(
			expect.objectContaining({ status: "success" }),
		);
	});
});

describe("getSongTableContextMenuDropDuplicates", () => {
	it("notifies info when no duplicates were dropped", async () => {
		const showNotification = vi.fn();
		const dropDuplicates = vi.fn(() => Promise.resolve(0));
		const a = makeSong("a");

		const item = getSongTableContextMenuDropDuplicates(
			"p",
			showNotification,
			dropDuplicates,
		);

		await item.onClick?.(makeParams({ clickedSong: a, sortedSongs: [a] }));

		expect(dropDuplicates).toHaveBeenCalledTimes(1);
		expect(showNotification).toHaveBeenCalledWith(
			expect.objectContaining({ status: "info" }),
		);
	});

	it("notifies success with the number removed when duplicates were dropped", async () => {
		const showNotification = vi.fn();
		const dropDuplicates = vi.fn(() => Promise.resolve(3));
		const a = makeSong("a");

		const item = getSongTableContextMenuDropDuplicates(
			"p",
			showNotification,
			dropDuplicates,
		);

		await item.onClick?.(makeParams({ clickedSong: a, sortedSongs: [a] }));

		const calls = showNotification.mock.calls;
		const last = calls[calls.length - 1]?.[0];
		expect(last?.status).toBe("success");
		expect(last?.description).toContain("3");
	});

	it("no-ops on empty sortedSongs without calling the drop helper", async () => {
		const showNotification = vi.fn();
		const dropDuplicates = vi.fn(() => Promise.resolve(0));
		const a = makeSong("a");

		const item = getSongTableContextMenuDropDuplicates(
			"p",
			showNotification,
			dropDuplicates,
		);

		await item.onClick?.(makeParams({ clickedSong: a, sortedSongs: [] }));

		expect(dropDuplicates).not.toHaveBeenCalled();
		expect(showNotification).not.toHaveBeenCalled();
	});

	it("no-ops when called without params", async () => {
		const showNotification = vi.fn();
		const dropDuplicates = vi.fn(() => Promise.resolve(0));

		const item = getSongTableContextMenuDropDuplicates(
			"p",
			showNotification,
			dropDuplicates,
		);

		await item.onClick?.(undefined);

		expect(dropDuplicates).not.toHaveBeenCalled();
		expect(showNotification).not.toHaveBeenCalled();
	});
});
