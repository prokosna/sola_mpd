import { type RefObject, useEffect, useRef } from "react";

import {
	isInputElementActive,
	isKeyCombinationPressed,
} from "../functions/keyboardCombination";

export function useInputKeyCombination(
	ref: RefObject<HTMLElement | null> | undefined,
	keys: string[],
	onPressed: () => void,
): void {
	const keysPressed = useRef(new Set<string>());

	useEffect(() => {
		const onKeyDown = (event: Event) => {
			const keyboardEvent = event as KeyboardEvent;
			keysPressed.current.add(keyboardEvent.key);

			if (
				!isInputElementActive(document.activeElement) &&
				isKeyCombinationPressed(keysPressed.current, keys)
			) {
				keyboardEvent.preventDefault();
				onPressed();
			}
		};

		const onKeyUp = (event: Event) => {
			const keyboardEvent = event as KeyboardEvent;
			keysPressed.current.delete(keyboardEvent.key);
		};

		const target = ref?.current ?? window;
		target.addEventListener("keydown", onKeyDown);
		target.addEventListener("keyup", onKeyUp);

		return () => {
			target.removeEventListener("keydown", onKeyDown);
			target.removeEventListener("keyup", onKeyUp);
		};
	}, [ref, keys, onPressed]);
}
