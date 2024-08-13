import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import { MpdService, MpdVersion } from "../../features/mpd/MpdService";

import { MpdClient } from "./MpdClient";

export class MpdServiceImpl implements MpdService {
  constructor(private client: MpdClient) {}

  pingMpd = async (host: string, port: number): Promise<MpdVersion> => {
    const res = await this.client.command(
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
}
