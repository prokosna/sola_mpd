import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import type { DeviceSettingsRepository } from "../../../../common";
import {
	buildDeviceSettingKey,
	deviceSettingsRepositoryAtom,
} from "../../../../common";
import type { SelectionQueryParam } from "../../types/browserSelection";

import { createRememberedSelectionAtom } from "./rememberedSelectionAtom";

const DEVICE_SETTING_KEY = "browserSelection";
const key = buildDeviceSettingKey(DEVICE_SETTING_KEY);

function createFakeDeviceSettingsRepository(
	initial: Record<string, unknown> = {},
): DeviceSettingsRepository {
	const backing = new Map<string, unknown>(Object.entries(initial));
	return {
		get: vi.fn((k: string, defaultValue?: unknown) =>
			backing.has(k) ? backing.get(k) : defaultValue,
		) as DeviceSettingsRepository["get"],
		set: vi.fn((k: string, value: unknown) => {
			backing.set(k, value);
		}) as DeviceSettingsRepository["set"],
		remove: vi.fn((k: string) => {
			backing.delete(k);
		}) as DeviceSettingsRepository["remove"],
		listKeys: vi.fn((prefix: string) =>
			[...backing.keys()].filter((k) => k.startsWith(prefix)),
		) as DeviceSettingsRepository["listKeys"],
	};
}

describe("createRememberedSelectionAtom", () => {
	it("reads its initial value from the device settings repository", () => {
		const rememberedAtom = createRememberedSelectionAtom(DEVICE_SETTING_KEY);
		const stored: SelectionQueryParam = { key: "bsel", value: "abc" };
		const store = createStore();
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository({ [key]: stored }),
		);

		expect(store.get(rememberedAtom)).toEqual(stored);
	});

	it("is undefined when the repository has no stored value", () => {
		const rememberedAtom = createRememberedSelectionAtom(DEVICE_SETTING_KEY);
		const store = createStore();
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository(),
		);

		expect(store.get(rememberedAtom)).toBe(undefined);
	});

	it("persists a new value to the device settings repository on write", () => {
		const rememberedAtom = createRememberedSelectionAtom(DEVICE_SETTING_KEY);
		const store = createStore();
		const repository = createFakeDeviceSettingsRepository();
		store.set(deviceSettingsRepositoryAtom, repository);

		const value: SelectionQueryParam = { key: "bsel", value: "abc" };
		store.set(rememberedAtom, value);

		expect(store.get(rememberedAtom)).toEqual(value);
		expect(repository.set).toHaveBeenCalledWith(key, value);
	});

	it("removes the stored value from the repository when set to undefined", () => {
		const rememberedAtom = createRememberedSelectionAtom(DEVICE_SETTING_KEY);
		const store = createStore();
		const repository = createFakeDeviceSettingsRepository({
			[key]: { key: "bsel", value: "abc" },
		});
		store.set(deviceSettingsRepositoryAtom, repository);

		store.set(rememberedAtom, undefined);

		expect(store.get(rememberedAtom)).toBe(undefined);
		expect(repository.remove).toHaveBeenCalledWith(key);
	});
});
