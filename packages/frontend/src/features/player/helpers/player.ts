import { MpdPlayerStatus } from "@sola_mpd/domain/src/models/mpd/mpd_player_pb.js";

export function getElapsedTimePercentage(
  mpdPlayerStatus?: MpdPlayerStatus,
): number {
  if (
    mpdPlayerStatus?.duration === undefined ||
    mpdPlayerStatus?.elapsed === undefined ||
    mpdPlayerStatus?.duration === 0
  ) {
    return -1;
  }
  return (mpdPlayerStatus.elapsed / mpdPlayerStatus.duration) * 100;
}
