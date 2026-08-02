export interface DeviceSettingsRepository {
	get: <T>(key: string, defaultValue?: T) => T | undefined;
	set: <T>(key: string, value: T) => void;
	remove: (key: string) => void;
	listKeys: (prefix: string) => string[];
}
