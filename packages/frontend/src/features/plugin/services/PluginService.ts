import {
  PluginExecuteRequest,
  PluginExecuteResponse,
  PluginRegisterRequest,
  PluginRegisterResponse,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Observable } from "rxjs";

/**
 * Plugin operations service.
 *
 * Handles registration and execution.
 */
export interface PluginService {
  /**
   * Register plugin with system.
   *
   * @param req Registration request
   * @returns Registration response
   * @throws On registration failure
   */
  register: (req: PluginRegisterRequest) => Promise<PluginRegisterResponse>;

  /**
   * Execute plugin on songs.
   *
   * @param req Execution request
   * @returns Observable of execution progress
   * @throws On execution failure
   */
  execute: (req: PluginExecuteRequest) => Observable<PluginExecuteResponse>;
}
