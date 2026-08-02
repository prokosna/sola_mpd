import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import type { BrowserSelection } from "../types/browserSelection";

import {
	decodeBrowserSelectionValue,
	encodeBrowserSelection,
	serializeBrowserSelection,
} from "./serializeBrowserSelection";

describe("serializeBrowserSelection", () => {
	it("drops entries with no selected values before encoding", () => {
		const selection: BrowserSelection = [
			{ tag: Song_MetadataTag.ARTIST, values: [] },
			{ tag: Song_MetadataTag.ALBUM, values: ["Abbey Road"] },
		];
		const result = serializeBrowserSelection(selection);
		expect(result).toEqual({
			kind: "inline",
			value: encodeBrowserSelection(selection),
		});
		expect(
			decodeBrowserSelectionValue(encodeBrowserSelection(selection)),
		).toEqual([{ tag: Song_MetadataTag.ALBUM, values: ["Abbey Road"] }]);
	});

	describe("the 2,000 character threshold", () => {
		// Determine the fixed overhead of the encoding by padding a single
		// value, so the test doesn't hardcode the exact serialization format.
		function selectionWithPaddedValue(padLength: number): BrowserSelection {
			return [
				{ tag: Song_MetadataTag.ARTIST, values: ["x".repeat(padLength)] },
			];
		}

		const overhead = encodeBrowserSelection(selectionWithPaddedValue(0)).length;

		it("is inline at exactly 2,000 characters", () => {
			const selection = selectionWithPaddedValue(2000 - overhead);
			const value = encodeBrowserSelection(selection);
			expect(value.length).toBe(2000);

			const result = serializeBrowserSelection(selection);
			expect(result.kind).toBe("inline");
			if (result.kind === "inline") {
				expect(result.value.length).toBe(2000);
			}
		});

		it("is a blob at 2,001 characters", () => {
			const selection = selectionWithPaddedValue(2001 - overhead);
			const value = encodeBrowserSelection(selection);
			expect(value.length).toBe(2001);

			const result = serializeBrowserSelection(selection);
			expect(result.kind).toBe("blob");
			if (result.kind === "blob") {
				expect(result.payload.length).toBe(2001);
			}
		});
	});
});

describe("decodeBrowserSelectionValue", () => {
	it("falls back to an empty selection for invalid input", () => {
		expect(decodeBrowserSelectionValue("not json")).toEqual([]);
		expect(decodeBrowserSelectionValue("{}")).toEqual([]);
		expect(decodeBrowserSelectionValue("[[1]]")).toEqual([]);
		expect(decodeBrowserSelectionValue('[["a", ["b"]]]')).toEqual([]);
	});
});
