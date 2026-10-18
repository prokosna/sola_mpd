import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePlayerSeekBarSlider } from "./usePlayerSeekBarSlider";

type Props = {
	percentage: number;
	receivedAt: number | undefined;
	seekable?: boolean;
};

function render(commitSeek = vi.fn()) {
	return renderHook(
		({ percentage, receivedAt, seekable = true }: Props) =>
			usePlayerSeekBarSlider(percentage, receivedAt, seekable, commitSeek),
		{ initialProps: { percentage: 10, receivedAt: 1 } as Props },
	);
}

describe("usePlayerSeekBarSlider", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.advanceTimersByTime(10_000);
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

	it("seeks on release and holds the position until a newer status arrives", () => {
		const commitSeek = vi.fn();
		const { result, rerender } = render(commitSeek);

		act(() => result.current.onChange(70));
		act(() => result.current.onChangeEnd(70));
		rerender({ percentage: 12, receivedAt: 1 });

		expect(commitSeek).toHaveBeenCalledWith(70);
		expect(result.current.value).toBe(70);

		rerender({ percentage: 70, receivedAt: performance.now() + 1 });

		expect(result.current.draftPercentage).toBeUndefined();
		expect(result.current.value).toBe(70);
	});

	it("ignores a status received before the seek was sent", () => {
		const { result, rerender } = render();

		act(() => result.current.onChangeEnd(70));
		rerender({ percentage: 12, receivedAt: performance.now() - 1 });

		expect(result.current.value).toBe(70);
	});

	it("sends a release within the throttle window as one trailing seek", () => {
		const commitSeek = vi.fn();
		const { result, rerender } = render(commitSeek);

		act(() => result.current.onChangeEnd(40));
		rerender({ percentage: 40, receivedAt: performance.now() + 1 });
		act(() => vi.advanceTimersByTime(300));
		act(() => result.current.onChangeEnd(60));
		act(() => vi.advanceTimersByTime(300));
		act(() => result.current.onChangeEnd(80));

		expect(commitSeek).toHaveBeenCalledTimes(1);
		expect(result.current.value).toBe(80);

		act(() => vi.advanceTimersByTime(400));

		expect(commitSeek).toHaveBeenCalledTimes(2);
		expect(commitSeek).toHaveBeenLastCalledWith(80);
		expect(result.current.value).toBe(80);
	});

	it("drops a trailing seek when unmounted", () => {
		const commitSeek = vi.fn();
		const { result, unmount } = render(commitSeek);

		act(() => result.current.onChangeEnd(40));
		act(() => result.current.onChangeEnd(60));
		unmount();
		act(() => vi.advanceTimersByTime(1000));

		expect(commitSeek).toHaveBeenCalledTimes(1);
	});

	it("shows the playback position instead of a draft while not seekable", () => {
		const { result, rerender } = render();

		act(() => result.current.onChange(70));
		rerender({ percentage: -1, receivedAt: 1, seekable: false });

		expect(result.current.value).toBe(-1);
		expect(result.current.draftPercentage).toBeUndefined();
	});
});
