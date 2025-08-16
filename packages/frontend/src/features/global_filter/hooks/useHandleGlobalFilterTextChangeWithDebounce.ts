import { useCallback, useRef } from "react";

import { useSetGlobalFilterTextState } from "../states/globalFilterState";

/**
 * Hook for managing debounced global filter text updates.
 *
 * Features:
 * - 500ms debounce delay
 * - Automatic cleanup of pending updates
 * - Memory-efficient timeout handling
 * - Type-safe state updates
 *
 * Implementation:
 * - Uses ref to track pending timeouts
 * - Clears previous timeout on new input
 * - Single shared callback for all updates
 * - Memoized handler for performance
 *
 * Performance:
 * - Prevents excessive state updates
 * - Reduces unnecessary re-renders
 * - Optimizes for large song lists
 * - Improves typing responsiveness
 *
 * @returns Debounced text change handler
 */
export function useHandleGlobalFilterTextChangeWithDebounce() {
	const setGlobalFilterText = useSetGlobalFilterTextState();

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
