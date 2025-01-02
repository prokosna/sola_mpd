import {
	type Song,
	Song_MetadataTag,
	type Song_MetadataValue,
} from "@sola_mpd/domain/src/models/song_pb.js";
import type {
	SongTableColumn,
	SongTableState,
} from "@sola_mpd/domain/src/models/song_table_pb.js";
import {
	compareSongsByMetadataValue,
	convertAudioFormatToString,
	getSongMetadataAsString,
} from "@sola_mpd/domain/src/utils/songUtils.js";
import type { GridApi, IRowNode } from "ag-grid-community";
import dayjs from "dayjs";

import {
	type SongTableContextMenuItemParams,
	SongTableKeyType,
	type SongTableRowCompact,
	type SongsInTable,
} from "../types/songTableTypes";

import { copySortingAttributesToNewColumns } from "./songTableColumnUtils";

/**
 * Converts grid node to Song object.
 *
 * Retrieves song from map using node's key. Throws error if
 * key is missing or song not found in map.
 *
 * @param songsMap Song lookup map
 * @param node Grid row node
 * @returns Corresponding song
 * @throws Error if key missing or song not found
 */
export function convertNodeToSong(
	songsMap: Map<string, Song>,
	node: IRowNode,
): Song {
	const key = node.data?.key;
	if (key == null) {
		throw new Error(
			`Key is not defined for ${node}. This should be an implementation error.`,
		);
	}
	const song = songsMap.get(key);
	if (song === undefined) {
		throw new Error(`No song found for key=${key}.`);
	}
	return song;
}

/**
 * Generates unique key for song identification.
 *
 * Creates key based on specified type (path, index+path,
 * or ID) for consistent song lookup across table.
 *
 * @param song Target song
 * @param keyType Key generation type
 * @returns Unique song key
 */
export function getSongTableKey(song: Song, keyType: SongTableKeyType): string {
	switch (keyType) {
		case SongTableKeyType.ID: {
			const id = getSongMetadataAsString(song, Song_MetadataTag.ID);
			if (id === "") {
				console.warn(
					`ID is specified as a song table key, but ID is empty: ${song}`,
				);
			}
			return id;
		}
		case SongTableKeyType.PATH: {
			return song.path;
		}
		case SongTableKeyType.INDEX_PATH: {
			return `${song.index}_${song.path}`;
		}
		default:
			throw Error(`Unsupported song table key: ${keyType}.`);
	}
}

/**
 * Gets target songs for context menu operation.
 *
 * Returns either clicked song or all selected songs based
 * on selection state. Ensures consistent song order.
 *
 * @param params Context menu parameters
 * @param keyType Song key type
 * @returns Target song list
 */
export function getTargetSongsForContextMenu(
	params: SongTableContextMenuItemParams,
	keyType: SongTableKeyType,
): Song[] {
	const { clickedSong, selectedSortedSongs } = params;

	const targetSongs = [];
	if (
		params.clickedSong !== undefined &&
		!selectedSortedSongs
			.map((song) => getSongTableKey(song, keyType))
			.includes(getSongTableKey(clickedSong, keyType))
	) {
		targetSongs.push(clickedSong);
	} else {
		targetSongs.push(...selectedSortedSongs);
	}
	return targetSongs;
}

/**
 * Converts metadata tag to display name.
 *
 * Transforms internal tag enum to user-friendly column
 * header text. Handles special cases and formatting.
 *
 * @param tag Metadata tag
 * @returns Display name
 */
export function convertSongMetadataTagToDisplayName(
	tag: Song_MetadataTag,
): string {
	return Song_MetadataTag[tag]
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

/**
 * Converts display name to metadata tag.
 *
 * Reverses display name transformation to internal tag
 * enum. Used for column configuration persistence.
 *
 * @param str Display name
 * @returns Metadata tag
 */
export function convertSongMetadataTagFromDisplayName(
	str: string,
): Song_MetadataTag {
	const tag = str
		.split(" ")
		.map((v) => v.toUpperCase())
		.join("_");
	return Song_MetadataTag[tag as keyof typeof Song_MetadataTag];
}

/**
 * Calculates song reordering operations.
 *
 * Determines minimum set of move operations to achieve
 * desired song order. Used for playlist reordering.
 *
 * @param currentSongs Current order
 * @param orderedSongs Desired order
 * @param keyType Song key type
 * @returns Move operations
 */
export function convertOrderingToOperations(
	currentSongs: Song[],
	orderedSongs: Song[],
	keyType: SongTableKeyType,
): {
	id: string;
	to: number;
}[] {
	const ops: { id: string; to: number }[] = [];
	orderedSongs.forEach((orderedSong, index) => {
		const currentSong = currentSongs[index];
		const currentSongKey = getSongTableKey(currentSong, keyType);
		const orderedSongKey = getSongTableKey(orderedSong, keyType);
		if (currentSongKey !== orderedSongKey) {
			ops.push({
				id: getSongMetadataAsString(orderedSong, Song_MetadataTag.ID),
				to: index,
			});
		}
	});
	return ops;
}

/**
 * Converts song metadata to grid cell value.
 *
 * Transforms metadata value to appropriate display format
 * based on tag type. Handles dates, numbers, and text.
 *
 * @param tag Metadata tag
 * @param value Raw metadata value
 * @returns [Field name, Formatted value]
 */
export function convertSongMetadataForGridRowValue(
	tag: Song_MetadataTag,
	value: Song_MetadataValue,
): [string, string | number | Date | undefined] {
	const v = (() => {
		switch (value.value.case) {
			case "stringValue":
				return value.value.value.value;
			case "floatValue":
				return value.value.value.value;
			case "intValue":
				return value.value.value.value;
			case "timestamp":
				return dayjs(value.value.value.toDate()).format("YYYY-MM-DD");
			case "format":
				return convertAudioFormatToString(value.value.value);
		}
	})();
	return [convertSongMetadataTagToDisplayName(tag), v];
}

/**
 * Creates compact view row data.
 *
 * Generates two-line display format combining multiple
 * metadata fields for space-efficient presentation.
 *
 * @param song Source song
 * @returns Compact row data
 */
export function convertSongForGridRowValueCompact(
	song: Song,
): SongTableRowCompact {
	const title = getSongMetadataAsString(song, Song_MetadataTag.TITLE);
	const artist = getSongMetadataAsString(song, Song_MetadataTag.ARTIST);
	const albumArtist = getSongMetadataAsString(
		song,
		Song_MetadataTag.ALBUM_ARTIST,
	);
	const album = getSongMetadataAsString(song, Song_MetadataTag.ALBUM);

	return {
		firstLine: title,
		secondLine: `${album} / ${artist ?? albumArtist ?? "-"}`,
	};
}

/**
 * Retrieves current table song state.
 *
 * Gets clicked song, all songs in current sort order,
 * and selected songs from grid state. Essential for
 * table operations and context menu actions.
 *
 * @param clickedSongKey Clicked song key
 * @param gridApi Grid instance
 * @param songsMap Song lookup map
 * @returns Table song state
 */
export function getSongsInTableFromGrid(
	clickedSongKey: string | undefined,
	gridApi: GridApi,
	songsMap: Map<string, Song>,
): SongsInTable {
	const nodes: IRowNode[] = [];
	let clickedNode: IRowNode | undefined = undefined;
	gridApi.forEachNodeAfterFilterAndSort((node) => {
		nodes.push(node);
		if (clickedSongKey !== undefined && node.data?.key === clickedSongKey) {
			clickedNode = node;
		}
	});

	const clickedSong =
		clickedNode !== undefined
			? convertNodeToSong(songsMap, clickedNode)
			: undefined;
	const sortedSongs: Song[] = [];
	const selectedSortedSongs: Song[] = [];
	for (const node of nodes) {
		const song = convertNodeToSong(songsMap, node);
		if (song !== undefined) {
			sortedSongs.push(song);
			if (node.isSelected()) {
				selectedSortedSongs.push(song);
			}
		}
	}

	return {
		clickedSong,
		sortedSongs,
		selectedSortedSongs,
	};
}

/**
 * Sorts songs by column configuration.
 *
 * Applies multi-column sorting based on column sort order
 * and direction. Handles all metadata value types.
 *
 * @param songs Song list
 * @param columns Column config
 * @returns Sorted songs
 */
export function sortSongsByColumns(
	songs: Song[],
	columns: SongTableColumn[],
): Song[] {
	const conditions = columns
		.filter((column) => (column.sortOrder ?? -1) >= 0)
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		.sort((a, b) => a.sortOrder! - b.sortOrder!);
	return songs.sort((a, b) => {
		for (const condition of conditions) {
			const comp = compareSongsByMetadataValue(a, b, condition.tag);
			if (comp !== 0) {
				return condition.isSortDesc ? -comp : comp;
			}
		}
		return 0;
	});
}

/**
 * Creates updated table state.
 *
 * Generates new state from column changes while preserving
 * other settings. Handles sorting enable/disable.
 *
 * @param columns New columns
 * @param baseSongTableState Current state
 * @param isSortingEnabled Sorting flag
 * @returns Updated state
 */
export function createNewSongTableStateFromColumns(
	columns: SongTableColumn[],
	baseSongTableState: SongTableState,
	isSortingEnabled: boolean,
): SongTableState {
	const newState = baseSongTableState.clone();
	if (isSortingEnabled) {
		newState.columns = columns;
	} else {
		newState.columns = copySortingAttributesToNewColumns(
			columns,
			baseSongTableState.columns,
		);
	}
	return newState;
}
