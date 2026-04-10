import type { PluginState } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { atom } from "jotai";

import { UpdateMode } from "../../../../types/stateTypes";
import { pluginAsyncAtom } from "../atoms/pluginAtom";
import { pluginStateRepositoryAtom } from "../atoms/pluginStateRepositoryAtom";

export const updatePluginActionAtom = atom(
	null,
	async (get, set, params: { pluginState: PluginState; mode: UpdateMode }) => {
		if (params.mode & UpdateMode.LOCAL_STATE) {
			set(pluginAsyncAtom, params.pluginState);
		}
		if (params.mode & UpdateMode.PERSIST) {
			const repository = get(pluginStateRepositoryAtom);
			await repository.save(params.pluginState);
		}
	},
);
