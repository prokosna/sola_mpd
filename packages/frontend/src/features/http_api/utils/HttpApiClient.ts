export class HttpApiClient {
  static async get<R>(
    endpoint: string,
    fromBinary: (bytes: Uint8Array) => R,
  ): Promise<R> {
    const ret = await fetch(endpoint);
    if (!ret.ok) {
      const body = await ret.text();
      throw new Error(`GET failed: ${body}`);
    }
    const body = await ret.arrayBuffer();
    return fromBinary(new Uint8Array(body));
  }

  static async post(endpoint: string, payload: Uint8Array): Promise<void> {
    const bytes = payload.buffer.slice(
      payload.byteOffset,
      payload.byteLength + payload.byteOffset,
    );
    const ret = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: bytes,
    });
    if (!ret.ok) {
      const body = await ret.text();
      throw new Error(`POST failed: ${body}`);
    }
    return;
  }

  static async put<R>(
    endpoint: string,
    payload: Uint8Array,
    fromBinary: (bytes: Uint8Array) => R,
  ): Promise<R> {
    const bytes = payload.buffer.slice(
      payload.byteOffset,
      payload.byteLength + payload.byteOffset,
    );
    const ret = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: bytes,
    });
    if (!ret.ok) {
      const body = await ret.text();
      throw new Error(`PUT failed: ${body}`);
    }
    const body = await ret.arrayBuffer();
    return fromBinary(new Uint8Array(body));
  }
}
