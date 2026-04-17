import { CONFIG_KEY_BROWSER_STATE } from "@sola_mpd/shared/src/const/socketio.js";
import type { BrowserState } from "@sola_mpd/shared/src/models/browser_pb.js";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import type { MessagingClient } from "../../../../lib/messaging/MessagingClient";
import { StateRepositorySocketIo } from "../../../common/repositories/StateRepositorySocketIo";

export class BrowserStateRepositorySocketIo extends StateRepositorySocketIo<BrowserState> {
	constructor(client: MessagingClient) {
		super(client, CONFIG_KEY_BROWSER_STATE, BrowserStateSchema);
	}
}
