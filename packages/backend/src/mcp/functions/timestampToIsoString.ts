import type { Timestamp } from "@bufbuild/protobuf/wkt";

export function timestampToIsoString(
	timestamp: Timestamp | undefined,
): string | null {
	return timestamp !== undefined
		? new Date(Number(timestamp.seconds) * 1000).toISOString()
		: null;
}
