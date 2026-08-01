import type { PluginState } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { atom } from "jotai";

import { showNotification } from "../../../../lib/mantine/showNotification";
import { UpdateMode } from "../../../../types/stateTypes";
import { pluginAsyncAtom } from "../atoms/pluginAtom";
import { pluginStateRepositoryAtom } from "../atoms/pluginStateRepositoryAtom";

export const updatePluginActionAtom = atom(
	null,
	async (get, set, params: { pluginState: PluginState; mode: UpdateMode }) => {
		if (params.mode & UpdateMode.PERSIST) {
			try {
				await get(pluginStateRepositoryAtom).save(params.pluginState);
			} catch (e) {
				console.error(e);
				showNotification({
					title: "Could not save plugins",
					description: e instanceof Error ? e.message : String(e),
					status: "error",
				});
				return;
			}
		}
		if (params.mode & UpdateMode.LOCAL_STATE) {
			set(pluginAsyncAtom, params.pluginState);
		}
	},
);
