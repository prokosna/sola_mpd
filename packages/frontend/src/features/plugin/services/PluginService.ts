import type {
	PluginExecuteRequest,
	PluginExecuteResponse,
	PluginRegisterRequest,
	PluginRegisterResponse,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Observable } from "rxjs";

export interface PluginService {
	register: (req: PluginRegisterRequest) => Promise<PluginRegisterResponse>;
	execute: (req: PluginExecuteRequest) => Observable<PluginExecuteResponse>;
}
