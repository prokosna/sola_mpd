import { create } from "@bufbuild/protobuf";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { describe, expect, it } from "vitest";
import {
	createAddToPlaylistRequests,
	createErrorResponse,
	createListPlaylistRequest,
	createRemovePlaylistRequest,
	createTempPlaylistName,
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

describe("createTempPlaylistName", () => {
	it("scales the random number into the playlist name", () => {
		expect(createTempPlaylistName(0.5)).toBe("_temp_search_result_500000");
		expect(createTempPlaylistName(0)).toBe("_temp_search_result_0");
	});
});

describe("playlist request builders", () => {
	it("builds one playlistadd request per file path", () => {
		const requests = createAddToPlaylistRequests(createProfile(), "tmp", [
			"a.mp3",
			"b.mp3",
		]);
		expect(requests.map((r) => r.command)).toEqual([
			{
				case: "playlistadd",
				value: expect.objectContaining({ name: "tmp", uri: "a.mp3" }),
			},
			{
				case: "playlistadd",
				value: expect.objectContaining({ name: "tmp", uri: "b.mp3" }),
			},
		]);
	});

	it("builds listplaylistinfo and rm requests for the playlist", () => {
		const list = createListPlaylistRequest(createProfile(), "tmp");
		const rm = createRemovePlaylistRequest(createProfile(), "tmp");
		expect(list.command.case).toBe("listplaylistinfo");
		expect(rm.command.case).toBe("rm");
		expect(list.command.value).toEqual(
			expect.objectContaining({ name: "tmp" }),
		);
		expect(rm.command.value).toEqual(expect.objectContaining({ name: "tmp" }));
	});
});
