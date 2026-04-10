import { getSongMetadataAsString } from "@sola_mpd/shared/src/functions/songMetadata.js";
import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";

export type SongInformationLines = {
	firstLine: string;
	secondLine: string;
	thirdLine: string;
};

export function formatSongInformationLines(
	song: Song | undefined,
): SongInformationLines {
	if (song === undefined) {
		return { firstLine: "Not playing", secondLine: "", thirdLine: "" };
	}

	const firstLine = getSongMetadataAsString(song, Song_MetadataTag.TITLE);
	const secondLine = getSongMetadataAsString(song, Song_MetadataTag.ALBUM);

	const artist = getSongMetadataAsString(song, Song_MetadataTag.ARTIST);
	const albumArtist = getSongMetadataAsString(
		song,
		Song_MetadataTag.ALBUM_ARTIST,
	);
	const composer = getSongMetadataAsString(song, Song_MetadataTag.COMPOSER);
	const date = getSongMetadataAsString(song, Song_MetadataTag.DATE);
	let thirdLine = "";
	thirdLine += artist !== "" ? artist : albumArtist;
	thirdLine += composer !== "" ? ` / ${composer}` : "";
	thirdLine += date !== "" ? ` (${date})` : "";

	return { firstLine, secondLine, thirdLine };
}
