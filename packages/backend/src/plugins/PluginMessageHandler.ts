import { createPromiseClient } from "@connectrpc/connect";
import { createGrpcTransport } from "@connectrpc/connect-node";
import { PluginService } from "@sola_mpd/domain/src/models/plugin/plugin_service_connect.js";
import {
  PluginExecuteRequestWrapper,
  PluginExecuteResponseWrapper,
  PluginRegisterRequestWrapper,
  PluginRegisterResponseWrapper,
} from "@sola_mpd/domain/src/models/plugin/plugin_wrapper_pb.js";

export class PluginMessageHandler {
  constructor() {}

  async register(msg: Uint8Array): Promise<Uint8Array> {
    const req = PluginRegisterRequestWrapper.fromBinary(msg);

    try {
      const request = req.request;
      if (request === undefined) {
        throw new Error("Invalid PluginRegisterRequest: undefined");
      }

      const transport = createGrpcTransport({
        httpVersion: "1.1",
        baseUrl: `http://${request.host}:${request.port}`,
      });

      const client = createPromiseClient(PluginService, transport);
      const resp = await client.register(request);
      const wrapper = new PluginRegisterResponseWrapper({
        result: {
          case: "response",
          value: resp,
        },
      });
      return wrapper.toBinary();
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : String(e);
      const wrapper = new PluginRegisterResponseWrapper({
        result: {
          case: "error",
          value: message,
        },
      });
      return wrapper.toBinary();
    }
  }

  async *execute(msg: Uint8Array): AsyncGenerator<[string, Uint8Array]> {
    const req = PluginExecuteRequestWrapper.fromBinary(msg);

    try {
      const request = req.request;
      if (request === undefined) {
        throw new Error("Invalid PluginExecutionRequest: undefined");
      }

      const transport = createGrpcTransport({
        httpVersion: "1.1",
        baseUrl: `http://${request.host}:${request.port}`,
      });

      const client = createPromiseClient(PluginService, transport);

      for await (const resp of client.execute(request)) {
        yield [
          req.callbackEvent,
          new PluginExecuteResponseWrapper({
            result: {
              case: "response",
              value: resp,
            },
          }).toBinary(),
        ];
      }

      yield [
        req.callbackEvent,
        new PluginExecuteResponseWrapper({
          result: {
            case: "complete",
            value: true,
          },
        }).toBinary(),
      ];
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      const wrapper = new PluginExecuteResponseWrapper({
        result: {
          case: "error",
          value: message,
        },
      });
      yield [req.callbackEvent, wrapper.toBinary()];
    }
  }
}
