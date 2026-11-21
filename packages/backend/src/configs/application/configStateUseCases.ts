import type { Message } from "@bufbuild/protobuf";
import type { ConfigRepository } from "../repositories/ConfigRepository.js";

export const readConfigUseCase = <T extends Message>(
	repository: ConfigRepository<T>,
): T => {
	return repository.get();
};

export const updateConfigUseCase = <T extends Message>(
	repository: ConfigRepository<T>,
	value: T,
): void => {
	repository.update(value);
};
