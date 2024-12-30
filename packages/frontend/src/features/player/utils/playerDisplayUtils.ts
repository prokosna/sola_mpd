/**
 * Calculates the elapsed time percentage of the current song.
 *
 * @param mpdPlayerStatus - The current MPD player status.
 * @returns The elapsed time percentage as a number between 0 and 100, or -1 if unable to calculate.
 */
export function getElapsedTimePercentage(
  elapsed?: number,
  duration?: number,
): number {
  if (duration === undefined || elapsed === undefined || duration === 0) {
    return -1;
  }
  return (elapsed / duration) * 100;
}
