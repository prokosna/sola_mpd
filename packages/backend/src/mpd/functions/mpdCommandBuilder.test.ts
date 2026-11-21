import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import { FolderSchema } from "@sola_mpd/shared/src/models/file_explore_pb.js";
import {
	FilterCondition_Operator,
	FilterConditionSchema,
} from "@sola_mpd/shared/src/models/filter_pb.js";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";
import { buildMpdCommand } from "./mpdCommandBuilder.js";

describe("buildMpdCommand", () => {
	it("builds simple no-arg commands", () => {
		const cases = [
			["ping", "ping"],
			["next", "next"],
			["previous", "previous"],
			["stop", "stop"],
			["getvol", "getvol"],
			["currentsong", "currentsong"],
			["status", "status"],
			["stats", "stats"],
			["clear", "clear"],
			["playlistinfo", "playlistinfo"],
			["shuffle", "shuffle"],
			["listplaylists", "listplaylists"],
			["update", "update"],
			["outputs", "outputs"],
			["listAllSongs", "listallinfo"],
			["listAllFolders", "listall"],
		] as const;

		for (const [reqCase, expectedName] of cases) {
			const req = create(MpdRequestSchema, {
				command: { case: reqCase, value: {} },
			});
			expect(buildMpdCommand(req)).toEqual({ name: expectedName, args: [] });
		}
	});

	it("builds pause and boolean toggle commands", () => {
		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "pause", value: { pause: true } },
				}),
			),
		).toEqual({ name: "pause", args: ["1"] });
		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "pause", value: { pause: false } },
				}),
			),
		).toEqual({ name: "pause", args: ["0"] });

		for (const toggle of ["consume", "random", "repeat", "single"] as const) {
			expect(
				buildMpdCommand(
					create(MpdRequestSchema, {
						command: { case: toggle, value: { enable: true } },
					}),
				),
			).toEqual({ name: toggle, args: ["1"] });
			expect(
				buildMpdCommand(
					create(MpdRequestSchema, {
						command: { case: toggle, value: { enable: false } },
					}),
				),
			).toEqual({ name: toggle, args: ["0"] });
		}
	});

	it("builds play command for id, pos, and default targets", () => {
		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "play",
						value: { target: { case: "id", value: "42" } },
					},
				}),
			),
		).toEqual({ name: "playid", args: ["42"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "play",
						value: { target: { case: "pos", value: "3" } },
					},
				}),
			),
		).toEqual({ name: "play", args: ["3"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "play", value: {} },
				}),
			),
		).toEqual({ name: "play", args: [] });
	});

	it("builds seek command and rejects missing target", () => {
		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "seek",
						value: { target: { case: "id", value: "7" }, time: 30.5 },
					},
				}),
			),
		).toEqual({ name: "seekid", args: ["7", "30.5"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "seek",
						value: { target: { case: "pos", value: "2" }, time: 15 },
					},
				}),
			),
		).toEqual({ name: "seek", args: ["2", "15"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "seek",
						value: { target: { case: "current", value: true }, time: 60 },
					},
				}),
			),
		).toEqual({ name: "seekcur", args: ["60"] });

		expect(() =>
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "seek", value: { time: 10 } },
				}),
			),
		).toThrow("Unsupported command");
	});

	it("builds setvol, add, delete, and move commands", () => {
		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "setvol", value: { vol: 75 } },
				}),
			),
		).toEqual({ name: "setvol", args: ["75"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "add", value: { uri: "music/track.flac" } },
				}),
			),
		).toEqual({ name: "add", args: ["music/track.flac"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "delete",
						value: { target: { case: "id", value: "9" } },
					},
				}),
			),
		).toEqual({ name: "deleteid", args: ["9"] });
		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "delete",
						value: { target: { case: "pos", value: "1" } },
					},
				}),
			),
		).toEqual({ name: "delete", args: ["1"] });
		expect(() =>
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "delete", value: {} },
				}),
			),
		).toThrow("Unsupported command");

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "move",
						value: { from: { case: "fromId", value: "5" }, to: "2" },
					},
				}),
			),
		).toEqual({ name: "moveid", args: ["5", "2"] });
		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "move",
						value: { from: { case: "fromPos", value: "0" }, to: "4" },
					},
				}),
			),
		).toEqual({ name: "move", args: ["0", "4"] });
		expect(() =>
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "move", value: { to: "1" } },
				}),
			),
		).toThrow("Unsupported command");
	});

	it("builds stored playlist commands", () => {
		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "listplaylistinfo", value: { name: "favs" } },
				}),
			),
		).toEqual({ name: "listplaylistinfo", args: ["favs"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "playlistadd",
						value: { name: "favs", uri: "a/b.flac" },
					},
				}),
			),
		).toEqual({ name: "playlistadd", args: ["favs", "a/b.flac"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "playlistclear", value: { name: "favs" } },
				}),
			),
		).toEqual({ name: "playlistclear", args: ["favs"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "playlistdelete",
						value: { name: "favs", pos: "2" },
					},
				}),
			),
		).toEqual({ name: "playlistdelete", args: ["favs", "2"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "playlistmove",
						value: { name: "favs", from: "1", to: "3" },
					},
				}),
			),
		).toEqual({ name: "playlistmove", args: ["favs", "1", "3"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "rename",
						value: { name: "old", newName: "new" },
					},
				}),
			),
		).toEqual({ name: "rename", args: ["old", "new"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "rm", value: { name: "old" } },
				}),
			),
		).toEqual({ name: "rm", args: ["old"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "save", value: { name: "snap" } },
				}),
			),
		).toEqual({ name: "save", args: ["snap"] });

		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "load", value: { name: "snap" } },
				}),
			),
		).toEqual({ name: "load", args: ["snap"] });
	});

	it("builds list command with and without conditions", () => {
		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "list",
						value: { tag: Song_MetadataTag.ARTIST, conditions: [] },
					},
				}),
			),
		).toEqual({ name: "list", args: ["artist"] });

		const condition = create(FilterConditionSchema, {
			tag: Song_MetadataTag.GENRE,
			operator: FilterCondition_Operator.EQUAL,
			value: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: "Jazz" }),
				},
			}),
		});
		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "list",
						value: { tag: Song_MetadataTag.ALBUM, conditions: [condition] },
					},
				}),
			),
		).toEqual({ name: "list", args: ["album", '((genre == "Jazz"))'] });
	});

	it("builds search command with empty conditions fallback, sort, and window", () => {
		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "search",
						value: {
							conditions: [],
							sort: { tag: Song_MetadataTag.ADDED_AT, descending: true },
							window: { start: 0, end: 100 },
						},
					},
				}),
			),
		).toEqual({
			name: "search",
			args: ['(base "")', "sort", "-Added", "window", "0:100"],
		});
	});

	it("builds listSongsInFolder and rejects missing folder", () => {
		expect(
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: {
						case: "listSongsInFolder",
						value: { folder: create(FolderSchema, { path: "rock/2020" }) },
					},
				}),
			),
		).toEqual({ name: "lsinfo", args: ["rock/2020"] });

		expect(() =>
			buildMpdCommand(
				create(MpdRequestSchema, {
					command: { case: "listSongsInFolder", value: {} },
				}),
			),
		).toThrow("Folder is undefined for listSongsInFolder");
	});

	it("throws when command is unset", () => {
		expect(() => buildMpdCommand(create(MpdRequestSchema))).toThrow(
			"Unsupported command",
		);
	});
});
