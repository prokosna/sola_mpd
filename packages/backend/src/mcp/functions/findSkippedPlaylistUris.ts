// MPD's load silently drops entries it cannot add, so the skipped ones are
// recovered by matching the playlist against what was appended to the queue.
export function findSkippedPlaylistUris(
	playlistUris: string[],
	appendedUris: string[],
): string[] {
	const skipped: string[] = [];
	let next = 0;
	for (const uri of playlistUris) {
		if (appendedUris[next] === uri) {
			next++;
		} else {
			skipped.push(uri);
		}
	}
	return skipped;
}
