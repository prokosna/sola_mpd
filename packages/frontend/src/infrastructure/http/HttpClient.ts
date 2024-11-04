export interface HttpClient {
  get: <R>(
    endpoint: string,
    fromBinary: (bytes: Uint8Array) => R,
  ) => Promise<R>;

  post: (endpoint: string, payload: Uint8Array) => Promise<void>;

  put: <R>(
    endpoint: string,
    payload: Uint8Array,
    fromBinary: (bytes: Uint8Array) => R,
  ) => Promise<R>;
}
