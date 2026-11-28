import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { showNotification } from "../../../lib/mantine/showNotification";
import { MpdCommandError } from "../types/MpdCommandError";
import { useMpdErrorNotification } from "./useMpdErrorNotification";

vi.mock("../../../lib/mantine/showNotification", () => ({
	showNotification: vi.fn(),
}));

const rejectUnhandled = (reason: unknown): Event => {
	const event = new Event("unhandledrejection", { cancelable: true });
	Object.assign(event, { reason });
	window.dispatchEvent(event);
	return event;
};

describe("useMpdErrorNotification", () => {
	beforeEach(() => {
		vi.mocked(showNotification).mockClear();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("notifies an unhandled MpdCommandError once and marks it handled", () => {
		renderHook(() => useMpdErrorNotification());

		const event = rejectUnhandled(new MpdCommandError("no such song"));

		expect(event.defaultPrevented).toBe(true);
		expect(showNotification).toHaveBeenCalledWith({
			title: "MPD command failed",
			description: "no such song",
			status: "error",
		});
	});

	it("collapses repeats of the same failure", () => {
		renderHook(() => useMpdErrorNotification());

		rejectUnhandled(new MpdCommandError("connection refused"));
		rejectUnhandled(new MpdCommandError("connection refused"));

		expect(showNotification).toHaveBeenCalledTimes(1);
	});

	it("leaves other rejections alone", () => {
		renderHook(() => useMpdErrorNotification());

		const event = rejectUnhandled(new Error("unrelated"));

		expect(event.defaultPrevented).toBe(false);
		expect(showNotification).not.toHaveBeenCalled();
	});

	it("stops listening after unmount", () => {
		const { unmount } = renderHook(() => useMpdErrorNotification());
		unmount();

		rejectUnhandled(new MpdCommandError("no such song"));

		expect(showNotification).not.toHaveBeenCalled();
	});
});
