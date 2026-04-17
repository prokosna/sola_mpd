import { fromBinary, type Message, toBinary } from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";
import {
	SOCKETIO_CONFIG_FETCH,
	SOCKETIO_CONFIG_SAVE,
} from "@sola_mpd/shared/src/const/socketio.js";
import type { MessagingClient } from "../../../lib/messaging/MessagingClient";
import type { StateRepository } from "./StateRepository";

export class StateRepositorySocketIo<T extends Message>
	implements StateRepository<T>
{
	private readonly fetchEvent: string;
	private readonly saveEvent: string;

	constructor(
		private readonly client: MessagingClient,
		configKey: string,
		private readonly schema: GenMessage<T>,
	) {
		this.fetchEvent = `${SOCKETIO_CONFIG_FETCH}_${configKey}`;
		this.saveEvent = `${SOCKETIO_CONFIG_SAVE}_${configKey}`;
	}

	fetch = async (): Promise<T> => {
		return this.client.fetch<T>(this.fetchEvent, new Uint8Array(0), (bytes) =>
			fromBinary(this.schema, bytes),
		);
	};

	save = async (state: T): Promise<void> => {
		await this.client.emit(this.saveEvent, toBinary(this.schema, state));
	};
}
