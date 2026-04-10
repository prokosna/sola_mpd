import { create } from "@bufbuild/protobuf";
import {
	type MpdProfile,
	MpdProfileSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import {
	buildAddCommands,
	buildReplaceQueueCommands,
} from "./songTableCommand";

function createProfile(): MpdProfile {
	return create(MpdProfileSchema, {
		name: "test",
		host: "localhost",
		port: 6600,
	});
}

describe("songTableCommand", () => {
	describe("buildAddCommands", () => {
		it("should create add commands for each song", () => {
			const songs = [
				create(SongSchema, { path: "/a.mp3" }),
				create(SongSchema, { path: "/b.mp3" }),
			];
			const profile = createProfile();
			const commands = buildAddCommands(songs, profile);
			expect(commands).toHaveLength(2);
			expect(commands[0].command.case).toBe("add");
			expect(commands[1].command.case).toBe("add");
			if (commands[0].command.case === "add") {
				expect(commands[0].command.value.uri).toBe("/a.mp3");
			}
			if (commands[1].command.case === "add") {
				expect(commands[1].command.value.uri).toBe("/b.mp3");
			}
		});

		it("should return empty array for no songs", () => {
			const commands = buildAddCommands([], createProfile());
			expect(commands).toHaveLength(0);
		});
	});

	describe("buildReplaceQueueCommands", () => {
		it("should start with clear command followed by add commands", () => {
			const songs = [create(SongSchema, { path: "/a.mp3" })];
			const profile = createProfile();
			const commands = buildReplaceQueueCommands(songs, profile);
			expect(commands).toHaveLength(2);
			expect(commands[0].command.case).toBe("clear");
			expect(commands[1].command.case).toBe("add");
		});

		it("should have only clear command for empty songs", () => {
			const commands = buildReplaceQueueCommands([], createProfile());
			expect(commands).toHaveLength(1);
			expect(commands[0].command.case).toBe("clear");
		});
	});
});
