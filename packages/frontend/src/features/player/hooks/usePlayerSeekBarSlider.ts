import { useCallback, useRef, useState } from "react";

const SEEK_THROTTLE_MS = 1000;

export function usePlayerSeekBarSlider(
	percentage: number,
	statusReceivedAt: number | undefined,
	commitSeek: (percentage: number) => void,
) {
	const [draggingPercentage, setDraggingPercentage] = useState<
		number | undefined
	>(undefined);
	const [pendingSeekPercentage, setPendingSeekPercentage] = useState<
		number | undefined
	>(undefined);
	const [prevReceivedAt, setPrevReceivedAt] = useState(statusReceivedAt);
	const lastSeekAtRef = useRef(0);

	// Keyed on the status snapshot, not the interpolated percentage, which
	// changes on every clock tick.
	if (statusReceivedAt !== prevReceivedAt) {
		setPrevReceivedAt(statusReceivedAt);
		setPendingSeekPercentage(undefined);
	}

	const onChange = useCallback((value: number) => {
		setDraggingPercentage(value);
	}, []);

	const onChangeEnd = useCallback(
		(value: number) => {
			setDraggingPercentage(undefined);
			// onChangeEnd can land repeatedly in quick succession; seeking on
			// every one of them makes MPD stutter.
			const now = Date.now();
			if (now - lastSeekAtRef.current < SEEK_THROTTLE_MS) {
				return;
			}
			lastSeekAtRef.current = now;
			setPendingSeekPercentage(value);
			commitSeek(value);
		},
		[commitSeek],
	);

	const draftPercentage = draggingPercentage ?? pendingSeekPercentage;

	return {
		value: draftPercentage ?? percentage,
		draftPercentage,
		onChange,
		onChangeEnd,
	};
}
