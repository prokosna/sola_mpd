import { describe, expect, it } from "vitest";

import { isMpdNoExistError } from "./isMpdNoExistError.js";

describe("isMpdNoExistError", () => {
	it("matches an error carrying MPD errno 50", () => {
		const err = Object.assign(new Error("No such directory"), { errno: 50 });
		expect(isMpdNoExistError(err)).toBe(true);
	});

	it("matches a raw ACK [50@n] message", () => {
		expect(
			isMpdNoExistError(new Error("ACK [50@0] {add} No such directory")),
		).toBe(true);
	});

	it("rejects other MPD error codes", () => {
		const err = Object.assign(new Error("Permission denied"), { errno: 4 });
		expect(isMpdNoExistError(err)).toBe(false);
		expect(
			isMpdNoExistError(new Error("ACK [51@0] {add} playlist is at the max")),
		).toBe(false);
	});

	it("rejects connection errors and non-objects", () => {
		expect(isMpdNoExistError(new Error("connect ECONNREFUSED"))).toBe(false);
		expect(isMpdNoExistError("ACK [50@0] {add} No such directory")).toBe(false);
		expect(isMpdNoExistError(undefined)).toBe(false);
	});
});
