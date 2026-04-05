import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	SIO_MPD_COMMAND,
	SIO_MPD_COMMAND_BULK,
} from "@sola_mpd/shared/src/const/socketio.js";
import {
	type MpdRequest,
	MpdRequestBulkSchema,
	MpdRequestSchema,
	type MpdResponse,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";

import type { SocketIoClient } from "../../../lib/socket_io/SocketIoClient";
import type { MpdClient } from "./MpdClient";

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
