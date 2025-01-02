import { MpdEvent_EventType } from "@sola_mpd/domain/src/models/mpd/mpd_event_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

/**
 * Interface for handling real-time MPD server events.
 *
 * Manages event subscriptions and callbacks for database updates,
 * playlist changes, queue modifications, playback states, and
 * connection status. Supports profile-based subscriptions with
 * automatic reconnection handling.
 *
 * Implementations should handle event buffering during reconnection
 * and provide clean event lifecycle management.
 */
export interface MpdListener {
  /**
   * Subscribes to events for a specific MPD profile.
   * @param profile The MPD profile to subscribe to
   */
  subscribe: (profile: MpdProfile) => void;

  /**
   * Unsubscribes from events for a specific MPD profile.
   * @param profile The MPD profile to unsubscribe from
   */
  unsubscribe: (profile: MpdProfile) => void;

  /**
   * Registers a callback for a specific event type.
   * @param event The MPD event type to listen for
   * @param callback Function to call when the event occurs
   */
  on: (event: MpdEvent_EventType, callback: () => void) => void;

  /**
   * Removes the callback for a specific event type.
   * @param event The MPD event type to stop listening for
   */
  off: (event: MpdEvent_EventType) => void;
}
