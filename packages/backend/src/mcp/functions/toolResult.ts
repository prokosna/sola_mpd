import type { CallToolResult } from "@modelcontextprotocol/server";

/**
 * Returns a `CallToolResult` carrying a single text block. The text holds the
 * JSON-serialized payload so that clients without `structuredContent` support
 * still see the data.
 */
export function toolResultJson(payload: unknown): CallToolResult {
	const text = JSON.stringify(payload, null, 2);
	return {
		content: [{ type: "text", text }],
		structuredContent: isPlainObject(payload) ? payload : { result: payload },
	};
}

export function toolResultText(text: string): CallToolResult {
	return {
		content: [{ type: "text", text }],
	};
}

export function toolError(message: string): CallToolResult {
	return {
		content: [{ type: "text", text: message }],
		isError: true,
	};
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		Object.getPrototypeOf(value) === Object.prototype
	);
}
