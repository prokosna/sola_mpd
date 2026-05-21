import { toJson } from "@bufbuild/protobuf";
import {
	type MpdProfile,
	MpdProfileSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { describe, expect, it } from "vitest";

import { parseSettingsStateJson } from "./parseSettingsStateJson";

describe("parseSettingsStateJson", () => {
	it("returns the parsed protobuf message for valid JSON", () => {
		const valid = JSON.stringify({
			name: "default",
			host: "localhost",
			port: 6600,
			password: "",
		});

		const result = parseSettingsStateJson(MpdProfileSchema, valid);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.state.name).toBe("default");
			expect(result.state.host).toBe("localhost");
			expect(result.state.port).toBe(6600);
		}
	});

	it("returns 'Invalid JSON string' for malformed JSON", () => {
		const result = parseSettingsStateJson(MpdProfileSchema, "{not json}");
		expect(result).toEqual({ ok: false, errorMessage: "Invalid JSON string" });
	});

	it("returns the schema error message for valid JSON that does not match the schema", () => {
		const result = parseSettingsStateJson(
			MpdProfileSchema,
			JSON.stringify({ port: "not-a-number" }),
		);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errorMessage).not.toBe("");
			expect(result.errorMessage).not.toBe("Invalid JSON string");
		}
	});

	it("round-trips through toJson", () => {
		const original: MpdProfile = {
			$typeName: MpdProfileSchema.typeName,
			name: "round-trip",
			host: "127.0.0.1",
			port: 6601,
			password: "secret",
		};
		const jsonText = JSON.stringify(toJson(MpdProfileSchema, original));

		const result = parseSettingsStateJson(MpdProfileSchema, jsonText);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.state).toEqual(original);
		}
	});
});
