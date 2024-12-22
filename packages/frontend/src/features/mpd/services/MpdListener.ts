import { MpdEvent_EventType } from "@sola_mpd/domain/src/models/mpd/mpd_event_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

/**
 * MpdListener is an interface for listening to events emitted by mpd. It provides methods to subscribe and unsubscribe to events
 * and to register callbacks for events.
 *
 * It is used by MpdClient to listen to events emitted by mpd.
 */
export interface MpdListener {
  subscribe: (profile: MpdProfile) => void;
  unsubscribe: (profile: MpdProfile) => void;
  on: (event: MpdEvent_EventType, callback: () => void) => void;
  off: (event: MpdEvent_EventType) => void;
}
