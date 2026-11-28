import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	SOCKETIO_MPD_COMMAND,
	SOCKETIO_MPD_COMMAND_BULK,
} from "@sola_mpd/shared/src/const/socketio.js";
import {
	type MpdRequest,
	MpdRequestBulkSchema,
	MpdRequestSchema,
	type MpdResponse,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";

import type { MessagingClient } from "../../../lib/messaging/MessagingClient";
import { MpdCommandError } from "../types/MpdCommandError";
import type { MpdClient } from "./MpdClient";

const toMpdCommandError = (err: unknown): MpdCommandError =>
	new MpdCommandError(err instanceof Error ? err.message : String(err), {
		cause: err,
	});

export class MpdClientMessaging implements MpdClient {
	constructor(private client: MessagingClient) {}

	command = async (req: MpdRequest): Promise<MpdResponse> => {
		const res = await this.client
			.fetch(SOCKETIO_MPD_COMMAND, toBinary(MpdRequestSchema, req), (bytes) =>
				fromBinary(MpdResponseSchema, bytes),
			)
			.catch((err: unknown) => {
				throw toMpdCommandError(err);
			});

		if (res.command.case === "error") {
			throw new MpdCommandError(res.command.value.message);
		}

		return res;
	};

	commandBulk = async (reqs: MpdRequest[]): Promise<void> => {
		await this.client
			.emit(
				SOCKETIO_MPD_COMMAND_BULK,
				toBinary(
					MpdRequestBulkSchema,
					create(MpdRequestBulkSchema, { requests: reqs }),
				),
			)
			.catch((err: unknown) => {
				throw toMpdCommandError(err);
			});
	};
}
