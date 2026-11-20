import { describe, expect, it } from "vitest";
import {
	DEFAULT_WINDOW_STATE,
	isVisibleOnAnyDisplay,
	parseWindowState,
} from "./windowState.js";

describe("windowState", () => {
	const primaryDisplay = [{ x: 0, y: 0, width: 1920, height: 1080 }];

	it("restores valid bounds on a visible display", () => {
		const raw = JSON.stringify({
			width: 1024,
			height: 768,
			x: 100,
			y: 50,
			isMaximized: true,
		});

		expect(parseWindowState(raw, primaryDisplay)).toEqual({
			width: 1024,
			height: 768,
			x: 100,
			y: 50,
			isMaximized: true,
		});
	});

	it("drops off-screen coordinates while keeping size", () => {
		const raw = JSON.stringify({
			width: 1000,
			height: 700,
			x: 4000,
			y: 2000,
			isMaximized: false,
		});

		expect(parseWindowState(raw, primaryDisplay)).toEqual({
			width: 1000,
			height: 700,
			x: undefined,
			y: undefined,
			isMaximized: false,
		});
	});

	it("falls back to defaults on invalid JSON or undersized dimensions", () => {
		expect(parseWindowState("{invalid", primaryDisplay)).toEqual(
			DEFAULT_WINDOW_STATE,
		);
		expect(
			parseWindowState(
				JSON.stringify({ width: 100, height: 800 }),
				primaryDisplay,
			),
		).toEqual(DEFAULT_WINDOW_STATE);
	});

	it("checks intersection across multiple displays", () => {
		const displays = [
			{ x: 0, y: 0, width: 1920, height: 1080 },
			{ x: 1920, y: 0, width: 1920, height: 1080 },
		];
		expect(isVisibleOnAnyDisplay(2000, 100, 800, 600, displays)).toBe(true);
		expect(isVisibleOnAnyDisplay(-900, 0, 800, 600, displays)).toBe(false);
	});
});
