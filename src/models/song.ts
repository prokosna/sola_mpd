/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Timestamp } from "./google/protobuf/timestamp";
import { FloatValue, Int32Value, StringValue } from "./google/protobuf/wrappers";

export const protobufPackage = "";

export interface AudioFormat {
  encoding: AudioFormatEncoding;
  samplingRate: number;
  bits: number;
  channels: number;
}

export enum AudioFormatEncoding {
  UNKNOWN = "UNKNOWN",
  PCM = "PCM",
  DSD = "DSD",
}

export function audioFormatEncodingFromJSON(object: any): AudioFormatEncoding {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return AudioFormatEncoding.UNKNOWN;
    case 1:
    case "PCM":
      return AudioFormatEncoding.PCM;
    case 2:
    case "DSD":
      return AudioFormatEncoding.DSD;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum AudioFormatEncoding");
  }
}

export function audioFormatEncodingToJSON(object: AudioFormatEncoding): string {
  switch (object) {
    case AudioFormatEncoding.UNKNOWN:
      return "UNKNOWN";
    case AudioFormatEncoding.PCM:
      return "PCM";
    case AudioFormatEncoding.DSD:
      return "DSD";
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum AudioFormatEncoding");
  }
}

export function audioFormatEncodingToNumber(object: AudioFormatEncoding): number {
  switch (object) {
    case AudioFormatEncoding.UNKNOWN:
      return 0;
    case AudioFormatEncoding.PCM:
      return 1;
    case AudioFormatEncoding.DSD:
      return 2;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum AudioFormatEncoding");
  }
}

export interface Song {
  path: string;
  metadata: { [key: string]: SongMetadataValue };
}

export enum SongMetadataTag {
  UNKNOWN = "UNKNOWN",
  TITLE = "TITLE",
  ARTIST = "ARTIST",
  ALBUM_ARTIST = "ALBUM_ARTIST",
  ALBUM = "ALBUM",
  GENRE = "GENRE",
  COMPOSER = "COMPOSER",
  TRACK = "TRACK",
  DISC = "DISC",
  DATE = "DATE",
  DURATION = "DURATION",
  FORMAT = "FORMAT",
  UPDATED_AT = "UPDATED_AT",
  ID = "ID",
  POSITION = "POSITION",
  COMMENT = "COMMENT",
  LABEL = "LABEL",
}

export function songMetadataTagFromJSON(object: any): SongMetadataTag {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return SongMetadataTag.UNKNOWN;
    case 1:
    case "TITLE":
      return SongMetadataTag.TITLE;
    case 2:
    case "ARTIST":
      return SongMetadataTag.ARTIST;
    case 3:
    case "ALBUM_ARTIST":
      return SongMetadataTag.ALBUM_ARTIST;
    case 4:
    case "ALBUM":
      return SongMetadataTag.ALBUM;
    case 5:
    case "GENRE":
      return SongMetadataTag.GENRE;
    case 6:
    case "COMPOSER":
      return SongMetadataTag.COMPOSER;
    case 7:
    case "TRACK":
      return SongMetadataTag.TRACK;
    case 8:
    case "DISC":
      return SongMetadataTag.DISC;
    case 9:
    case "DATE":
      return SongMetadataTag.DATE;
    case 10:
    case "DURATION":
      return SongMetadataTag.DURATION;
    case 11:
    case "FORMAT":
      return SongMetadataTag.FORMAT;
    case 12:
    case "UPDATED_AT":
      return SongMetadataTag.UPDATED_AT;
    case 13:
    case "ID":
      return SongMetadataTag.ID;
    case 14:
    case "POSITION":
      return SongMetadataTag.POSITION;
    case 15:
    case "COMMENT":
      return SongMetadataTag.COMMENT;
    case 16:
    case "LABEL":
      return SongMetadataTag.LABEL;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum SongMetadataTag");
  }
}

export function songMetadataTagToJSON(object: SongMetadataTag): string {
  switch (object) {
    case SongMetadataTag.UNKNOWN:
      return "UNKNOWN";
    case SongMetadataTag.TITLE:
      return "TITLE";
    case SongMetadataTag.ARTIST:
      return "ARTIST";
    case SongMetadataTag.ALBUM_ARTIST:
      return "ALBUM_ARTIST";
    case SongMetadataTag.ALBUM:
      return "ALBUM";
    case SongMetadataTag.GENRE:
      return "GENRE";
    case SongMetadataTag.COMPOSER:
      return "COMPOSER";
    case SongMetadataTag.TRACK:
      return "TRACK";
    case SongMetadataTag.DISC:
      return "DISC";
    case SongMetadataTag.DATE:
      return "DATE";
    case SongMetadataTag.DURATION:
      return "DURATION";
    case SongMetadataTag.FORMAT:
      return "FORMAT";
    case SongMetadataTag.UPDATED_AT:
      return "UPDATED_AT";
    case SongMetadataTag.ID:
      return "ID";
    case SongMetadataTag.POSITION:
      return "POSITION";
    case SongMetadataTag.COMMENT:
      return "COMMENT";
    case SongMetadataTag.LABEL:
      return "LABEL";
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum SongMetadataTag");
  }
}

export function songMetadataTagToNumber(object: SongMetadataTag): number {
  switch (object) {
    case SongMetadataTag.UNKNOWN:
      return 0;
    case SongMetadataTag.TITLE:
      return 1;
    case SongMetadataTag.ARTIST:
      return 2;
    case SongMetadataTag.ALBUM_ARTIST:
      return 3;
    case SongMetadataTag.ALBUM:
      return 4;
    case SongMetadataTag.GENRE:
      return 5;
    case SongMetadataTag.COMPOSER:
      return 6;
    case SongMetadataTag.TRACK:
      return 7;
    case SongMetadataTag.DISC:
      return 8;
    case SongMetadataTag.DATE:
      return 9;
    case SongMetadataTag.DURATION:
      return 10;
    case SongMetadataTag.FORMAT:
      return 11;
    case SongMetadataTag.UPDATED_AT:
      return 12;
    case SongMetadataTag.ID:
      return 13;
    case SongMetadataTag.POSITION:
      return 14;
    case SongMetadataTag.COMMENT:
      return 15;
    case SongMetadataTag.LABEL:
      return 16;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum SongMetadataTag");
  }
}

export interface SongMetadataEntry {
  key: string;
  value: SongMetadataValue | undefined;
}

export interface SongMetadataValue {
  value?:
    | { $case: "stringValue"; stringValue: string | undefined }
    | { $case: "intValue"; intValue: number | undefined }
    | { $case: "floatValue"; floatValue: number | undefined }
    | { $case: "format"; format: AudioFormat }
    | { $case: "timestamp"; timestamp: Date };
}

export interface SongList {
  songs: Song[];
}

function createBaseAudioFormat(): AudioFormat {
  return { encoding: AudioFormatEncoding.UNKNOWN, samplingRate: 0, bits: 0, channels: 0 };
}

export const AudioFormat = {
  encode(message: AudioFormat, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.encoding !== AudioFormatEncoding.UNKNOWN) {
      writer.uint32(8).int32(audioFormatEncodingToNumber(message.encoding));
    }
    if (message.samplingRate !== 0) {
      writer.uint32(16).uint32(message.samplingRate);
    }
    if (message.bits !== 0) {
      writer.uint32(24).uint32(message.bits);
    }
    if (message.channels !== 0) {
      writer.uint32(32).uint32(message.channels);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AudioFormat {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAudioFormat();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.encoding = audioFormatEncodingFromJSON(reader.int32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.samplingRate = reader.uint32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.bits = reader.uint32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.channels = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): AudioFormat {
    return {
      encoding: isSet(object.encoding) ? audioFormatEncodingFromJSON(object.encoding) : AudioFormatEncoding.UNKNOWN,
      samplingRate: isSet(object.samplingRate) ? Number(object.samplingRate) : 0,
      bits: isSet(object.bits) ? Number(object.bits) : 0,
      channels: isSet(object.channels) ? Number(object.channels) : 0,
    };
  },

  toJSON(message: AudioFormat): unknown {
    const obj: any = {};
    message.encoding !== undefined && (obj.encoding = audioFormatEncodingToJSON(message.encoding));
    message.samplingRate !== undefined && (obj.samplingRate = Math.round(message.samplingRate));
    message.bits !== undefined && (obj.bits = Math.round(message.bits));
    message.channels !== undefined && (obj.channels = Math.round(message.channels));
    return obj;
  },

  create<I extends Exact<DeepPartial<AudioFormat>, I>>(base?: I): AudioFormat {
    return AudioFormat.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<AudioFormat>, I>>(object: I): AudioFormat {
    const message = createBaseAudioFormat();
    message.encoding = object.encoding ?? AudioFormatEncoding.UNKNOWN;
    message.samplingRate = object.samplingRate ?? 0;
    message.bits = object.bits ?? 0;
    message.channels = object.channels ?? 0;
    return message;
  },
};

function createBaseSong(): Song {
  return { path: "", metadata: {} };
}

export const Song = {
  encode(message: Song, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.path !== "") {
      writer.uint32(10).string(message.path);
    }
    Object.entries(message.metadata).forEach(([key, value]) => {
      SongMetadataEntry.encode({ key: key as any, value }, writer.uint32(18).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Song {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSong();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.path = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          const entry2 = SongMetadataEntry.decode(reader, reader.uint32());
          if (entry2.value !== undefined) {
            message.metadata[entry2.key] = entry2.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Song {
    return {
      path: isSet(object.path) ? String(object.path) : "",
      metadata: isObject(object.metadata)
        ? Object.entries(object.metadata).reduce<{ [key: string]: SongMetadataValue }>((acc, [key, value]) => {
          acc[key] = SongMetadataValue.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: Song): unknown {
    const obj: any = {};
    message.path !== undefined && (obj.path = message.path);
    obj.metadata = {};
    if (message.metadata) {
      Object.entries(message.metadata).forEach(([k, v]) => {
        obj.metadata[k] = SongMetadataValue.toJSON(v);
      });
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Song>, I>>(base?: I): Song {
    return Song.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Song>, I>>(object: I): Song {
    const message = createBaseSong();
    message.path = object.path ?? "";
    message.metadata = Object.entries(object.metadata ?? {}).reduce<{ [key: string]: SongMetadataValue }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = SongMetadataValue.fromPartial(value);
        }
        return acc;
      },
      {},
    );
    return message;
  },
};

function createBaseSongMetadataEntry(): SongMetadataEntry {
  return { key: "", value: undefined };
}

export const SongMetadataEntry = {
  encode(message: SongMetadataEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      SongMetadataValue.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SongMetadataEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSongMetadataEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = SongMetadataValue.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SongMetadataEntry {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? SongMetadataValue.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: SongMetadataEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value ? SongMetadataValue.toJSON(message.value) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<SongMetadataEntry>, I>>(base?: I): SongMetadataEntry {
    return SongMetadataEntry.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<SongMetadataEntry>, I>>(object: I): SongMetadataEntry {
    const message = createBaseSongMetadataEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? SongMetadataValue.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseSongMetadataValue(): SongMetadataValue {
  return { value: undefined };
}

export const SongMetadataValue = {
  encode(message: SongMetadataValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    switch (message.value?.$case) {
      case "stringValue":
        StringValue.encode({ value: message.value.stringValue! }, writer.uint32(18).fork()).ldelim();
        break;
      case "intValue":
        Int32Value.encode({ value: message.value.intValue! }, writer.uint32(26).fork()).ldelim();
        break;
      case "floatValue":
        FloatValue.encode({ value: message.value.floatValue! }, writer.uint32(34).fork()).ldelim();
        break;
      case "format":
        AudioFormat.encode(message.value.format, writer.uint32(42).fork()).ldelim();
        break;
      case "timestamp":
        Timestamp.encode(toTimestamp(message.value.timestamp), writer.uint32(50).fork()).ldelim();
        break;
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SongMetadataValue {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSongMetadataValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = { $case: "stringValue", stringValue: StringValue.decode(reader, reader.uint32()).value };
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.value = { $case: "intValue", intValue: Int32Value.decode(reader, reader.uint32()).value };
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.value = { $case: "floatValue", floatValue: FloatValue.decode(reader, reader.uint32()).value };
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.value = { $case: "format", format: AudioFormat.decode(reader, reader.uint32()) };
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.value = { $case: "timestamp", timestamp: fromTimestamp(Timestamp.decode(reader, reader.uint32())) };
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SongMetadataValue {
    return {
      value: isSet(object.stringValue)
        ? { $case: "stringValue", stringValue: String(object.stringValue) }
        : isSet(object.intValue)
        ? { $case: "intValue", intValue: Number(object.intValue) }
        : isSet(object.floatValue)
        ? { $case: "floatValue", floatValue: Number(object.floatValue) }
        : isSet(object.format)
        ? { $case: "format", format: AudioFormat.fromJSON(object.format) }
        : isSet(object.timestamp)
        ? { $case: "timestamp", timestamp: fromJsonTimestamp(object.timestamp) }
        : undefined,
    };
  },

  toJSON(message: SongMetadataValue): unknown {
    const obj: any = {};
    message.value?.$case === "stringValue" && (obj.stringValue = message.value?.stringValue);
    message.value?.$case === "intValue" && (obj.intValue = message.value?.intValue);
    message.value?.$case === "floatValue" && (obj.floatValue = message.value?.floatValue);
    message.value?.$case === "format" &&
      (obj.format = message.value?.format ? AudioFormat.toJSON(message.value?.format) : undefined);
    message.value?.$case === "timestamp" && (obj.timestamp = message.value?.timestamp.toISOString());
    return obj;
  },

  create<I extends Exact<DeepPartial<SongMetadataValue>, I>>(base?: I): SongMetadataValue {
    return SongMetadataValue.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<SongMetadataValue>, I>>(object: I): SongMetadataValue {
    const message = createBaseSongMetadataValue();
    if (
      object.value?.$case === "stringValue" &&
      object.value?.stringValue !== undefined &&
      object.value?.stringValue !== null
    ) {
      message.value = { $case: "stringValue", stringValue: object.value.stringValue };
    }
    if (object.value?.$case === "intValue" && object.value?.intValue !== undefined && object.value?.intValue !== null) {
      message.value = { $case: "intValue", intValue: object.value.intValue };
    }
    if (
      object.value?.$case === "floatValue" &&
      object.value?.floatValue !== undefined &&
      object.value?.floatValue !== null
    ) {
      message.value = { $case: "floatValue", floatValue: object.value.floatValue };
    }
    if (object.value?.$case === "format" && object.value?.format !== undefined && object.value?.format !== null) {
      message.value = { $case: "format", format: AudioFormat.fromPartial(object.value.format) };
    }
    if (
      object.value?.$case === "timestamp" && object.value?.timestamp !== undefined && object.value?.timestamp !== null
    ) {
      message.value = { $case: "timestamp", timestamp: object.value.timestamp };
    }
    return message;
  },
};

function createBaseSongList(): SongList {
  return { songs: [] };
}

export const SongList = {
  encode(message: SongList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.songs) {
      Song.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SongList {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSongList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.songs.push(Song.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SongList {
    return { songs: Array.isArray(object?.songs) ? object.songs.map((e: any) => Song.fromJSON(e)) : [] };
  },

  toJSON(message: SongList): unknown {
    const obj: any = {};
    if (message.songs) {
      obj.songs = message.songs.map((e) => e ? Song.toJSON(e) : undefined);
    } else {
      obj.songs = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SongList>, I>>(base?: I): SongList {
    return SongList.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<SongList>, I>>(object: I): SongList {
    const message = createBaseSongList();
    message.songs = object.songs?.map((e) => Song.fromPartial(e)) || [];
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

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

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
