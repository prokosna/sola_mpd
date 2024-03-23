import { API_CONFIGS_BROWSER_STATE } from "@sola_mpd/domain/src/const/api.js";
import {
  BrowserFilter,
  BrowserState,
} from "@sola_mpd/domain/src/models/browser_pb.js";
import { FilterCondition } from "@sola_mpd/domain/src/models/filter_pb.js";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { Song, Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";

import { HttpApiClient } from "../../http_api";
import { MpdClient } from "../../mpd";

import { convertBrowserFilterToCondition } from "./filter";

export async function fetchBrowserFilterValuesMap(
  mpdClient: MpdClient,
  profile: MpdProfile,
  browserFilters: BrowserFilter[],
): Promise<Map<Song_MetadataTag, string[]>> {
  const selectedSortedFilters = Array.from(
    browserFilters.filter(
      (browserFilter) => browserFilter.selectedValues.length !== 0,
    ),
  ).sort((a, b) => a.selectedOrder - b.selectedOrder);

  // Fetch values for each filter in parallel
  const browserFilterValuesPairs: [Song_MetadataTag, string[]][] =
    await Promise.all(
      browserFilters.map(async (browserFilter) => {
        // The conditions for each filter are not independent.
        // The conditions depend on the order in which the values of the filter were selected,
        // and match the conditions of all filters selected prior to this one.
        const conditions: FilterCondition[] = [];
        if (browserFilter.selectedOrder !== 1) {
          for (const selectedFilter of selectedSortedFilters) {
            if (browserFilter === selectedFilter) {
              break;
            }
            const condition = convertBrowserFilterToCondition(selectedFilter);
            if (condition === undefined) {
              continue;
            }
            conditions.push(condition);
          }
        }

        const req = new MpdRequest({
          profile,
          command: {
            case: "list",
            value: {
              tag: browserFilter.tag,
              conditions,
            },
          },
        });
        const res = await mpdClient.command(req);
        if (res.command.case !== "list") {
          throw Error(`Invalid MPD response: ${res.toJsonString()}`);
        }
        return [browserFilter.tag, res.command.value.values];
      }),
    );

  return new Map(browserFilterValuesPairs);
}

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

export async function fetchBrowserState(): Promise<BrowserState> {
  const state = await HttpApiClient.get<BrowserState>(
    API_CONFIGS_BROWSER_STATE,
    BrowserState.fromBinary,
  );
  return state;
}

export async function sendBrowserState(state: BrowserState) {
  await HttpApiClient.post(API_CONFIGS_BROWSER_STATE, state.toBinary());
}
