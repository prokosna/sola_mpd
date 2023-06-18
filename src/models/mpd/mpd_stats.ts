/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Timestamp } from "../google/protobuf/timestamp";

export const protobufPackage = "";

export interface MpdStats {
  version: string;
  artistsCount: number;
  albumsCount: number;
  songsCount: number;
  uptime: number;
  totalPlaytime: number;
  lastUpdated: Date | undefined;
  playtime: number;
}

function createBaseMpdStats(): MpdStats {
  return {
    version: "",
    artistsCount: 0,
    albumsCount: 0,
    songsCount: 0,
    uptime: 0,
    totalPlaytime: 0,
    lastUpdated: undefined,
    playtime: 0,
  };
}

export const MpdStats = {
  encode(message: MpdStats, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.version !== "") {
      writer.uint32(10).string(message.version);
    }
    if (message.artistsCount !== 0) {
      writer.uint32(16).int32(message.artistsCount);
    }
    if (message.albumsCount !== 0) {
      writer.uint32(24).int32(message.albumsCount);
    }
    if (message.songsCount !== 0) {
      writer.uint32(32).int32(message.songsCount);
    }
    if (message.uptime !== 0) {
      writer.uint32(40).int32(message.uptime);
    }
    if (message.totalPlaytime !== 0) {
      writer.uint32(48).int32(message.totalPlaytime);
    }
    if (message.lastUpdated !== undefined) {
      Timestamp.encode(toTimestamp(message.lastUpdated), writer.uint32(58).fork()).ldelim();
    }
    if (message.playtime !== 0) {
      writer.uint32(64).int32(message.playtime);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdStats {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdStats();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.version = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.artistsCount = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.albumsCount = reader.int32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.songsCount = reader.int32();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.uptime = reader.int32();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.totalPlaytime = reader.int32();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.lastUpdated = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.playtime = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdStats {
    return {
      version: isSet(object.version) ? String(object.version) : "",
      artistsCount: isSet(object.artistsCount) ? Number(object.artistsCount) : 0,
      albumsCount: isSet(object.albumsCount) ? Number(object.albumsCount) : 0,
      songsCount: isSet(object.songsCount) ? Number(object.songsCount) : 0,
      uptime: isSet(object.uptime) ? Number(object.uptime) : 0,
      totalPlaytime: isSet(object.totalPlaytime) ? Number(object.totalPlaytime) : 0,
      lastUpdated: isSet(object.lastUpdated) ? fromJsonTimestamp(object.lastUpdated) : undefined,
      playtime: isSet(object.playtime) ? Number(object.playtime) : 0,
    };
  },

  toJSON(message: MpdStats): unknown {
    const obj: any = {};
    message.version !== undefined && (obj.version = message.version);
    message.artistsCount !== undefined && (obj.artistsCount = Math.round(message.artistsCount));
    message.albumsCount !== undefined && (obj.albumsCount = Math.round(message.albumsCount));
    message.songsCount !== undefined && (obj.songsCount = Math.round(message.songsCount));
    message.uptime !== undefined && (obj.uptime = Math.round(message.uptime));
    message.totalPlaytime !== undefined && (obj.totalPlaytime = Math.round(message.totalPlaytime));
    message.lastUpdated !== undefined && (obj.lastUpdated = message.lastUpdated.toISOString());
    message.playtime !== undefined && (obj.playtime = Math.round(message.playtime));
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdStats>, I>>(base?: I): MpdStats {
    return MpdStats.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdStats>, I>>(object: I): MpdStats {
    const message = createBaseMpdStats();
    message.version = object.version ?? "";
    message.artistsCount = object.artistsCount ?? 0;
    message.albumsCount = object.albumsCount ?? 0;
    message.songsCount = object.songsCount ?? 0;
    message.uptime = object.uptime ?? 0;
    message.totalPlaytime = object.totalPlaytime ?? 0;
    message.lastUpdated = object.lastUpdated ?? undefined;
    message.playtime = object.playtime ?? 0;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function toTimestamp(date: Date): Timestamp {
  const seconds = date.getTime() / 1_000;
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = (t.seconds || 0) * 1_000;
  millis += (t.nanos || 0) / 1_000_000;
  return new Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof Date) {
    return o;
  } else if (typeof o === "string") {
    return new Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
