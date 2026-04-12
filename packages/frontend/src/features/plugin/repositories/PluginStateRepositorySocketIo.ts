import { CONFIG_KEY_PLUGIN_STATE } from "@sola_mpd/shared/src/const/socketio.js";
import type { PluginState } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { PluginStateSchema } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { SocketIoClient } from "../../../lib/socket_io/SocketIoClient";
import { StateRepositorySocketIo } from "../../common/repositories/StateRepositorySocketIo";

export class PluginStateRepositorySocketIo extends StateRepositorySocketIo<PluginState> {
	constructor(client: SocketIoClient) {
		super(client, CONFIG_KEY_PLUGIN_STATE, PluginStateSchema);
	}
}
