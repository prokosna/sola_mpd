import { describe, expect, it } from "vitest";

import { shouldNotifyMpdError } from "./mpdErrorNotification";

describe("shouldNotifyMpdError", () => {
	it("notifies a message seen for the first time", () => {
		expect(shouldNotifyMpdError(new Map(), "boom", 1_000, 5_000)).toBe(true);
	});

	it("suppresses the same message within the window", () => {
		const last = new Map([["boom", 1_000]]);
		expect(shouldNotifyMpdError(last, "boom", 5_999, 5_000)).toBe(false);
	});

	it("notifies the same message again once the window has passed", () => {
		const last = new Map([["boom", 1_000]]);
		expect(shouldNotifyMpdError(last, "boom", 6_000, 5_000)).toBe(true);
	});

	it("does not let one message suppress another", () => {
		const last = new Map([["boom", 1_000]]);
		expect(shouldNotifyMpdError(last, "other", 1_001, 5_000)).toBe(true);
	});
});
