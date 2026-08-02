import { beforeEach, describe, expect, it } from "vitest";
import { resetPaneLayout } from "./resetPaneLayout";

describe("resetPaneLayout", () => {
	beforeEach(() => {
		globalThis.localStorage.clear();
	});

	it("removes every react-resizable-panels key, including dynamic per-filter-set variants, and leaves other keys alone", () => {
		globalThis.localStorage.setItem("react-resizable-panels:search", "[1,2]");
		globalThis.localStorage.setItem(
			"react-resizable-panels:browser-view",
			"[3,4]",
		);
		globalThis.localStorage.setItem(
			"react-resizable-panels:browser-navigation-view:Artist:Album",
			"[5,6]",
		);
		globalThis.localStorage.setItem(
			"sola:v1:device:songTableColumnLayout",
			"{}",
		);

		resetPaneLayout(globalThis.localStorage);

		expect(
			globalThis.localStorage.getItem("react-resizable-panels:search"),
		).toBeNull();
		expect(
			globalThis.localStorage.getItem("react-resizable-panels:browser-view"),
		).toBeNull();
		expect(
			globalThis.localStorage.getItem(
				"react-resizable-panels:browser-navigation-view:Artist:Album",
			),
		).toBeNull();
		expect(
			globalThis.localStorage.getItem("sola:v1:device:songTableColumnLayout"),
		).toBe("{}");
	});

	it("is a no-op when there is nothing to remove", () => {
		expect(() => resetPaneLayout(globalThis.localStorage)).not.toThrow();
	});
});
