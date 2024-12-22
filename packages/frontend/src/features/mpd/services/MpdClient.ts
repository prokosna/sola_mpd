import {
  MpdRequest,
  MpdResponse,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";

/**
 * MpdClient is a service that provides functions to send commands to mpd via http api or socket.io.
 * It provides two methods: `command` and `commandBulk`.
 * `command` sends a single command to mpd and returns a promise that resolves to the response.
 * `commandBulk` sends multiple commands to mpd in a single request and returns a promise that resolves when the request is sent.
 */
export interface MpdClient {
  command: (req: MpdRequest) => Promise<MpdResponse>;
  commandBulk: (reqs: MpdRequest[]) => Promise<void>;
}
