import type { DeviceSettingsRepository } from "../../../../lib/deviceSettings/DeviceSettingsRepository";

import { createStateRepositoryAtom } from "./stateRepositoryAtom";

export const deviceSettingsRepositoryAtom =
	createStateRepositoryAtom<DeviceSettingsRepository>();
