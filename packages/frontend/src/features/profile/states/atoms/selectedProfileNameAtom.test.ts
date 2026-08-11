import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";
import type { DeviceSettingsRepository } from "../../../common";
import {
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME,
	deviceSettingsRepositoryAtom,
} from "../../../common";

import { selectedProfileNameAtom } from "./selectedProfileNameAtom";

const selectedProfileNameKey = buildDeviceSettingKey(
	DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME,
);

function createFakeDeviceSettingsRepository(
	initial: Record<string, unknown> = {},
): DeviceSettingsRepository {
	const backing = new Map<string, unknown>(Object.entries(initial));
	return {
		get: vi.fn((key: string, defaultValue?: unknown) =>
			backing.has(key) ? backing.get(key) : defaultValue,
		) as DeviceSettingsRepository["get"],
		set: vi.fn((key: string, value: unknown) => {
			backing.set(key, value);
		}) as DeviceSettingsRepository["set"],
		remove: vi.fn((key: string) => {
			backing.delete(key);
		}) as DeviceSettingsRepository["remove"],
		listKeys: vi.fn((prefix: string) =>
			[...backing.keys()].filter((key) => key.startsWith(prefix)),
		) as DeviceSettingsRepository["listKeys"],
	};
}

describe("selectedProfileNameAtom", () => {
	it("reads its initial value from the device settings repository", () => {
		const store = createStore();
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository({ [selectedProfileNameKey]: "Home" }),
		);

		expect(store.get(selectedProfileNameAtom)).toBe("Home");
	});

	it("is undefined when the repository has no stored value", () => {
		const store = createStore();
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository(),
		);

		expect(store.get(selectedProfileNameAtom)).toBeUndefined();
	});

	it("persists a new value to the device settings repository on write", () => {
		const store = createStore();
		const repository = createFakeDeviceSettingsRepository();
		store.set(deviceSettingsRepositoryAtom, repository);

		store.set(selectedProfileNameAtom, "Office");

		expect(store.get(selectedProfileNameAtom)).toBe("Office");
		expect(repository.set).toHaveBeenCalledWith(
			selectedProfileNameKey,
			"Office",
		);
	});

	it("removes the stored value from the repository when set to undefined", () => {
		const store = createStore();
		const repository = createFakeDeviceSettingsRepository({
			[selectedProfileNameKey]: "Office",
		});
		store.set(deviceSettingsRepositoryAtom, repository);

		store.set(selectedProfileNameAtom, undefined);

		expect(store.get(selectedProfileNameAtom)).toBeUndefined();
		expect(repository.remove).toHaveBeenCalledWith(selectedProfileNameKey);
	});
});
