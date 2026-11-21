export function shouldNotifyMpdError(
	lastNotifiedAt: ReadonlyMap<string, number>,
	message: string,
	now: number,
	windowMs: number,
): boolean {
	const last = lastNotifiedAt.get(message);
	return last === undefined || now - last >= windowMs;
}
