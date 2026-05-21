import { describe, expect, it } from "vitest";

import {
	buildProfileInputFromForm,
	validateProfileName,
} from "./mpdProfileFormValidation";

describe("validateProfileName", () => {
	it("returns required message for empty name", () => {
		expect(validateProfileName("", [])).toBe("Name is required");
	});

	it("returns duplicate message when name already exists", () => {
		expect(validateProfileName("foo", ["foo", "bar"])).toBe(
			"Name already exists",
		);
	});

	it("returns undefined for a unique non-empty name", () => {
		expect(validateProfileName("baz", ["foo", "bar"])).toBeUndefined();
	});
});

describe("buildProfileInputFromForm", () => {
	it("maps form values to ProfileInput as-is", () => {
		expect(
			buildProfileInputFromForm({
				name: "default",
				host: "localhost",
				port: 6601,
				password: "secret",
			}),
		).toEqual({
			name: "default",
			host: "localhost",
			port: 6601,
			password: "secret",
		});
	});

	it("falls back to MPD default port (6600) when port is undefined", () => {
		expect(
			buildProfileInputFromForm({
				name: "default",
				host: "localhost",
				port: undefined,
				password: "",
			}).port,
		).toBe(6600);
	});

	it("treats empty password as undefined", () => {
		expect(
			buildProfileInputFromForm({
				name: "default",
				host: "localhost",
				port: 6600,
				password: "",
			}).password,
		).toBeUndefined();
	});
});
