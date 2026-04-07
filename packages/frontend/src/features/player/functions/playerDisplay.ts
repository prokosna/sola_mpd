export function getElapsedTimePercentage(
	elapsed?: number,
	duration?: number,
): number {
	if (duration === undefined || elapsed === undefined || duration === 0) {
		return -1;
	}
	return (elapsed / duration) * 100;
}
