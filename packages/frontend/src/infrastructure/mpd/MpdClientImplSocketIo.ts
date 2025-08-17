import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	SIO_MPD_COMMAND,
	SIO_MPD_COMMAND_BULK,
} from "@sola_mpd/domain/src/const/socketio.js";
import {
	type MpdRequest,
	MpdRequestBulkSchema,
	MpdRequestSchema,
	type MpdResponse,
	MpdResponseSchema,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";

import type { MpdClient } from "../../features/mpd";
import type { SocketIoClient } from "../socket_io/SocketIoClient";

/**
 * MpdClientSocketIo is an implementation of MpdClient that uses socket.io as the underlying transport.
 * It provides methods to send commands to mpd and to listen to events emitted by mpd.
 */
export class MpdClientSocketIo implements MpdClient {
	constructor(private client: SocketIoClient) {}

	command = async (req: MpdRequest): Promise<MpdResponse> => {
		const res = await this.client.fetch(
			SIO_MPD_COMMAND,
			toBinary(MpdRequestSchema, req),
			(bytes) => fromBinary(MpdResponseSchema, bytes),
		);

		if (res.command.case === "error") {
			throw new Error(res.command.value.message);
		}

		return res;
	};

	commandBulk = async (reqs: MpdRequest[]): Promise<void> => {
		await this.client.emit(
			SIO_MPD_COMMAND_BULK,
			toBinary(
				MpdRequestBulkSchema,
				create(MpdRequestBulkSchema, { requests: reqs }),
			),
		);
		return;
	};
}
