import { describe, expect, it } from "vitest";
import {
	resolveSettingsTabSlug,
	resolveSettingsTabValue,
	SETTINGS_TAB_SLUG_TO_VALUE,
} from "./settingsTabSlug";

describe("resolveSettingsTabValue / resolveSettingsTabSlug", () => {
	it("round-trips every current tab between its slug and its value", () => {
		for (const [slug, value] of Object.entries(SETTINGS_TAB_SLUG_TO_VALUE)) {
			expect(resolveSettingsTabValue(slug)).toBe(value);
			expect(resolveSettingsTabSlug(value)).toBe(slug);
		}
	});

	it("has exactly the four tabs of the scope-based restructure", () => {
		expect(Object.keys(SETTINGS_TAB_SLUG_TO_VALUE).sort()).toEqual([
			"device",
			"profiles",
			"raw-data",
			"shared",
		]);
	});

	it("falls back to the default tab for a retired slug (locale)", () => {
		expect(resolveSettingsTabValue("locale")).toBe("Profiles");
	});

	it("falls back to the default tab for a retired slug (advanced-search)", () => {
		expect(resolveSettingsTabValue("advanced-search")).toBe("Profiles");
	});

	it("falls back to the default tab for any other unknown slug", () => {
		expect(resolveSettingsTabValue("not-a-real-tab")).toBe("Profiles");
	});

	it("falls back to the default tab when no slug is present", () => {
		expect(resolveSettingsTabValue(undefined)).toBe("Profiles");
	});
});
