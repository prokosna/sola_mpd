import { fromBinary, type Message, toBinary } from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";
import type { ConfigRepository } from "../repositories/ConfigRepository.js";

export const readConfigUseCase = <T extends Message>(
	schema: GenMessage<T>,
	repository: ConfigRepository<T>,
): Buffer => {
	return Buffer.from(toBinary(schema, repository.get()));
};

export const updateConfigUseCase = <T extends Message>(
	schema: GenMessage<T>,
	repository: ConfigRepository<T>,
	body: Buffer,
): void => {
	repository.update(fromBinary(schema, new Uint8Array(body)));
};
