import { useSetAtom } from "jotai";
import { useCallback, useRef } from "react";

import { setGlobalFilterTextActionAtom } from "../states/actions/setGlobalFilterTextActionAtom";

export function useHandleGlobalFilterTextChangeWithDebounce() {
	const setGlobalFilterText = useSetAtom(setGlobalFilterTextActionAtom);

	const lastInvocation = useRef<ReturnType<typeof setTimeout>>(undefined);

	const handleTextChange = useCallback(
		(text: string) => {
			if (lastInvocation.current !== undefined) {
				clearTimeout(lastInvocation.current);
			}
			const timeoutId = setTimeout(() => {
				setGlobalFilterText(text);
			}, 500);
			lastInvocation.current = timeoutId;
		},
		[setGlobalFilterText],
	);

	return handleTextChange;
}
