import { beforeEach, describe, expect, it, vi } from "vitest";

import { DeviceSettingsRepositoryLocalStorage } from "./DeviceSettingsRepositoryLocalStorage";

describe("DeviceSettingsRepositoryLocalStorage", () => {
	let repository: DeviceSettingsRepositoryLocalStorage;

	beforeEach(() => {
		globalThis.localStorage.clear();
		repository = new DeviceSettingsRepositoryLocalStorage();
	});

	it("sets and gets a JSON-serializable value", () => {
		repository.set("sola:v1:device:foo", { a: 1, b: ["x", "y"] });

		expect(repository.get("sola:v1:device:foo")).toEqual({
			a: 1,
			b: ["x", "y"],
		});
	});

	it("swallows a rejected write so the caller's interaction survives", () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const setItemSpy = vi
			.spyOn(globalThis.localStorage, "setItem")
			.mockImplementation(() => {
				throw new Error("QuotaExceededError");
			});

		expect(() => repository.set("sola:v1:device:foo", { a: 1 })).not.toThrow();
		expect(errorSpy).toHaveBeenCalledTimes(1);

		setItemSpy.mockRestore();
		errorSpy.mockRestore();
	});

	it("removes a value", () => {
		repository.set("sola:v1:device:foo", "bar");

		repository.remove("sola:v1:device:foo");

		expect(repository.get("sola:v1:device:foo")).toBeUndefined();
	});

	it("returns the default value for a missing key", () => {
		expect(repository.get("sola:v1:device:missing", "fallback")).toBe(
			"fallback",
		);
		expect(repository.get("sola:v1:device:missing")).toBeUndefined();
	});

	it("returns the default value for corrupt stored JSON instead of throwing", () => {
		globalThis.localStorage.setItem("sola:v1:device:corrupt", "{not json");

		expect(() =>
			repository.get("sola:v1:device:corrupt", "fallback"),
		).not.toThrow();
		expect(repository.get("sola:v1:device:corrupt", "fallback")).toBe(
			"fallback",
		);
	});

	it("lists only keys matching the given prefix", () => {
		repository.set("sola:v1:device:foo", 1);
		repository.set("sola:v1:device:profile:Home:bar", 2);
		globalThis.localStorage.setItem("unrelated:key", "3");

		expect(repository.listKeys("sola:v1:device:profile:").sort()).toEqual([
			"sola:v1:device:profile:Home:bar",
		]);
		expect(repository.listKeys("sola:v1:device:").sort()).toEqual([
			"sola:v1:device:foo",
			"sola:v1:device:profile:Home:bar",
		]);
	});
});
