const normalizationRegex = new RegExp(/[\u0300-\u036F]/g);

/**
 * Formats a duration in seconds into a human-readable string.
 * @param duration Duration in seconds
 * @returns Formatted string in the format "DD:HH:MM:SS", "HH:MM:SS", or "MM:SS"
 */
export function displayDuration(duration: number): string {
	const days = Math.floor(duration / (60 * 60 * 24));
	let remaining = duration - days * 60 * 60 * 24;
	const hours = Math.floor(remaining / (60 * 60));
	remaining -= hours * 60 * 60;
	const minutes = Math.floor(remaining / 60);
	remaining -= minutes * 60;
	const seconds = Math.floor(remaining);

	const hoursStr = hours < 10 ? `0${hours}` : String(hours);
	const minutesStr = minutes < 10 ? `0${minutes}` : String(minutes);
	const secondsStr = seconds < 10 ? `0${seconds}` : String(seconds);

	if (days > 0) {
		return `${days}:${hoursStr}:${minutesStr}:${secondsStr}`;
	}
	if (hours > 0) {
		return `${hoursStr}:${minutesStr}:${secondsStr}`;
	}
	return `${minutesStr}:${secondsStr}`;
}

/**
 * Normalizes a string by removing diacritics and converting to lowercase.
 * @param input String to normalize
 * @returns Normalized string
 */
export function normalize(input: string): string {
	return input.normalize("NFD").replace(normalizationRegex, "").toLowerCase();
}
