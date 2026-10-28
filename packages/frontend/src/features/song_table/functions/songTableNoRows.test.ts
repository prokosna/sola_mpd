import { describe, expect, it } from "vitest";

import {
	getSongTableNoRowsMessage,
	SONG_TABLE_NO_ROWS_FILTERED_MESSAGE,
} from "./songTableNoRows";

describe("getSongTableNoRowsMessage", () => {
	it("should guide the user when nothing has been chosen yet", () => {
		expect(
			getSongTableNoRowsMessage({ isIdle: true, message: "Select one." }, true),
		).toBe("Select one.");
	});

	it("should blame the global filter when it is applied", () => {
		expect(
			getSongTableNoRowsMessage({ isIdle: false, message: "Empty." }, true),
		).toBe(SONG_TABLE_NO_ROWS_FILTERED_MESSAGE);
	});

	it("should report the empty source otherwise", () => {
		expect(
			getSongTableNoRowsMessage({ isIdle: false, message: "Empty." }, false),
		).toBe("Empty.");
	});
});
