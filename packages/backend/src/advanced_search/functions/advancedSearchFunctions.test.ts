import { create } from "@bufbuild/protobuf";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it, vi } from "vitest";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import {
	createErrorResponse,
	fetchSongs,
	toErrorMessage,
} from "./advancedSearchFunctions.js";

const createProfile = () => {
	return create(MpdProfileSchema, {
		name: "default",
		host: "localhost",
		port: 6600,
		password: "",
	});
};

const createMpdClient = (overrides?: Partial<MpdClient>): MpdClient => {
	return {
		execute: vi.fn(),
		executeBulk: vi.fn(),
		subscribe: vi.fn(),
		unsubscribe: vi.fn(),
		...overrides,
	};
};

describe("toErrorMessage", () => {
	it("returns message from Error instance", () => {
		expect(toErrorMessage(new Error("something broke"))).toBe(
			"something broke",
		);
	});

	it("returns string directly", () => {
		expect(toErrorMessage("raw error")).toBe("raw error");
	});

	it("returns unknown error for other types", () => {
		expect(toErrorMessage(42)).toBe("Unknown error");
		expect(toErrorMessage(null)).toBe("Unknown error");
		expect(toErrorMessage(undefined)).toBe("Unknown error");
	});
});

describe("createErrorResponse", () => {
	it("wraps Error into error response", () => {
		const response = createErrorResponse(new Error("fail"));
		expect(response.command.case).toBe("error");
		if (response.command.case === "error") {
			expect(response.command.value).toBe("fail");
		}
	});

	it("wraps string into error response", () => {
		const response = createErrorResponse("string error");
		expect(response.command.case).toBe("error");
		if (response.command.case === "error") {
			expect(response.command.value).toBe("string error");
		}
	});
});

describe("fetchSongs", () => {
	it("creates temp playlist, fetches songs, and cleans up", async () => {
		const song = create(SongSchema, { path: "music/song.mp3" });
		const mpdClient = createMpdClient({
			executeBulk: vi.fn().mockResolvedValue(undefined),
			execute: vi
				.fn()
				.mockResolvedValueOnce(
					create(MpdResponseSchema, {
						command: {
							case: "listplaylistinfo",
							value: { songs: [song] },
						},
					}),
				)
				.mockResolvedValueOnce(
					create(MpdResponseSchema, {
						command: { case: "rm", value: {} },
					}),
				),
		});

		const result = await fetchSongs(
			createProfile(),
			["music/song.mp3"],
			mpdClient,
		);

		expect(result).toHaveLength(1);
		expect(result[0].path).toBe("music/song.mp3");
		expect(mpdClient.executeBulk).toHaveBeenCalledTimes(1);
		expect(mpdClient.execute).toHaveBeenCalledTimes(2);
	});

	it("returns empty array when response has unexpected command case", async () => {
		const mpdClient = createMpdClient({
			executeBulk: vi.fn().mockResolvedValue(undefined),
			execute: vi
				.fn()
				.mockResolvedValueOnce(
					create(MpdResponseSchema, {
						command: { case: "rm", value: {} },
					}),
				)
				.mockResolvedValueOnce(
					create(MpdResponseSchema, {
						command: { case: "rm", value: {} },
					}),
				),
		});

		const result = await fetchSongs(
			createProfile(),
			["music/song.mp3"],
			mpdClient,
		);

		expect(result).toHaveLength(0);
	});

	it("sends no add commands for empty file paths", async () => {
		const mpdClient = createMpdClient({
			executeBulk: vi.fn().mockResolvedValue(undefined),
			execute: vi
				.fn()
				.mockResolvedValueOnce(
					create(MpdResponseSchema, {
						command: {
							case: "listplaylistinfo",
							value: { songs: [] },
						},
					}),
				)
				.mockResolvedValueOnce(
					create(MpdResponseSchema, {
						command: { case: "rm", value: {} },
					}),
				),
		});

		const result = await fetchSongs(createProfile(), [], mpdClient);

		expect(result).toHaveLength(0);
		expect(mpdClient.executeBulk).toHaveBeenCalledWith([]);
	});
});
