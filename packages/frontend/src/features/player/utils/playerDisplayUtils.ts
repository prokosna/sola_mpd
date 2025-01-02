/**
 * Calculate song progress percentage.
 *
 * @param elapsed Current position in seconds
 * @param duration Total length in seconds
 * @returns Progress (0-100) or -1 if invalid
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
