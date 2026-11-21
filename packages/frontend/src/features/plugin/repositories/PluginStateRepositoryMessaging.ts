import { CONFIG_KEY_PLUGIN_STATE } from "@sola_mpd/shared/src/const/socketio.js";
import type { PluginState } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { PluginStateSchema } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { MessagingClient } from "../../../lib/messaging/MessagingClient";
import { StateRepositoryMessaging } from "../../common";

export class PluginStateRepositoryMessaging extends StateRepositoryMessaging<PluginState> {
	constructor(client: MessagingClient) {
		super(client, CONFIG_KEY_PLUGIN_STATE, PluginStateSchema);
	}
}
