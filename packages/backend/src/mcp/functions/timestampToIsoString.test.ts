import { create } from "@bufbuild/protobuf";
import { TimestampSchema } from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";

import { timestampToIsoString } from "./timestampToIsoString.js";

describe("timestampToIsoString", () => {
	it("formats a present timestamp as ISO-8601", () => {
		const ts = create(TimestampSchema, { seconds: 1700000000n });
		expect(timestampToIsoString(ts)).toBe("2023-11-14T22:13:20.000Z");
	});

	it("returns null when absent", () => {
		expect(timestampToIsoString(undefined)).toBeNull();
	});

	it("ignores nanos", () => {
		const ts = create(TimestampSchema, {
			seconds: 1700000000n,
			nanos: 999000000,
		});
		expect(timestampToIsoString(ts)).toBe("2023-11-14T22:13:20.000Z");
	});
});
