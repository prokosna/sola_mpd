import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import type { BrowserSelection } from "../types/browserSelection";

import { deserializeBrowserSelection } from "./deserializeBrowserSelection";
import { serializeBrowserSelection } from "./serializeBrowserSelection";

const PARAM = "bsel";

describe("deserializeBrowserSelection", () => {
	it("returns an empty selection when the query string has no relevant params", () => {
		expect(deserializeBrowserSelection("", PARAM)).toEqual({
			kind: "selection",
			selection: [],
		});
		expect(deserializeBrowserSelection("?other=1", PARAM)).toEqual({
			kind: "selection",
			selection: [],
		});
	});

	it("recognises ?vs=<token> and defers resolution to the caller", () => {
		expect(deserializeBrowserSelection("?vs=abc123", PARAM)).toEqual({
			kind: "token",
			token: "abc123",
		});
	});

	it("prefers the blob token over an inline value if both are present", () => {
		const result = deserializeBrowserSelection(
			`?${PARAM}=%5B%5D&vs=abc123`,
			PARAM,
		);
		expect(result).toEqual({ kind: "token", token: "abc123" });
	});

	it("round-trips through serializeBrowserSelection for an inline selection", () => {
		const selection: BrowserSelection = [
			{ tag: Song_MetadataTag.ALBUM_ARTIST, values: ["Pink Floyd"] },
			{ tag: Song_MetadataTag.ALBUM, values: ["The Wall", "Animals"] },
		];
		const serialized = serializeBrowserSelection(selection);
		expect(serialized.kind).toBe("inline");
		if (serialized.kind !== "inline") {
			throw new Error("expected an inline serialization for this test");
		}

		const params = new URLSearchParams();
		params.set(PARAM, serialized.value);

		const deserialized = deserializeBrowserSelection(params.toString(), PARAM);
		expect(deserialized).toEqual({ kind: "selection", selection });
	});
});
