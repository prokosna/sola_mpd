import type { MpdEvent_EventType } from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

export interface MpdListener {
	subscribe: (profile: MpdProfile) => void;
	unsubscribe: (profile: MpdProfile) => void;
	on: (event: MpdEvent_EventType, callback: () => void) => void;
	off: (event: MpdEvent_EventType) => void;
}
