import { Server as IOServer } from "socket.io";

import { MpdSocketHandler } from "../mpd/MpdSocketHandler";
import { PluginSocketHandler } from "../plugin/PluginSocketHandler";

import {
  WS_MPD_SUBSCRIBE,
  WS_PLUGIN_EXECUTE,
  WS_PLUGIN_REGISTER,
} from "@/const";

class WebSocketManager {
  initialize(io: IOServer) {
    console.info("WebSocket is initializing");

    const mpdHandler = new MpdSocketHandler(io);
    const pluginHandler = new PluginSocketHandler();

    io.on("connection", (socket) => {
      const id = socket.id;

      socket.on(WS_MPD_SUBSCRIBE, async (msg) => {
        await mpdHandler.subscribeEvents(id, msg, socket);
      });

      socket.on(WS_PLUGIN_REGISTER, async (msg) => {
        await pluginHandler.register(msg, socket);
      });

      socket.on(WS_PLUGIN_EXECUTE, async (msg) => {
        await pluginHandler.execute(msg, socket);
      });

      socket.on("disconnect", async () => {
        await mpdHandler.disconnect(id);
      });
    });
  }
}
export const webSocketManager = new WebSocketManager();
