import { Socket } from "socket.io-client";

export class SocketIoClientUtils {
  static async fetch<R>(
    socket: Socket,
    event: string,
    payload: Uint8Array,
    fromBinary: (data: Uint8Array) => R,
  ): Promise<R> {
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
  }

  static async emit(
    socket: Socket,
    event: string,
    payload: Uint8Array,
  ): Promise<void> {
    const bytes = payload.buffer.slice(
      payload.byteOffset,
      payload.byteLength + payload.byteOffset,
    );
    return new Promise((resolve) => {
      socket.emit(event, bytes, () => {
        resolve();
      });
    });
  }
}
