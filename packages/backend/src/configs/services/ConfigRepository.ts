import type { Message } from "@bufbuild/protobuf";

export interface ConfigRepository<T extends Message> {
	get: () => T;
	update: (value: T) => void;
}
