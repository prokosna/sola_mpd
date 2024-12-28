import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useCallback } from "react";

import { MpdClient } from "../../mpd";

export function useHandleSongDoubleClick(
  mpdClient?: MpdClient,
  mpdProfile?: MpdProfile,
) {
  return useCallback(
    async (clickedSong: Song) => {
      if (mpdProfile === undefined || mpdClient === undefined) {
        return;
      }
      const addCommand = new MpdRequest({
        profile: mpdProfile,
        command: {
          case: "add",
          value: { uri: clickedSong.path },
        },
      });
      await mpdClient.command(addCommand);
      const getCommand = new MpdRequest({
        profile: mpdProfile,
        command: {
          case: "playlistinfo",
          value: {},
        },
      });
      const res = await mpdClient.command(getCommand);
      if (res.command.case !== "playlistinfo") {
        throw Error(`Invalid MPD response: ${res.toJsonString()}`);
      }
      const playQueueSongs = res.command.value.songs;
      await mpdClient.command(
        new MpdRequest({
          profile: mpdProfile,
          command: {
            case: "play",
            value: {
              target: {
                case: "pos",
                value: String(playQueueSongs.length - 1),
              },
            },
          },
        }),
      );
    },
    [mpdClient, mpdProfile],
  );
}
