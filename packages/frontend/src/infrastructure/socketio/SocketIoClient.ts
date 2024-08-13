export interface SocketIoClient {
  fetch: <R>(
    event: string,
    payload: Uint8Array,
    fromBinary: (data: Uint8Array) => R,
  ) => Promise<R>;

  emit: (event: string, payload: Uint8Array) => Promise<void>;
}
