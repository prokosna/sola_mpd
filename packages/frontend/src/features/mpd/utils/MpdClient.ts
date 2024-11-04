/**
 * @deprecated
 */
import {
  API_MPD_COMMAND,
  API_MPD_COMMAND_BULK,
} from "@sola_mpd/domain/src/const/api.js";
import {
  SIO_MPD_COMMAND,
  SIO_MPD_COMMAND_BULK,
} from "@sola_mpd/domain/src/const/socketio.js";
import {
  MpdRequest,
  MpdRequestBulk,
  MpdResponse,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { Socket } from "socket.io-client";

import { HttpApiClient } from "../../http_api";
import { SocketIoClientUtils } from "../../socketio";

export class MpdClient {
  private constructor(private socket: Socket) {}

  static initialize(socket: Socket): MpdClient {
    return new MpdClient(socket);
  }

  async command(req: MpdRequest): Promise<MpdResponse> {
    const res = await HttpApiClient.put<MpdResponse>(
      API_MPD_COMMAND,
      req.toBinary(),
      MpdResponse.fromBinary,
    );

    if (res.command.case === "error") {
      throw Error(res.command.value.message);
    }

    return res;
  }

  async commandBulk(reqs: MpdRequest[]): Promise<void> {
    return HttpApiClient.post(
      API_MPD_COMMAND_BULK,
      new MpdRequestBulk({ requests: reqs }).toBinary(),
    );
  }

  async commandBySocket(req: MpdRequest): Promise<MpdResponse> {
    const res = await SocketIoClientUtils.fetch(
      this.socket,
      SIO_MPD_COMMAND,
      req.toBinary(),
      MpdResponse.fromBinary,
    );

    if (res.command.case === "error") {
      throw Error(res.command.value.message);
    }

    return res;
  }

  async commandBulkBySocket(reqs: MpdRequest[]): Promise<void> {
    return SocketIoClientUtils.emit(
      this.socket,
      SIO_MPD_COMMAND_BULK,
      new MpdRequestBulk({ requests: reqs }).toBinary(),
    );
  }
}
