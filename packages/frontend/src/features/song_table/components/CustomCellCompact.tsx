import { CustomCellRendererProps } from "ag-grid-react";

import { SONGS_TAG_COMPACT } from "../types/songTable";

export function CustomCellCompact(params: CustomCellRendererProps) {
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
