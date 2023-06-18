import { ProtoSerializable } from "@/types/serialization";

export class ApiUtils {
  static async get<R>(
    endpoint: string,
    resType: ProtoSerializable<R>
  ): Promise<R> {
    const ret = await fetch(endpoint);
    if (!ret.ok) {
      const body = await ret.text();
      throw new Error(`GET failed: ${body}`);
    }
    const body = await ret.arrayBuffer();
    return resType.decode(new Uint8Array(body));
  }

  static async post<T>(
    endpoint: string,
    reqType: ProtoSerializable<T>,
    payload: T
  ): Promise<void> {
    const bytes = reqType.encode(payload).finish();
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
}
