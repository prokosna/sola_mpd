import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePlayerSeekBarSlider } from "./usePlayerSeekBarSlider";

type Props = { percentage: number; receivedAt: number | undefined };

function render(commitSeek = vi.fn()) {
	return renderHook(
		({ percentage, receivedAt }: Props) =>
			usePlayerSeekBarSlider(percentage, receivedAt, commitSeek),
		{ initialProps: { percentage: 10, receivedAt: 1 } as Props },
	);
}

describe("usePlayerSeekBarSlider", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(10_000);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("follows the interpolated position", () => {
		const { result, rerender } = render();

		rerender({ percentage: 11, receivedAt: 1 });

		expect(result.current.value).toBe(11);
		expect(result.current.draftPercentage).toBeUndefined();
	});

	it("shows the dragged position while clock ticks and new statuses arrive", () => {
		const { result, rerender } = render();

		act(() => result.current.onChange(70));
		rerender({ percentage: 12, receivedAt: 1 });
		rerender({ percentage: 13, receivedAt: 2 });

		expect(result.current.value).toBe(70);
	});

	it("seeks on release and holds the position until a new status arrives", () => {
		const commitSeek = vi.fn();
		const { result, rerender } = render(commitSeek);

		act(() => result.current.onChange(70));
		act(() => result.current.onChangeEnd(70));
		rerender({ percentage: 12, receivedAt: 1 });

		expect(commitSeek).toHaveBeenCalledWith(70);
		expect(result.current.value).toBe(70);

		rerender({ percentage: 70, receivedAt: 2 });

		expect(result.current.draftPercentage).toBeUndefined();
		expect(result.current.value).toBe(70);
	});

	it("drops a release within the throttle window and keeps the pending seek", () => {
		const commitSeek = vi.fn();
		const { result } = render(commitSeek);

		act(() => result.current.onChangeEnd(40));
		vi.setSystemTime(10_500);
		act(() => result.current.onChangeEnd(60));

		expect(commitSeek).toHaveBeenCalledTimes(1);
		expect(commitSeek).toHaveBeenCalledWith(40);
		expect(result.current.value).toBe(40);
	});
});
