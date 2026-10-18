import { fromBinary } from "@bufbuild/protobuf";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";

// A successful subscribe is acknowledged with an empty payload; a failure
// carries an encoded MpdResponse error.
export function getSubscribeAckError(ack: Uint8Array): string | undefined {
	if (ack.byteLength === 0) {
		return undefined;
	}
	try {
		const response = fromBinary(MpdResponseSchema, ack);
		return response.command.case === "error"
			? response.command.value.message
			: undefined;
	} catch {
		return "Malformed subscribe acknowledgement";
	}
}
