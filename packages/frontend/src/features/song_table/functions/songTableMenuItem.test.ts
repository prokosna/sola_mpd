import { create } from "@bufbuild/protobuf";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it, vi } from "vitest";

import { SongTableKeyType } from "../types/songTableTypes";
import {
	getSongTableContextMenuAdd,
	getSongTableContextMenuAddToPlaylist,
	getSongTableContextMenuEditColumns,
	getSongTableContextMenuReplace,
	getSongTableContextMenuSimilarSongs,
} from "./songTableMenuItem";

describe("getSongTableContextMenuAdd", () => {
	it("should create an Add menu item", () => {
		const item = getSongTableContextMenuAdd(
			SongTableKeyType.PATH,
			vi.fn(),
			vi.fn().mockResolvedValue(undefined),
		);
		expect(item.name).toBe("Add");
		expect(item.onClick).toBeDefined();
	});

	it("should not throw when params are undefined", async () => {
		const item = getSongTableContextMenuAdd(
			SongTableKeyType.PATH,
			vi.fn(),
			vi.fn().mockResolvedValue(undefined),
		);
		await expect(item.onClick?.(undefined)).resolves.toBeUndefined();
	});
});

describe("getSongTableContextMenuReplace", () => {
	it("should create a Replace menu item", () => {
		const item = getSongTableContextMenuReplace(
			SongTableKeyType.PATH,
			vi.fn(),
			vi.fn().mockResolvedValue(undefined),
		);
		expect(item.name).toBe("Replace");
	});
});

describe("getSongTableContextMenuAddToPlaylist", () => {
	it("should create an Add to Playlist menu item", () => {
		const ref = { current: [] as Song[] };
		const item = getSongTableContextMenuAddToPlaylist(
			SongTableKeyType.PATH,
			ref,
			vi.fn(),
		);
		expect(item.name).toBe("Add to Playlist");
	});

	it("should set songs ref and open modal on click with valid params", async () => {
		const ref = { current: [] as Song[] };
		const setOpen = vi.fn();
		const item = getSongTableContextMenuAddToPlaylist(
			SongTableKeyType.PATH,
			ref,
			setOpen,
		);
		const clickedSong = create(SongSchema, { path: "/a.mp3" });
		await item.onClick?.({
			columns: [],
			clickedSong,
			sortedSongs: [clickedSong],
			selectedSortedSongs: [clickedSong],
		});
		expect(ref.current).toHaveLength(1);
		expect(setOpen).toHaveBeenCalledWith(true);
	});
});

describe("getSongTableContextMenuEditColumns", () => {
	it("should create an Edit Columns menu item", () => {
		const item = getSongTableContextMenuEditColumns(vi.fn());
		expect(item.name).toBe("Edit Columns");
	});

	it("should call setIsColumnEditModalOpen on click", async () => {
		const setOpen = vi.fn();
		const item = getSongTableContextMenuEditColumns(setOpen);
		await item.onClick?.(undefined);
		expect(setOpen).toHaveBeenCalledWith(true);
	});
});

describe("getSongTableContextMenuSimilarSongs", () => {
	it("should create a Similar Songs menu item", () => {
		const item = getSongTableContextMenuSimilarSongs(vi.fn(), vi.fn(), vi.fn());
		expect(item.name).toBe("Similar Songs");
	});
});
