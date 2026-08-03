import type { DeviceSettingsRepository } from "../../repositories/DeviceSettingsRepository";

import { createStateRepositoryAtom } from "./stateRepositoryAtom";

export const deviceSettingsRepositoryAtom =
	createStateRepositoryAtom<DeviceSettingsRepository>();
