import type { Message } from "@bufbuild/protobuf";

export interface StateRepository<T extends Message> {
	fetch: () => Promise<T>;
	save: (state: T) => Promise<void>;
}
