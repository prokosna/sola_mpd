import {
  SIO_MPD_EVENT,
  SIO_MPD_SUBSCRIBE,
  SIO_MPD_UNSUBSCRIBE,
} from "@sola_mpd/domain/src/const/socketio.js";
import {
  MpdEvent,
  MpdEvent_EventType,
} from "@sola_mpd/domain/src/models/mpd/mpd_event_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import { MpdListener } from "../../features/mpd";
import { SocketIoClient } from "../socket_io/SocketIoClient.js";

/**
 * MpdListenerImplSocketIo is an implementation of MpdListener that uses socket.io as the underlying transport.
 * It sends a subscription request to the server when a client subscribes to an event, and when the event is
 * received, it calls the callback function registered by the client.
 */
export class MpdListenerImplSocketIo implements MpdListener {
  private socket: SocketIoClient;
  private callbacks: Map<MpdEvent_EventType, () => void>;

  constructor(socketIoClient: SocketIoClient) {
    this.socket = socketIoClient;
    this.callbacks = new Map();
  }

  subscribe = (profile: MpdProfile): void => {
    this.socket.on(SIO_MPD_EVENT, (msg: Uint8Array) => {
      const event = MpdEvent.fromBinary(msg);
      console.info(`MPD event: ${MpdEvent_EventType[event.eventType]}`);
      this.callbacks.get(event.eventType)?.();
    });
    this.socket.emit(SIO_MPD_SUBSCRIBE, profile.toBinary());
  };

  unsubscribe = (profile: MpdProfile): void => {
    this.socket.off(SIO_MPD_EVENT);
    this.socket.emit(SIO_MPD_UNSUBSCRIBE, profile.toBinary());
  };

  on = (event: MpdEvent_EventType, callback: () => void): void => {
    this.callbacks.set(event, callback);
  };

  off = (event: MpdEvent_EventType): void => {
    this.callbacks.delete(event);
  };
}
