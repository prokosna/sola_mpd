import {
  SIO_MESSAGE,
  SIO_MPD_EVENT,
} from "@sola_mpd/domain/src/const/socketio.js";
import {
  MpdRequest,
  MpdRequestBulk,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdEvent } from "@sola_mpd/domain/src/models/mpd/mpd_event_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { Server as IOServer, Socket } from "socket.io";

import { mpdClient } from "./mpdClient.js";
import { MpdEventHandler } from "./types/MpdEventHandler.js";

/**
 * MpdMessageHandler is a class that handles messages from socket.io clients.
 *
 * It provides methods to subscribe and unsubscribe to events emitted by mpd.
 * It also provides methods to send commands to mpd.
 */
export class MpdMessageHandler {
  private idHandlersMap: Map<string, MpdEventHandler[]>;

  private constructor(private io: IOServer) {
    this.idHandlersMap = new Map();
  }

  static initialize(io: IOServer): MpdMessageHandler {
    const mpdMessageHandler = new MpdMessageHandler(io);
    return mpdMessageHandler;
  }

  async subscribeEvents(
    id: string,
    msg: Uint8Array,
    socket: Socket,
  ): Promise<void> {
    try {
      const profile = MpdProfile.fromBinary(msg);
      if (!this.idHandlersMap.has(id)) {
        this.idHandlersMap.set(id, []);
      }

      if (
        this.idHandlersMap
          .get(id)!
          .findIndex((handler) => handler.profile.name === profile.name) >= 0
      ) {
        return;
      }

      const room = `${profile.host}:${profile.port}`;
      socket.join(room);

      // Event listener.
      const handle = await mpdClient.subscribe(profile, (event: MpdEvent) => {
        this.io.to(room).emit(SIO_MPD_EVENT, event.toBinary());
      });

      this.idHandlersMap.get(id)!.push({
        profile,
        handle,
      });

      console.info(`New client registered: ${id} for ${room}`);
    } catch (err) {
      console.error(err);
      socket.emit(SIO_MESSAGE, err);
    }
    return;
  }

  async unsubscribeEvents(
    id: string,
    msg: Uint8Array,
    socket: Socket,
  ): Promise<void> {
    if (!this.idHandlersMap.has(id)) {
      return;
    }

    try {
      const profile = MpdProfile.fromBinary(msg);
      const handlerIndex = this.idHandlersMap
        .get(id)!
        .findIndex((handler) => handler.profile.name === profile.name);
      if (handlerIndex < 0) {
        return;
      }

      const handler = this.idHandlersMap.get(id)![handlerIndex];
      const room = `${handler.profile.host}:${handler.profile.port}`;
      socket.leave(room);
      await mpdClient.unsubscribe(handler.profile, handler.handle);
      this.idHandlersMap.get(id)!.splice(handlerIndex, 1);
      console.info(`${id}.${profile.name} has been unsubscribed.`);
    } catch (err) {
      console.error(err);
      socket.emit(SIO_MESSAGE, err);
    }
    return;
  }

  async command(msg: Uint8Array): Promise<Uint8Array> {
    const req = MpdRequest.fromBinary(msg);
    const res = await mpdClient.execute(req);
    return res.toBinary();
  }

  async commandBulk(msg: Uint8Array): Promise<void> {
    const req = MpdRequestBulk.fromBinary(msg);
    await mpdClient.executeBulk(req.requests);
    return;
  }

  async disconnect(id: string, socket: Socket): Promise<void> {
    const handlers = this.idHandlersMap.get(id);
    if (handlers !== undefined) {
      for (const handler of handlers) {
        const room = `${handler.profile.host}:${handler.profile.port}`;
        socket.leave(room);
        await mpdClient.unsubscribe(handler.profile, handler.handle);
      }
    }
    this.idHandlersMap.delete(id);
  }
}
