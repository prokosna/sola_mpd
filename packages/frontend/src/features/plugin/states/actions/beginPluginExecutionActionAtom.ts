import type { Plugin } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import {
	pluginExecutionModalOpenAtom,
	pluginExecutionPropsAtom,
} from "../atoms/pluginExecutionAtom";

/** The modal has nothing to show until the target songs are set. */
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
