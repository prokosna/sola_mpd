import { fromBinary, type Message, toBinary } from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";
import type { HttpClient } from "../../../lib/http/HttpClient";
import type { StateRepository } from "./StateRepository";

export class StateRepositoryHttp<T extends Message>
	implements StateRepository<T>
{
	constructor(
		private readonly client: HttpClient,
		private readonly endpoint: string,
		private readonly schema: GenMessage<T>,
	) {}

	fetch = async (): Promise<T> => {
		return this.client.get<T>(this.endpoint, (bytes) =>
			fromBinary(this.schema, bytes),
		);
	};

	save = async (state: T): Promise<void> => {
		return this.client.post(this.endpoint, toBinary(this.schema, state));
	};
}
