import { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";

/**
 * Properties required for plugin execution.
 *
 * This type defines the necessary information to execute
 * a plugin operation on a set of songs.
 *
 * Properties:
 * - plugin: The plugin to execute (undefined when not selected)
 * - songs: Array of songs to process (empty when no songs selected)
 *
 * Common Use Cases:
 * - Plugin execution setup
 * - Batch song processing
 * - Plugin operation validation
 *
 * Example:
 * ```typescript
 * const props: PluginExecutionProps = {
 *   plugin: selectedPlugin,
 *   songs: selectedSongs,
 * };
 * ```
 */
export type PluginExecutionProps = {
  plugin: Plugin | undefined;
  songs: Song[];
};
