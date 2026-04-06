import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	type MpdProfile,
	MpdProfileSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { SongTableKeyType } from "../../song_table/types/songTableTypes";
import {
	buildClearQueueCommands,
	buildPlaySongByIdCommand,
	buildRemoveQueueSongsCommands,
	buildReorderQueueCommands,
} from "./playQueueSongOperations";

function createProfile(): MpdProfile {
	return create(MpdProfileSchema, {
		name: "test",
		host: "localhost",
		port: 6600,
	});
}

function createSongWithId(path: string, id: string) {
	return create(SongSchema, {
		path,
		metadata: {
			[Song_MetadataTag.ID]: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: id }),
				},
			}),
		},
	});
}

describe("buildRemoveQueueSongsCommands", () => {
	it("should build delete commands for each song", () => {
		const songs = [
			createSongWithId("/a.mp3", "1"),
			createSongWithId("/b.mp3", "2"),
		];
		const commands = buildRemoveQueueSongsCommands(songs, createProfile());
		expect(commands).toHaveLength(2);
		expect(commands[0].command.case).toBe("delete");
		expect(commands[1].command.case).toBe("delete");
	});

	it("should return empty array for no songs", () => {
		const commands = buildRemoveQueueSongsCommands([], createProfile());
		expect(commands).toHaveLength(0);
	});
});

describe("buildClearQueueCommands", () => {
	it("should return a single clear command", () => {
		const commands = buildClearQueueCommands(createProfile());
		expect(commands).toHaveLength(1);
		expect(commands[0].command.case).toBe("clear");
	});
});

describe("buildReorderQueueCommands", () => {
	it("should build move commands for reordered songs", () => {
		const current = [
			createSongWithId("/a.mp3", "1"),
			createSongWithId("/b.mp3", "2"),
		];
		const reordered = [
			createSongWithId("/b.mp3", "2"),
			createSongWithId("/a.mp3", "1"),
		];
		const commands = buildReorderQueueCommands(
			current,
			reordered,
			SongTableKeyType.ID,
			createProfile(),
		);
		expect(commands.length).toBeGreaterThan(0);
		for (const cmd of commands) {
			expect(cmd.command.case).toBe("move");
		}
	});

	it("should return empty array when order is unchanged", () => {
		const songs = [
			createSongWithId("/a.mp3", "1"),
			createSongWithId("/b.mp3", "2"),
		];
		const commands = buildReorderQueueCommands(
			songs,
			songs,
			SongTableKeyType.ID,
			createProfile(),
		);
		expect(commands).toHaveLength(0);
	});
});

describe("buildPlaySongByIdCommand", () => {
	it("should build a play command with song id", () => {
		const song = createSongWithId("/a.mp3", "42");
		const command = buildPlaySongByIdCommand(song, createProfile());
		expect(command.command.case).toBe("play");
		if (command.command.case === "play") {
			expect(command.command.value.target.case).toBe("id");
			expect(command.command.value.target.value).toBe("42");
		}
	});
});
