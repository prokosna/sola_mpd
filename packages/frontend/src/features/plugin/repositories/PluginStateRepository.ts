import type { PluginState } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { StateRepository } from "../../common/repositories/StateRepository";

export type PluginStateRepository = StateRepository<PluginState>;
