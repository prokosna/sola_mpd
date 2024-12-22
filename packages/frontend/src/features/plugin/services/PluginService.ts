import {
  PluginExecuteRequest,
  PluginExecuteResponse,
  PluginRegisterRequest,
  PluginRegisterResponse,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Observable } from "rxjs";

/**
 * Plugin service.
 */
export interface PluginService {
  /**
   * Registers a plugin.
   * @param req Plugin registration request.
   * @returns Promise of plugin registration response.
   */
  register: (req: PluginRegisterRequest) => Promise<PluginRegisterResponse>;

  /**
   * Executes a plugin.
   * @param req Plugin execution request.
   * @returns Observable of plugin execution response.
   */
  execute: (req: PluginExecuteRequest) => Observable<PluginExecuteResponse>;
}
