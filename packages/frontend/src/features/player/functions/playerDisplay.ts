export function getElapsedTimePercentage(
	elapsed?: number,
	duration?: number,
): number {
	if (duration === undefined || elapsed === undefined || duration === 0) {
		return -1;
	}
	return (elapsed / duration) * 100;
}

export function getElapsedFromPercentage(
	percentage: number,
	duration?: number,
): number | undefined {
	if (duration === undefined || duration === 0) {
		return undefined;
	}
	return (percentage / 100) * duration;
}

export function isSeekable(duration?: number): duration is number {
	return duration !== undefined && duration > 0;
}
