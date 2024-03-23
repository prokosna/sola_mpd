import {
  SIO_PLUGIN_EXECUTE,
  SIO_PLUGIN_REGISTER,
} from "@sola_mpd/domain/src/const/socketio.js";
import {
  PluginExecuteRequest,
  PluginExecuteResponse,
  PluginRegisterRequest,
  PluginRegisterResponse,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import {
  PluginExecuteRequestWrapper,
  PluginExecuteResponseWrapper,
  PluginRegisterRequestWrapper,
  PluginRegisterResponseWrapper,
} from "@sola_mpd/domain/src/models/plugin/plugin_wrapper_pb.js";
import { Observable, Subject } from "rxjs";
import { Socket } from "socket.io-client";

export async function registerPlugin(
  socket: Socket,
  req: PluginRegisterRequest,
): Promise<PluginRegisterResponse> {
  const reqWrapper = new PluginRegisterRequestWrapper({
    request: req,
  });
  const bytes = reqWrapper.toBinary().buffer;
  return new Promise((resolve, reject) => {
    socket.emit(SIO_PLUGIN_REGISTER, bytes, async (data: ArrayBuffer) => {
      try {
        const resp = PluginRegisterResponseWrapper.fromBinary(
          new Uint8Array(data),
        );
        switch (resp.result.case) {
          case "response":
            resolve(resp.result.value);
            break;
          case "error":
            reject(new Error(resp.result.value));
            break;
          default:
            reject(new Error("No plugin registration result"));
            break;
        }
      } catch (e) {
        reject(e);
      }
    });
  });
}

export function executePlugin(
  socket: Socket,
  req: PluginExecuteRequest,
): Observable<PluginExecuteResponse> {
  const reqWrapper = new PluginExecuteRequestWrapper({
    request: req,
    callbackEvent: `${Date.now()}_${Math.random()}`,
  });
  const bytes = reqWrapper.toBinary().buffer;

  const subject = new Subject<PluginExecuteResponse>();

  socket.on(reqWrapper.callbackEvent, (data: ArrayBuffer) => {
    try {
      const resp = PluginExecuteResponseWrapper.fromBinary(
        new Uint8Array(data),
      );
      switch (resp.result.case) {
        case "response":
          subject.next(resp.result.value);
          break;
        case "complete":
          subject.complete();
          socket.off(reqWrapper.callbackEvent);
          break;
        case "error":
          subject.error(new Error(resp.result.value));
          socket.off(reqWrapper.callbackEvent);
          break;
        default:
          subject.error(new Error("No plugin execution result"));
          break;
      }
    } catch (e) {
      subject.error(e);
      socket.off(reqWrapper.callbackEvent);
    }
  });

  socket.emit(SIO_PLUGIN_EXECUTE, bytes);

  return subject;
}
