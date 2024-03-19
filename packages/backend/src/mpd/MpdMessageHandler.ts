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
import { ProfileHandler } from "./types/ProfileHandler.js";

export class MpdMessageHandler {
  private idHandlerMap: Map<string, ProfileHandler>;

  private constructor(private io: IOServer) {
    this.idHandlerMap = new Map();
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
      if (this.idHandlerMap.has(id)) {
        return;
      }

      const profile = MpdProfile.fromBinary(msg);

      const room = `${profile.host}:${profile.port}`;
      socket.join(room);

      // Event listener
      const handle = await mpdClient.subscribe(profile, (event: MpdEvent) => {
        this.io.to(room).emit(SIO_MPD_EVENT, event.toJsonString());
      });
      this.idHandlerMap.set(id, {
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

  async disconnect(id: string): Promise<void> {
    const profileHandler = this.idHandlerMap.get(id);
    if (profileHandler != null) {
      mpdClient.unsubscribe(profileHandler.profile, profileHandler.handle);
    }
  }
}
