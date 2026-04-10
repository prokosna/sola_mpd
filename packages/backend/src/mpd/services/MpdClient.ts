import type {
	MpdRequest,
	MpdResponse,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdEvent } from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

export type MpdSubscriptionHandler = (name?: string) => void;

export interface MpdClient {
	execute: (request: MpdRequest) => Promise<MpdResponse>;
	executeBulk: (requests: MpdRequest[]) => Promise<void>;
	subscribe: (
		profile: MpdProfile,
		callback: (event: MpdEvent) => void,
	) => Promise<MpdSubscriptionHandler>;
	unsubscribe: (
		profile: MpdProfile,
		handler: MpdSubscriptionHandler,
	) => Promise<boolean>;
}
