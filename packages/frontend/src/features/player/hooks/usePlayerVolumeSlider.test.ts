import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePlayerVolumeSlider } from "./usePlayerVolumeSlider";

describe("usePlayerVolumeSlider", () => {
	it("follows volume changes made by other clients", () => {
		const { result, rerender } = renderHook(
			({ volume }) => usePlayerVolumeSlider(volume, vi.fn()),
			{ initialProps: { volume: 30 } },
		);
		expect(result.current.value).toBe(30);

		rerender({ volume: 70 });

		expect(result.current.value).toBe(70);
	});

	it("shows the dragged value and ignores external updates while dragging", () => {
		const { result, rerender } = renderHook(
			({ volume }) => usePlayerVolumeSlider(volume, vi.fn()),
			{ initialProps: { volume: 30 } },
		);

		act(() => result.current.onChange(50));
		expect(result.current.value).toBe(50);

		rerender({ volume: 80 });

		expect(result.current.value).toBe(50);
	});

	it("commits on release and keeps the value until MPD reports a new one", () => {
		const commitVolume = vi.fn();
		const { result, rerender } = renderHook(
			({ volume }) => usePlayerVolumeSlider(volume, commitVolume),
			{ initialProps: { volume: 30 } },
		);

		act(() => result.current.onChange(60));
		act(() => result.current.onChangeEnd(60));

		expect(commitVolume).toHaveBeenCalledWith(60);
		expect(result.current.value).toBe(60);

		rerender({ volume: 60 });
		rerender({ volume: 20 });

		expect(result.current.value).toBe(20);
	});
});
