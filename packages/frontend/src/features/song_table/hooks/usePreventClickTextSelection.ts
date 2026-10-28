import { type RefObject, useEffect } from "react";

export function usePreventClickTextSelection(
	ref: RefObject<HTMLDivElement | null>,
): void {
	useEffect(() => {
		const element = ref.current;
		if (element === null) {
			return;
		}

		// With cell text selection enabled, Shift+clicking rows extends the text
		// selection across every cell in between (which copy would then take over
		// the rows), and double-clicking to play selects a word. Selection and
		// double-click run on click, so cancelling the mousedown keeps them.
		const onMouseDown = (event: MouseEvent) => {
			if (!event.shiftKey && event.detail < 2) {
				return;
			}
			event.preventDefault();
			document.getSelection()?.removeAllRanges();
		};

		element.addEventListener("mousedown", onMouseDown, { capture: true });
		return () => {
			element.removeEventListener("mousedown", onMouseDown, { capture: true });
		};
	}, [ref]);
}
