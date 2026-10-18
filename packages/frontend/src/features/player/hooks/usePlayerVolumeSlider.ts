import { useCallback, useState } from "react";

export function usePlayerVolumeSlider(
	volume: number,
	commitVolume: (volume: number) => void,
) {
	const [draftVolume, setDraftVolume] = useState<number | undefined>(undefined);
	const [isDragging, setIsDragging] = useState(false);
	const [prevVolume, setPrevVolume] = useState(volume);

	// The committed draft is kept until MPD reports a new volume, so the thumb
	// does not snap back to the stale value while the mixer event is in flight.
	if (volume !== prevVolume) {
		setPrevVolume(volume);
		if (!isDragging) {
			setDraftVolume(undefined);
		}
	}

	const onChange = useCallback((value: number) => {
		setIsDragging(true);
		setDraftVolume(value);
	}, []);

	const onChangeEnd = useCallback(
		(value: number) => {
			setIsDragging(false);
			setDraftVolume(value);
			commitVolume(value);
		},
		[commitVolume],
	);

	return {
		value: draftVolume ?? volume,
		onChange,
		onChangeEnd,
	};
}
