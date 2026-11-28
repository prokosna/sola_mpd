export const DEFAULT_QUERY_LIMIT = 100;

export function parseQueryLimit(value: unknown): number | undefined {
	const parsed =
		typeof value === "string" && value.trim() !== "" ? Number(value) : value;
	if (typeof parsed !== "number" || !Number.isInteger(parsed) || parsed < 1) {
		return undefined;
	}
	return parsed;
}
