export const DEFAULT_QUERY_LIMIT = 100;

// The limit is persisted as a protobuf int32.
export const MAX_QUERY_LIMIT = 2147483647;

export function parseQueryLimit(value: unknown): number | undefined {
	const parsed =
		typeof value === "string" && value.trim() !== "" ? Number(value) : value;
	if (
		typeof parsed !== "number" ||
		!Number.isInteger(parsed) ||
		parsed < 1 ||
		parsed > MAX_QUERY_LIMIT
	) {
		return undefined;
	}
	return parsed;
}
