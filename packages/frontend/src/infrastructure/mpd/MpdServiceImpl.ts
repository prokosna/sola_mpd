import {
  SIO_MPD_EVENT,
  SIO_MPD_SUBSCRIBE,
  SIO_MPD_UNSUBSCRIBE,
} from "@sola_mpd/domain/src/const/socketio.js";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdEvent } from "@sola_mpd/domain/src/models/mpd/mpd_event_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";

import { MpdService, MpdVersion } from "../../features/mpd";
import { SocketIoClient } from "../socketio/SocketIoClient";

import { MpdClient } from "./MpdClient";

export class MpdServiceImpl implements MpdService {
  constructor(
    private mpdClient: MpdClient,
    private socketClient: SocketIoClient,
  ) {}

  subscribe =
    (profile: MpdProfile) =>
    (callback: (event: MpdEvent) => Promise<void>): void => {
      this.socketClient.on(SIO_MPD_EVENT, (message: string) => {
        const event = MpdEvent.fromJsonString(message);
        callback(event);
      });

      this.socketClient.emit(SIO_MPD_SUBSCRIBE, profile.toBinary());
    };

  unsubscribe = (profile: MpdProfile) => (): void => {
    this.socketClient.off(SIO_MPD_EVENT);
    this.socketClient.emit(SIO_MPD_UNSUBSCRIBE, profile.toBinary());
  };

  pingMpd = async (host: string, port: number): Promise<MpdVersion> => {
    const res = await this.mpdClient.command(
      new MpdRequest({
        profile: new MpdProfile({
          name: crypto.randomUUID(),
          host,
          port,
        }),
        command: {
          case: "ping",
          value: {},
        },
      }),
    );

    if (res.command.case !== "ping") {
      throw new Error(`Invalid MPD response: ${res}`);
    }

    return res.command.value.version;
  };

  addSongsToPlayQueue =
    (profile: MpdProfile) =>
    async (songs: Song[]): Promise<void> => {
      const requests = songs.map(
        (song) =>
          new MpdRequest({
            profile,
            command: {
              case: "add",
              value: {
                uri: song.path,
              },
            },
          }),
      );
      this.mpdClient.commandBulk(requests);
    };

  clearPlayQueue = (profile: MpdProfile) => async (): Promise<void> => {
    this.mpdClient.command(
      new MpdRequest({
        profile,
        command: {
          case: "clear",
          value: {},
        },
      }),
    );
  };
}
