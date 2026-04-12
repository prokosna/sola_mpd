import { CONFIG_KEY_BROWSER_STATE } from "@sola_mpd/shared/src/const/socketio.js";
import type { BrowserState } from "@sola_mpd/shared/src/models/browser_pb.js";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import type { SocketIoClient } from "../../../../lib/socket_io/SocketIoClient";
import { StateRepositorySocketIo } from "../../../common/repositories/StateRepositorySocketIo";

export class BrowserStateRepositorySocketIo extends StateRepositorySocketIo<BrowserState> {
	constructor(client: SocketIoClient) {
		super(client, CONFIG_KEY_BROWSER_STATE, BrowserStateSchema);
	}
}
