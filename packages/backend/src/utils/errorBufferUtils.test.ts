import { fromBinary } from "@bufbuild/protobuf";
import { AdvancedSearchResponseSchema } from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { PluginRegisterResponseWrapperSchema } from "@sola_mpd/shared/src/models/plugin/plugin_wrapper_pb.js";
import { describe, expect, it } from "vitest";

import {
	createAdvancedSearchErrorBuffer,
	createMpdErrorBuffer,
	createPluginRegisterErrorBuffer,
} from "./errorBufferUtils.js";

describe("createMpdErrorBuffer", () => {
	it("encodes an Error message into an MpdResponse error oneof", () => {
		const buffer = createMpdErrorBuffer(new Error("mpd offline"));

		const decoded = fromBinary(MpdResponseSchema, buffer);
		expect(decoded.command.case).toBe("error");
		if (decoded.command.case === "error") {
			expect(decoded.command.value.message).toBe("mpd offline");
		}
	});

	it("encodes a string error verbatim", () => {
		const buffer = createMpdErrorBuffer("raw string error");

		const decoded = fromBinary(MpdResponseSchema, buffer);
		expect(decoded.command.case).toBe("error");
		if (decoded.command.case === "error") {
			expect(decoded.command.value.message).toBe("raw string error");
		}
	});

	it("falls back to 'Unknown error' for unsupported error types", () => {
		const buffer = createMpdErrorBuffer({ unexpected: true });

		const decoded = fromBinary(MpdResponseSchema, buffer);
		expect(decoded.command.case).toBe("error");
		if (decoded.command.case === "error") {
			expect(decoded.command.value.message).toBe("Unknown error");
		}
	});
});

describe("createPluginRegisterErrorBuffer", () => {
	it("encodes an Error message into a PluginRegisterResponseWrapper error oneof", () => {
		const buffer = createPluginRegisterErrorBuffer(
			new Error("plugin failed to register"),
		);

		const decoded = fromBinary(PluginRegisterResponseWrapperSchema, buffer);
		expect(decoded.result.case).toBe("error");
		if (decoded.result.case === "error") {
			expect(decoded.result.value).toBe("plugin failed to register");
		}
	});

	it("encodes a string error verbatim", () => {
		const buffer = createPluginRegisterErrorBuffer("config missing");

		const decoded = fromBinary(PluginRegisterResponseWrapperSchema, buffer);
		expect(decoded.result.case).toBe("error");
		if (decoded.result.case === "error") {
			expect(decoded.result.value).toBe("config missing");
		}
	});

	it("falls back to 'Unknown error' for unsupported error types", () => {
		const buffer = createPluginRegisterErrorBuffer(undefined);

		const decoded = fromBinary(PluginRegisterResponseWrapperSchema, buffer);
		expect(decoded.result.case).toBe("error");
		if (decoded.result.case === "error") {
			expect(decoded.result.value).toBe("Unknown error");
		}
	});
});

describe("createAdvancedSearchErrorBuffer", () => {
	it("encodes an Error message into an AdvancedSearchResponse error oneof", () => {
		const buffer = createAdvancedSearchErrorBuffer(
			new Error("advanced search timed out"),
		);

		const decoded = fromBinary(AdvancedSearchResponseSchema, buffer);
		expect(decoded.command.case).toBe("error");
		if (decoded.command.case === "error") {
			expect(decoded.command.value).toBe("advanced search timed out");
		}
	});

	it("encodes a string error verbatim", () => {
		const buffer = createAdvancedSearchErrorBuffer("no index available");

		const decoded = fromBinary(AdvancedSearchResponseSchema, buffer);
		expect(decoded.command.case).toBe("error");
		if (decoded.command.case === "error") {
			expect(decoded.command.value).toBe("no index available");
		}
	});

	it("falls back to 'Unknown error' for unsupported error types", () => {
		const buffer = createAdvancedSearchErrorBuffer(404);

		const decoded = fromBinary(AdvancedSearchResponseSchema, buffer);
		expect(decoded.command.case).toBe("error");
		if (decoded.command.case === "error") {
			expect(decoded.command.value).toBe("Unknown error");
		}
	});
});
