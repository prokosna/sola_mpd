import { Observable, Subject } from "rxjs";
import { Socket } from "socket.io-client";

import { WS_PLUGIN_EXECUTE, WS_PLUGIN_REGISTER } from "@/const";
import {
  PluginExecuteRequest,
  PluginExecuteResponse,
  PluginRegisterRequest,
  PluginRegisterResponse,
} from "@/models/plugin/plugin";
import { PluginRequestMessage, PluginResponseMessage } from "@/types/websocket";

export class PluginUtils {
  static async register(
    socket: Socket,
    req: PluginRegisterRequest,
  ): Promise<PluginRegisterResponse> {
    const callbackEvent = `${Date.now()}_${Math.random()}`;

    const reqMsg: PluginRequestMessage = {
      data: PluginRegisterRequest.encode(req).finish(),
      callbackEvent,
    };

    return new Promise((resolve, reject) => {
      socket.on(callbackEvent, ({ data, error }: PluginResponseMessage) => {
        if (error !== "" || data === undefined) {
          reject(new Error(error));
          return;
        }
        const bytes = new Uint8Array(data);
        const resp = PluginRegisterResponse.decode(bytes);
        socket.off(callbackEvent);
        resolve(resp);
      });
      socket.emit(WS_PLUGIN_REGISTER, reqMsg);
    });
  }

  static execute(
    socket: Socket,
    req: PluginExecuteRequest,
  ): Observable<PluginExecuteResponse> {
    const callbackEvent = `${Date.now()}_${Math.random()}`;

    const reqMsg: PluginRequestMessage = {
      data: PluginExecuteRequest.encode(req).finish(),
      callbackEvent,
    };

    const subject = new Subject<PluginExecuteResponse>();

    socket.on(
      callbackEvent,
      ({ data, error, status }: PluginResponseMessage) => {
        if (status === "error") {
          subject.error(new Error(error));
        } else if (status === "ok") {
          if (data === undefined) {
            return;
          }
          const bytes = new Uint8Array(data);
          const resp = PluginExecuteResponse.decode(bytes);
          subject.next(resp);
        } else if (status == "end") {
          subject.complete();
          socket.off(callbackEvent);
        }
      },
    );
    socket.emit(WS_PLUGIN_EXECUTE, reqMsg);

    return subject;
  }
}
