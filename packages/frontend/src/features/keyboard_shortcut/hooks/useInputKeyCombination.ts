import { type RefObject, useEffect, useRef } from "react";

/**
 * Advanced keyboard shortcut management hook.
 *
 * Features:
 * - Global or scoped shortcuts
 * - Multi-key combinations
 * - Default action prevention
 * - Input element safety
 * - Memory leak prevention
 *
 * Implementation:
 * - Uses KeyboardEvent API
 * - Ref-based key state tracking
 * - Event cleanup on unmount
 * - Focus-aware activation
 *
 * Safety Features:
 * - Input element detection
 * - Contenteditable handling
 * - Clean event teardown
 * - Stale closure prevention
 *
 * Performance:
 * - Optimized key tracking
 * - Minimal re-renders
 * - Efficient event handling
 * - Memory-safe cleanup
 *
 * @example
 * ```tsx
 * // Global shortcut
 * useInputKeyCombination(undefined, ["Control", "s"], handleSave);
 *
 * // Scoped shortcut
 * useInputKeyCombination(elementRef, ["Enter"], handleSubmit);
 * ```
 *
 * @param ref Element scope reference
 * @param keys Required key combination
 * @param onPressed Action callback
 */
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

			const activeElement = document.activeElement;
			const isInputActive =
				activeElement?.tagName === "INPUT" ||
				activeElement?.tagName === "TEXTAREA" ||
				(activeElement as HTMLElement)?.isContentEditable;

			if (!isInputActive && keys.every((key) => keysPressed.current.has(key))) {
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
