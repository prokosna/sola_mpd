import type { Plugin } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

export type PluginExecutionProps = {
	plugin: Plugin | undefined;
	songs: Song[];
};
