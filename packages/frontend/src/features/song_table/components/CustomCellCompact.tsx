import { CustomCellRendererProps } from "ag-grid-react";

import { SONGS_TAG_COMPACT } from "../types/songTableTypes";

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
