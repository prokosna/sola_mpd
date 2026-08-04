import type { Plugin } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import {
	pluginExecutionModalOpenAtom,
	pluginExecutionPropsAtom,
} from "../atoms/pluginExecutionAtom";

/**
 * Starts a plugin run for the given songs by opening the modal on its
 * parameter step. Naming the target songs and opening the modal are one
 * intent, not two independent writes — the modal has nothing to show until the
 * props are set.
 */
export const beginPluginExecutionActionAtom = atom(
	null,
	(_get, set, args: { plugin: Plugin; songs: Song[] }) => {
		set(pluginExecutionPropsAtom, {
			plugin: args.plugin,
			songs: args.songs,
		});
		set(pluginExecutionModalOpenAtom, "start");
	},
);
