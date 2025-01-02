import { fireEvent, renderHook } from "@testing-library/react";
import type { MutableRefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useInputKeyCombination } from "./useInputKeyCombination";

describe("useInputKeyCombination", () => {
	let ref: MutableRefObject<HTMLElement | null>;
	const callback = vi.fn();

	beforeEach(() => {
		callback.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it.each([[["a", "b"]], [["a", "b", "Control"]]])(
		"should call the callback when the correct key combination (%i) is pressed",
		(keys) => {
			const elm = document.createElement("div");
			document.body.appendChild(elm);
			elm.focus();
			ref = { current: elm };

			renderHook(() => useInputKeyCombination(ref, keys, callback));

			for (const key of keys) {
				fireEvent.keyDown(elm, { key });
			}

			expect(callback).toHaveBeenCalled();

			document.body.removeChild(elm);
		},
	);

	it("should not call the callback when an input is active", () => {
		const elm = document.createElement("input");
		document.body.appendChild(elm);
		elm.focus();
		ref = { current: elm };

		renderHook(() => useInputKeyCombination(ref, ["a", "b"], callback));

		fireEvent.keyDown(elm, { key: "a" });
		fireEvent.keyDown(elm, { key: "b" });

		expect(callback).not.toHaveBeenCalled();

		document.body.removeChild(elm);
	});

	it("should not call the callback when a textarea is active", () => {
		const elm = document.createElement("textarea");
		document.body.appendChild(elm);
		elm.focus();
		ref = { current: elm };

		renderHook(() => useInputKeyCombination(ref, ["a", "b"], callback));

		fireEvent.keyDown(elm, { key: "a" });
		fireEvent.keyDown(elm, { key: "b" });

		expect(callback).not.toHaveBeenCalled();

		document.body.removeChild(elm);
	});
});
