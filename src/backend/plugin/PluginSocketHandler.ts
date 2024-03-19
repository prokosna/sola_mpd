import * as grpc from "@grpc/grpc-js";
import { Socket } from "socket.io";

import {
  PluginExecuteRequest,
  PluginExecuteResponse,
  PluginRegisterRequest,
  PluginRegisterResponse,
} from "@/models/plugin/plugin";
import { PluginServiceClient } from "@/models/plugin/plugin_service";
import { PluginRequestMessage, PluginResponseMessage } from "@/types/websocket";

export class PluginSocketHandler {
  async register(msg: PluginRequestMessage, socket: Socket): Promise<void> {
    const callbackEvent = msg.callbackEvent;
    const bytes = new Uint8Array(msg.data);
    const req = PluginRegisterRequest.decode(bytes);
    const client = new PluginServiceClient(
      `${req.host}:${req.port}`,
      grpc.credentials.createInsecure(),
    );

    client.register(req, (err, resp) => {
      if (err) {
        const msg: PluginResponseMessage = {
          data: undefined,
          error: err.message,
          status: "error",
        };
        socket.emit(callbackEvent, msg);
        return;
      }
      const bytes = PluginRegisterResponse.encode(resp).finish();
      const msg: PluginResponseMessage = {
        data: bytes,
        error: "",
        status: "end",
      };
      socket.emit(callbackEvent, msg);
    });
  }

  async execute(msg: any, socket: Socket): Promise<void> {
    const callbackEvent = msg.callbackEvent;
    const bytes = new Uint8Array(msg.data);
    const req = PluginExecuteRequest.decode(bytes);
    const client = new PluginServiceClient(
      `${req.host}:${req.port}`,
      grpc.credentials.createInsecure(),
    );
    const stream = client.execute(req);

    stream.on("data", (resp: PluginExecuteResponse) => {
      const bytes = PluginExecuteResponse.encode(resp).finish();
      const msg: PluginResponseMessage = {
        data: bytes,
        error: "",
        status: "ok",
      };
      socket.emit(callbackEvent, msg);
    });

    stream.on("error", (err) => {
      const msg: PluginResponseMessage = {
        data: undefined,
        error: err.message,
        status: "error",
      };
      socket.emit(callbackEvent, msg);
    });

    stream.on("end", () => {
      const msg: PluginResponseMessage = {
        data: undefined,
        error: "",
        status: "end",
      };
      socket.emit(callbackEvent, msg);
    });
  }
}
