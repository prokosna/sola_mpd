import { FilterCondition } from "@sola_mpd/domain/src/models/filter_pb.js";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { RecentlyAddedFilter } from "@sola_mpd/domain/src/models/recently_added_pb.js";
import {
  Song,
  Song_MetadataTag,
  Song_MetadataValue,
} from "@sola_mpd/domain/src/models/song_pb.js";

import { MpdClient } from "../../mpd";

import { convertRecentlyAddedFilterToCondition } from "./recentlyAddedFilterUtils";

/**
 * Fetch songs from MPD based on the given recently added filters.
 *
 * @param {MpdClient} mpdClient
 * @param {MpdProfile} profile
 * @param {RecentlyAddedFilter[]} recentlyAddedFilters
 * @return {Promise<Song[]>} A promise that resolves to an array of songs.
 */
export async function fetchRecentlyAddedSongs(
  mpdClient: MpdClient,
  profile: MpdProfile,
  recentlyAddedFilters: RecentlyAddedFilter[],
  selectedValuesMap: Map<Song_MetadataTag, Song_MetadataValue[]>,
): Promise<Song[]> {
  const conditions = recentlyAddedFilters
    .map((filter) =>
      convertRecentlyAddedFilterToCondition(filter, selectedValuesMap),
    )
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
