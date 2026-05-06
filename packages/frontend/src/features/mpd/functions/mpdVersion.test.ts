import { describe, expect, it } from "vitest";

import { isMpd024OrLater, isMpdVersionAtLeast } from "./mpdVersion";

describe("isMpdVersionAtLeast", () => {
	it("returns true when version meets minimum", () => {
		expect(isMpdVersionAtLeast("0.24.0", "0.24")).toBe(true);
		expect(isMpdVersionAtLeast("0.24.5", "0.24")).toBe(true);
		expect(isMpdVersionAtLeast("0.25", "0.24")).toBe(true);
		expect(isMpdVersionAtLeast("1.0.0", "0.24")).toBe(true);
		expect(isMpdVersionAtLeast("0.21.0", "0.21")).toBe(true);
	});

	it("returns false when version is below minimum", () => {
		expect(isMpdVersionAtLeast("0.23.5", "0.24")).toBe(false);
		expect(isMpdVersionAtLeast("0.20.0", "0.21")).toBe(false);
	});

	it("strips MPD-style pre-release suffixes before comparing", () => {
		expect(isMpdVersionAtLeast("0.24.0~git", "0.24")).toBe(true);
		expect(isMpdVersionAtLeast("0.24.0 dev", "0.24")).toBe(true);
		expect(isMpdVersionAtLeast("  0.24.0  ", "0.24")).toBe(true);
	});

	it("returns false for unknown / unparseable input", () => {
		expect(isMpdVersionAtLeast(undefined, "0.24")).toBe(false);
		expect(isMpdVersionAtLeast("", "0.24")).toBe(false);
		expect(isMpdVersionAtLeast("   ", "0.24")).toBe(false);
		expect(isMpdVersionAtLeast("not-a-version", "0.24")).toBe(false);
	});
});

describe("isMpd024OrLater", () => {
	it("returns true for MPD >= 0.24", () => {
		expect(isMpd024OrLater("0.24.0")).toBe(true);
		expect(isMpd024OrLater("0.25.3")).toBe(true);
		expect(isMpd024OrLater("1.0.0")).toBe(true);
	});

	it("returns false for MPD < 0.24", () => {
		expect(isMpd024OrLater("0.23.5")).toBe(false);
		expect(isMpd024OrLater("0.0.1")).toBe(false);
	});

	it("returns false for unknown version", () => {
		expect(isMpd024OrLater(undefined)).toBe(false);
		expect(isMpd024OrLater("")).toBe(false);
	});
});
