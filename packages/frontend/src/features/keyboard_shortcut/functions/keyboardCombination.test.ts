import { describe, expect, it } from "vitest";

import {
	isInputElementActive,
	isKeyCombinationPressed,
} from "./keyboardCombination";

describe("keyboardCombination", () => {
	describe("isInputElementActive", () => {
		it("should return false for null", () => {
			expect(isInputElementActive(null)).toBe(false);
		});

		it("should return true for INPUT element", () => {
			const element = { tagName: "INPUT" } as Element;
			expect(isInputElementActive(element)).toBe(true);
		});

		it("should return true for TEXTAREA element", () => {
			const element = { tagName: "TEXTAREA" } as Element;
			expect(isInputElementActive(element)).toBe(true);
		});

		it("should return true for contentEditable element", () => {
			const element = {
				tagName: "DIV",
				isContentEditable: true,
			} as unknown as Element;
			expect(isInputElementActive(element)).toBe(true);
		});

		it("should return false for regular elements", () => {
			const element = {
				tagName: "DIV",
				isContentEditable: false,
			} as unknown as Element;
			expect(isInputElementActive(element)).toBe(false);
		});
	});

	describe("isKeyCombinationPressed", () => {
		it("should return true when all required keys are pressed", () => {
			const pressed = new Set(["Control", "s"]);
			expect(isKeyCombinationPressed(pressed, ["Control", "s"])).toBe(true);
		});

		it("should return false when some keys are missing", () => {
			const pressed = new Set(["Control"]);
			expect(isKeyCombinationPressed(pressed, ["Control", "s"])).toBe(false);
		});

		it("should return true for empty required keys", () => {
			const pressed = new Set<string>();
			expect(isKeyCombinationPressed(pressed, [])).toBe(true);
		});

		it("should return true with extra keys pressed", () => {
			const pressed = new Set(["Control", "Shift", "s"]);
			expect(isKeyCombinationPressed(pressed, ["Control", "s"])).toBe(true);
		});
	});
});
