import {
  MpdRequest,
  MpdResponse,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";

export interface MpdClient {
  command: (req: MpdRequest) => Promise<MpdResponse>;
  commandBulk: (reqs: MpdRequest[]) => Promise<void>;
}
