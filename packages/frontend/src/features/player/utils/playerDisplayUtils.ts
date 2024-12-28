import { MpdPlayerStatus } from "@sola_mpd/domain/src/models/mpd/mpd_player_pb.js";

/**
 * Calculates the elapsed time percentage of the current song.
 *
 * @param mpdPlayerStatus - The current MPD player status.
 * @returns The elapsed time percentage as a number between 0 and 100, or -1 if unable to calculate.
 */
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
