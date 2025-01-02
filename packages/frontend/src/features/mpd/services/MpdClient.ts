import {
  MpdRequest,
  MpdResponse,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";

/**
 * Interface for MPD server communication.
 *
 * Provides methods to send commands to MPD via HTTP API or Socket.IO.
 * Supports both single and bulk command execution, covering all MPD
 * protocol operations like playback control, queue management, and
 * database queries.
 *
 * Implementations should handle connection states and errors gracefully.
 */
export interface MpdClient {
  /**
   * Sends a single command to MPD and returns the response.
   * @param req The MPD command request
   * @returns Promise resolving to the MPD response
   */
  command: (req: MpdRequest) => Promise<MpdResponse>;

  /**
   * Sends multiple commands to MPD in a single request.
   * @param reqs Array of MPD command requests
   * @returns Promise that resolves when all commands are sent
   */
  commandBulk: (reqs: MpdRequest[]) => Promise<void>;
}
