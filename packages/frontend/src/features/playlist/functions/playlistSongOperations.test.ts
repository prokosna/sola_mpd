import { create } from "@bufbuild/protobuf";
import {
	type MpdProfile,
	MpdProfileSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { SongTableKeyType } from "../../song_table/types/songTableTypes";
import {
	buildAddSongsToPlaylistCommands,
	buildClearPlaylistCommands,
	buildDeletePlaylistCommand,
	buildDropDuplicatePlaylistSongsCommands,
	buildRemovePlaylistSongsCommands,
	buildReorderPlaylistCommands,
} from "./playlistSongOperations";

function createProfile(): MpdProfile {
	return create(MpdProfileSchema, {
		name: "test",
		host: "localhost",
		port: 6600,
	});
}

describe("buildRemovePlaylistSongsCommands", () => {
	it("should build clear + add commands for remaining songs", () => {
		const allSongs = [
			create(SongSchema, { path: "/a.mp3" }),
			create(SongSchema, { path: "/b.mp3" }),
			create(SongSchema, { path: "/c.mp3" }),
		];
		const targetSongs = [create(SongSchema, { path: "/b.mp3" })];
		const commands = buildRemovePlaylistSongsCommands(
			targetSongs,
			allSongs,
			"MyPlaylist",
			createProfile(),
			SongTableKeyType.PATH,
		);
		expect(commands).toHaveLength(3);
		expect(commands[0].command.case).toBe("playlistclear");
		expect(commands[1].command.case).toBe("playlistadd");
		expect(commands[2].command.case).toBe("playlistadd");
		if (commands[1].command.case === "playlistadd") {
			expect(commands[1].command.value.uri).toBe("/a.mp3");
		}
		if (commands[2].command.case === "playlistadd") {
			expect(commands[2].command.value.uri).toBe("/c.mp3");
		}
	});

	it("should return only clear command when all songs are removed", () => {
		const songs = [create(SongSchema, { path: "/a.mp3" })];
		const commands = buildRemovePlaylistSongsCommands(
			songs,
			songs,
			"MyPlaylist",
			createProfile(),
			SongTableKeyType.PATH,
		);
		expect(commands).toHaveLength(1);
		expect(commands[0].command.case).toBe("playlistclear");
	});
});

describe("buildClearPlaylistCommands", () => {
	it("should return a single playlistclear command", () => {
		const commands = buildClearPlaylistCommands("MyPlaylist", createProfile());
		expect(commands).toHaveLength(1);
		expect(commands[0].command.case).toBe("playlistclear");
		if (commands[0].command.case === "playlistclear") {
			expect(commands[0].command.value.name).toBe("MyPlaylist");
		}
	});
});

describe("buildDropDuplicatePlaylistSongsCommands", () => {
	it("should return commands to rebuild playlist without duplicates", () => {
		const songs = [
			create(SongSchema, { path: "/a.mp3" }),
			create(SongSchema, { path: "/b.mp3" }),
			create(SongSchema, { path: "/a.mp3" }),
		];
		const { commands, duplicateCount } =
			buildDropDuplicatePlaylistSongsCommands(
				songs,
				"MyPlaylist",
				createProfile(),
			);
		expect(duplicateCount).toBe(1);
		expect(commands).toHaveLength(3);
		expect(commands[0].command.case).toBe("playlistclear");
		expect(commands[1].command.case).toBe("playlistadd");
		expect(commands[2].command.case).toBe("playlistadd");
	});

	it("should return empty commands and zero count when no duplicates", () => {
		const songs = [
			create(SongSchema, { path: "/a.mp3" }),
			create(SongSchema, { path: "/b.mp3" }),
		];
		const { commands, duplicateCount } =
			buildDropDuplicatePlaylistSongsCommands(
				songs,
				"MyPlaylist",
				createProfile(),
			);
		expect(duplicateCount).toBe(0);
		expect(commands).toHaveLength(0);
	});

	it("should handle empty song list", () => {
		const { commands, duplicateCount } =
			buildDropDuplicatePlaylistSongsCommands(
				[],
				"MyPlaylist",
				createProfile(),
			);
		expect(duplicateCount).toBe(0);
		expect(commands).toHaveLength(0);
	});
});

describe("buildReorderPlaylistCommands", () => {
	it("should build clear + add commands in new order", () => {
		const orderedSongs = [
			create(SongSchema, { path: "/b.mp3" }),
			create(SongSchema, { path: "/a.mp3" }),
		];
		const commands = buildReorderPlaylistCommands(
			orderedSongs,
			"MyPlaylist",
			createProfile(),
		);
		expect(commands).toHaveLength(3);
		expect(commands[0].command.case).toBe("playlistclear");
		if (commands[1].command.case === "playlistadd") {
			expect(commands[1].command.value.uri).toBe("/b.mp3");
		}
		if (commands[2].command.case === "playlistadd") {
			expect(commands[2].command.value.uri).toBe("/a.mp3");
		}
	});
});

describe("buildDeletePlaylistCommand", () => {
	it("should build an rm command", () => {
		const command = buildDeletePlaylistCommand("MyPlaylist", createProfile());
		expect(command.command.case).toBe("rm");
		if (command.command.case === "rm") {
			expect(command.command.value.name).toBe("MyPlaylist");
		}
	});
});

describe("buildAddSongsToPlaylistCommands", () => {
	it("should build playlistadd commands for each song", () => {
		const songs = [
			create(SongSchema, { path: "/a.mp3" }),
			create(SongSchema, { path: "/b.mp3" }),
		];
		const commands = buildAddSongsToPlaylistCommands(
			songs,
			"MyPlaylist",
			createProfile(),
		);
		expect(commands).toHaveLength(2);
		expect(commands[0].command.case).toBe("playlistadd");
		expect(commands[1].command.case).toBe("playlistadd");
		if (commands[0].command.case === "playlistadd") {
			expect(commands[0].command.value.uri).toBe("/a.mp3");
			expect(commands[0].command.value.name).toBe("MyPlaylist");
		}
	});

	it("should return empty array for no songs", () => {
		const commands = buildAddSongsToPlaylistCommands(
			[],
			"MyPlaylist",
			createProfile(),
		);
		expect(commands).toHaveLength(0);
	});
});
