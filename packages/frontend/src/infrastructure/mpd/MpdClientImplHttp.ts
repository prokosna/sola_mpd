import {
	API_MPD_COMMAND,
	API_MPD_COMMAND_BULK,
} from "@sola_mpd/domain/src/const/api.js";
import {
	type MpdRequest,
	MpdRequestBulk,
	MpdResponse,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";

import type { MpdClient } from "../../features/mpd";
import type { HttpClient } from "../http/HttpClient";

/**
 * MpdClientImplHttp is an implementation of MpdClient that uses HTTP as the underlying transport.
 * It provides methods to send commands to mpd via HTTP.
 * It uses the HttpClient to send requests to the server.
 */
export class MpdClientImplHttp implements MpdClient {
	constructor(private client: HttpClient) {}

	command = async (req: MpdRequest): Promise<MpdResponse> => {
		const res = await this.client.put<MpdResponse>(
			API_MPD_COMMAND,
			req.toBinary(),
			MpdResponse.fromBinary,
		);

		if (res.command.case === "error") {
			throw new Error(res.command.value.message);
		}

		return res;
	};

	commandBulk = async (reqs: MpdRequest[]): Promise<void> => {
		return this.client.post(
			API_MPD_COMMAND_BULK,
			new MpdRequestBulk({ requests: reqs }).toBinary(),
		);
	};
}
