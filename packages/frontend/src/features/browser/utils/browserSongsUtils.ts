import { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import { FilterCondition } from "@sola_mpd/domain/src/models/filter_pb.js";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";

import { MpdClient } from "../../mpd";

import { convertBrowserFilterToCondition } from "./browserFilterUtils";

/**
 * Fetch songs from MPD based on the given browser filters.
 *
 * @param {MpdClient} mpdClient
 * @param {MpdProfile} profile
 * @param {BrowserFilter[]} browserFilters
 * @return {Promise<Song[]>} A promise that resolves to an array of songs.
 */
export async function fetchBrowserSongs(
  mpdClient: MpdClient,
  profile: MpdProfile,
  browserFilters: BrowserFilter[],
): Promise<Song[]> {
  const conditions = browserFilters
    .map((filter) => convertBrowserFilterToCondition(filter))
    .filter((condition) => condition !== undefined) as FilterCondition[];
  if (conditions.length === 0) {
    return [];
  }

  const req = new MpdRequest({
    profile,
    command: {
      case: "search",
      value: {
        conditions,
      },
    },
  });
  const res = await mpdClient.command(req);
  if (res.command.case !== "search") {
    throw Error(`Invalid MPD response: ${res.toJsonString()}`);
  }
  return res.command.value.songs;
}
