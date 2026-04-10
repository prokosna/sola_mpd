import type { RowClickedEvent } from "ag-grid-community";
import { useCallback } from "react";

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
