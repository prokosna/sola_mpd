import type { CustomCellRendererProps } from "ag-grid-react";
import type { JSX } from "react";
import { SONGS_TAG_COMPACT } from "../types/songTableTypes";

/**
 * Custom AG Grid cell renderer for compact song display.
 *
 * Displays song information in a two-line format with ellipsis
 * for overflow. Used in compact view mode to show primary and
 * secondary song details.
 *
 * @param params AG Grid cell renderer props
 */
export function CustomCellCompact(
	params: CustomCellRendererProps,
): JSX.Element {
	return (
		<>
			<div
				style={{
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
				}}
			>
				{params.data[SONGS_TAG_COMPACT].firstLine}
			</div>
			<div
				style={{
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
				}}
			>
				{params.data[SONGS_TAG_COMPACT].secondLine}
			</div>
		</>
	);
}
