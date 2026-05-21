import { fromJson, type Message } from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";

export type ParseSettingsStateJsonResult<T extends Message> =
	| { ok: true; state: T }
	| { ok: false; errorMessage: string };

// The settings editor surfaces two distinct failure modes to the user — the
// JSON itself being malformed versus the JSON not matching the protobuf
// schema — so the parser keeps them separate instead of collapsing into a
// single "invalid" state.
export function parseSettingsStateJson<T extends Message>(
	schema: GenMessage<T>,
	jsonText: string,
): ParseSettingsStateJsonResult<T> {
	let parsed: unknown;
	try {
		parsed = JSON.parse(jsonText);
	} catch (_) {
		return { ok: false, errorMessage: "Invalid JSON string" };
	}

	try {
		const state = fromJson(schema, parsed as Parameters<typeof fromJson>[1]);
		return { ok: true, state };
	} catch (e) {
		if (e instanceof Error) {
			return { ok: false, errorMessage: e.message };
		}
		return { ok: false, errorMessage: "Failed to parse the text as a state." };
	}
}
