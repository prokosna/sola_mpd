export type Metric = {
  page:
    | "Browser"
    | "File Explore"
    | "Play Queue"
    | "Playlist"
    | "Search"
    | "Full Text Search";
  action: "Download" | "Filtering";
  elapsedTimeMillisecond: number;
};
