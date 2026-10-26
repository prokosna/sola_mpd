import {
	AdvancedSearchCommand_SimilarityType,
	AdvancedSearchCommand_TextToMusicType,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { advancedSearchApiHttp } from "./AdvancedSearchApiHttp.js";

const endpoint = "http://lainbow.test";

function mockFetch(status: number, body?: unknown) {
	const fetchMock = vi.fn().mockResolvedValue(
		new Response(body === undefined ? "" : JSON.stringify(body), {
			status,
			headers: { "Content-Type": "application/json" },
		}),
	);
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

const similarInput = {
	endpoint,
	songPath: "a/b.mp3",
	similarityType: AdvancedSearchCommand_SimilarityType.MUQ,
	limit: 10,
};
const textInput = {
	endpoint,
	query: "lofi",
	textToMusicType: AdvancedSearchCommand_TextToMusicType.MUQ_MULAN,
	limit: 10,
};

describe("AdvancedSearchApiHttp", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("maps 404 of similarity search to a not-analyzed error", async () => {
		mockFetch(404, { detail: "Song not found" });
		const result = await advancedSearchApiHttp.searchSimilarSongs(similarInput);
		expect(result).toEqual({
			kind: "error",
			message:
				"This song has not been analyzed yet. Lainbow analyzes new songs automatically, so please try again later.",
		});
	});

	it("maps 422 of similarity search including the detail", async () => {
		mockFetch(422, { detail: "bad model" });
		const result = await advancedSearchApiHttp.searchSimilarSongs(similarInput);
		expect(result).toEqual({
			kind: "error",
			message: "Lainbow cannot run this search: bad model",
		});
	});

	it("throws on other failures of similarity search", async () => {
		mockFetch(500, { detail: "boom" });
		await expect(
			advancedSearchApiHttp.searchSimilarSongs(similarInput),
		).rejects.toThrow("status 500");
	});

	it("returns file paths of similarity search", async () => {
		mockFetch(200, { songs: [{ file_path: "x.mp3" }] });
		const result = await advancedSearchApiHttp.searchSimilarSongs(similarInput);
		expect(result).toEqual({ kind: "songs", filePaths: ["x.mp3"] });
	});

	it("maps 503 of text search to a not-ready error", async () => {
		mockFetch(503, { detail: "engine down" });
		const result = await advancedSearchApiHttp.searchTextToMusic(textInput);
		expect(result).toEqual({
			kind: "error",
			message:
				"Text search is not ready yet. Lainbow's analysis engine is starting up or not running.",
		});
	});

	it("maps 422 of text search including the detail", async () => {
		mockFetch(422, { detail: "query too long" });
		const result = await advancedSearchApiHttp.searchTextToMusic(textInput);
		expect(result).toEqual({
			kind: "error",
			message: "Lainbow cannot run this search: query too long",
		});
	});

	it("returns file paths of text search", async () => {
		mockFetch(200, { songs: [{ file_path: "y.mp3" }] });
		const result = await advancedSearchApiHttp.searchTextToMusic(textInput);
		expect(result).toEqual({ kind: "songs", filePaths: ["y.mp3"] });
	});
});
