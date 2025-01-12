import type { RowClickedEvent } from "ag-grid-community";
import { useCallback } from "react";

/**
 * Creates handler for song row click events.
 *
 * Processes click events on table rows to maintain legacy selection behavior:
 * - Single click without modifier keys selects only the clicked row
 * - Click with Ctrl/Cmd key toggles the clicked row's selection
 * - Click with Shift key selects a range of rows
 *
 * @returns Click event handler
 */
export function useHandleRowClick(): (event: RowClickedEvent) => void {
	return useCallback((event: RowClickedEvent) => {
		const { api, node } = event;

		// Check if any modifier key is pressed
		const isModifierKeyPressed =
			event.event instanceof MouseEvent &&
			(event.event.ctrlKey || event.event.metaKey || event.event.shiftKey);

		// If no modifier keys are pressed, select only the clicked row
		if (!isModifierKeyPressed) {
			api.deselectAll();
			node.setSelected(true, false);
			return;
		}

		// Let AG Grid handle modifier key selections
		// (Ctrl/Cmd for toggle, Shift for range selection)
	}, []);
}
