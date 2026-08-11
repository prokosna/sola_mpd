import type { DeviceSettingsRepository } from "./DeviceSettingsRepository";

export class DeviceSettingsRepositoryLocalStorage
	implements DeviceSettingsRepository
{
	get = <T>(key: string, defaultValue?: T): T | undefined => {
		const raw = globalThis.localStorage.getItem(key);
		if (raw === null) {
			return defaultValue;
		}
		try {
			return JSON.parse(raw) as T;
		} catch {
			// A single unparseable entry (e.g. corrupted by a previous app
			// version) must not break startup; fall back like a missing key.
			return defaultValue;
		}
	};

	set = <T>(key: string, value: T): void => {
		try {
			globalThis.localStorage.setItem(key, JSON.stringify(value));
		} catch (e) {
			// Quota exhaustion and Safari's private-mode write rejection both
			// surface here. Losing a device-local preference is acceptable;
			// breaking the interaction that triggered the write is not.
			console.error(`Failed to persist device setting "${key}":`, e);
		}
	};

	remove = (key: string): void => {
		globalThis.localStorage.removeItem(key);
	};

	listKeys = (prefix: string): string[] => {
		const keys: string[] = [];
		for (let i = 0; i < globalThis.localStorage.length; i++) {
			const key = globalThis.localStorage.key(i);
			if (key?.startsWith(prefix)) {
				keys.push(key);
			}
		}
		return keys;
	};
}
