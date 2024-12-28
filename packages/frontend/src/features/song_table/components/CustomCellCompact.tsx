import { CustomCellRendererProps } from "ag-grid-react";

import { SONGS_TAG_COMPACT } from "../types/songTableTypes";

/**
 * Renders a custom compact cell for the song table.
 * @param params - The props passed to the custom cell renderer.
 * @returns A JSX element representing the compact cell.
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
