import { Server as IOServer, Socket } from "socket.io";

import { mpdClient } from "@/backend/mpd/MpdClient";
import { WS_MESSAGE, WS_MPD_EVENT } from "@/const";
import { MpdEvent } from "@/models/mpd/mpd_event";
import { MpdProfile } from "@/models/mpd/mpd_profile";

type ProfileHandler = {
  profile: MpdProfile;
  handle: (name?: string) => void;
};

export class MpdSocketHandler {
  private idHandlerMap: Map<string, ProfileHandler>;

  constructor(private io: IOServer) {
    this.idHandlerMap = new Map();
  }

  async subscribeEvents(id: string, msg: any, socket: Socket): Promise<void> {
    try {
      const profile = MpdProfile.fromJSON(JSON.parse(msg));

      // Room
      const room = `${profile.host}:${profile.port}`;
      socket.join(room);

      // Event listener
      const handle = await mpdClient.subscribe(profile, (event) => {
        this.io
          .to(room)
          .emit(WS_MPD_EVENT, JSON.stringify(MpdEvent.toJSON(event)));
      });
      this.idHandlerMap.set(id, {
        profile,
        handle,
      });

      console.info(`New client registered: ${id} for ${room}`);
    } catch (err) {
      console.error(err);
      socket.emit(WS_MESSAGE, err);
    }
    return;
  }

  async disconnect(id: string): Promise<void> {
    const profileHandler = this.idHandlerMap.get(id);
    if (profileHandler != null) {
      mpdClient.unsubscribe(profileHandler.profile, profileHandler.handle);
    }
  }
}
