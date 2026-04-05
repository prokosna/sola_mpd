import { getSongMetadataAsString } from "@sola_mpd/shared/src/functions/songMetadata.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import type { IRowNode } from "ag-grid-community";

import type {
	SongTableContextMenuItemParams,
	SongTableKeyType,
} from "../types/songTableTypes";
import { SongTableKeyType as KeyType } from "../types/songTableTypes";

export function getSongTableKey(song: Song, keyType: SongTableKeyType): string {
	switch (keyType) {
		case KeyType.ID: {
			const id = getSongMetadataAsString(song, Song_MetadataTag.ID);
			if (id === "") {
				console.warn(
					`ID is specified as a song table key, but ID is empty: ${song}`,
				);
			}
			return id;
		}
		case KeyType.PATH: {
			return song.path;
		}
		case KeyType.INDEX_PATH: {
			return `${song.index}_${song.path}`;
		}
		default:
			throw Error(`Unsupported song table key: ${keyType}.`);
	}
}

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
