import { useCallback, useEffect, useRef, useState } from "react";

const SEEK_THROTTLE_MS = 1000;

type PendingSeek = { percentage: number; sentAt?: number };

export function usePlayerSeekBarSlider(
	percentage: number,
	statusReceivedAt: number | undefined,
	isSeekable: boolean,
	commitSeek: (percentage: number) => void,
) {
	const [draggingPercentage, setDraggingPercentage] = useState<
		number | undefined
	>(undefined);
	const [pendingSeek, setPendingSeek] = useState<PendingSeek | undefined>(
		undefined,
	);
	const [prevReceivedAt, setPrevReceivedAt] = useState(statusReceivedAt);
	const lastSeekAtRef = useRef(Number.NEGATIVE_INFINITY);
	const trailingSeekRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	// Keyed on the status snapshot, not the interpolated percentage, which
	// changes on every clock tick. A status received before the seek was sent
	// still shows the old position.
	if (statusReceivedAt !== prevReceivedAt) {
		setPrevReceivedAt(statusReceivedAt);
		if (
			pendingSeek?.sentAt !== undefined &&
			statusReceivedAt !== undefined &&
			statusReceivedAt > pendingSeek.sentAt
		) {
			setPendingSeek(undefined);
		}
	}

	useEffect(() => () => clearTimeout(trailingSeekRef.current), []);

	const sendSeek = useCallback(
		(value: number) => {
			const now = performance.now();
			lastSeekAtRef.current = now;
			setPendingSeek({ percentage: value, sentAt: now });
			commitSeek(value);
		},
		[commitSeek],
	);

	const onChange = useCallback((value: number) => {
		setDraggingPercentage(value);
	}, []);

	const onChangeEnd = useCallback(
		(value: number) => {
			setDraggingPercentage(undefined);
			clearTimeout(trailingSeekRef.current);
			// Seeking on every release in quick succession makes MPD stutter, so
			// releases within the window collapse into one trailing seek.
			const wait = lastSeekAtRef.current + SEEK_THROTTLE_MS - performance.now();
			if (wait <= 0) {
				sendSeek(value);
				return;
			}
			setPendingSeek({ percentage: value });
			trailingSeekRef.current = setTimeout(() => sendSeek(value), wait);
		},
		[sendSeek],
	);

	const draftPercentage = isSeekable
		? (draggingPercentage ?? pendingSeek?.percentage)
		: undefined;

	return {
		value: draftPercentage ?? percentage,
		draftPercentage,
		onChange,
		onChangeEnd,
	};
}
