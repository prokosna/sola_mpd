import { type RefObject, useEffect } from "react";

export function usePreventShiftClickTextSelection(
	ref: RefObject<HTMLDivElement | null>,
): void {
	useEffect(() => {
		const element = ref.current;
		if (element === null) {
			return;
		}

		// With cell text selection enabled, Shift+clicking rows also extends the
		// browser's text selection across every cell in between, which the copy
		// shortcut would then copy instead of the selected rows. Row selection
		// runs on click, so cancelling the mousedown leaves it intact.
		const onMouseDown = (event: MouseEvent) => {
			if (!event.shiftKey) {
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
