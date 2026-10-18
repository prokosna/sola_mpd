const MPD_ACK_ERROR_NO_EXIST = 50;

// The MpdClient port passes MPD errors through untyped, so match both the
// mpd3 error's errno and the raw "ACK [50@n]" line.
export function isMpdNoExistError(err: unknown): boolean {
	if (typeof err !== "object" || err === null) {
		return false;
	}
	if ((err as { errno?: unknown }).errno === MPD_ACK_ERROR_NO_EXIST) {
		return true;
	}
	const message = (err as { message?: unknown }).message;
	return (
		typeof message === "string" &&
		message.includes(`ACK [${MPD_ACK_ERROR_NO_EXIST}@`)
	);
}
