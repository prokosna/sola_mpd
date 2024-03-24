export type Metric = {
  page: "Browser" | "File Explore" | "Play Queue" | "Playlist" | "Search";
  action: "Download" | "Filtering";
  elapsedTimeMillisecond: number;
};
