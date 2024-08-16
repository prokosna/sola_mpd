import { Socket, io } from "socket.io-client";

import { SocketIoClient } from "./SocketIoClient";

export class SocketIoClientImpl implements SocketIoClient {
  private socket: Promise<Socket>;

  constructor() {
    this.socket = new Promise((resolve, reject) => {
      console.info("Connecting socket.io...");
      const socket = io(window.location.host, { path: "/io/" });

      socket.on("connect", function () {
        console.info("Socket.io is connected");
        resolve(socket);
      });

      socket.on("exception", function (err) {
        console.error(err);
        reject(err);
      });

      socket.on("disconnect", function () {
        console.info("Socket.io is disconnected");
      });
    });
  }

  fetch = async <R>(
    event: string,
    payload: Uint8Array,
    fromBinary: (data: Uint8Array) => R,
  ): Promise<R> => {
    const socket = await this.socket;
    const bytes = payload.buffer.slice(
      payload.byteOffset,
      payload.byteLength + payload.byteOffset,
    );
    return new Promise((resolve) => {
      socket.emit(event, bytes, async (resp: ArrayBuffer) => {
        try {
          resolve(fromBinary(new Uint8Array(resp)));
        } catch (e) {
          console.error(e);
        }
      });
    });
  };

  emit = async (event: string, payload: Uint8Array): Promise<void> => {
    const socket = await this.socket;
    const bytes = payload.buffer.slice(
      payload.byteOffset,
      payload.byteLength + payload.byteOffset,
    );
    return new Promise((resolve) => {
      socket.emit(event, bytes, () => {
        resolve();
      });
    });
  };

  on = async (
    event: string,
    callback: (message: string) => void,
  ): Promise<void> => {
    const socket = await this.socket;
    socket.on(event, callback);
  };

  off = async (event: string): Promise<void> => {
    const socket = await this.socket;
    socket.off(event);
  };
}
