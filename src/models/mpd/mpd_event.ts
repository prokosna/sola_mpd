/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "";

export interface MpdEvent {
  eventType: MpdEventEventType;
}

export enum MpdEventEventType {
  UNKNOWN = "UNKNOWN",
  DATABASE = "DATABASE",
  PLAYLIST = "PLAYLIST",
  PLAY_QUEUE = "PLAY_QUEUE",
  MIXER = "MIXER",
  OPTIONS = "OPTIONS",
  PLAYER = "PLAYER",
  DISCONNECTED = "DISCONNECTED",
  UPDATE = "UPDATE",
}

export function mpdEventEventTypeFromJSON(object: any): MpdEventEventType {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return MpdEventEventType.UNKNOWN;
    case 1:
    case "DATABASE":
      return MpdEventEventType.DATABASE;
    case 2:
    case "PLAYLIST":
      return MpdEventEventType.PLAYLIST;
    case 3:
    case "PLAY_QUEUE":
      return MpdEventEventType.PLAY_QUEUE;
    case 4:
    case "MIXER":
      return MpdEventEventType.MIXER;
    case 5:
    case "OPTIONS":
      return MpdEventEventType.OPTIONS;
    case 6:
    case "PLAYER":
      return MpdEventEventType.PLAYER;
    case 7:
    case "DISCONNECTED":
      return MpdEventEventType.DISCONNECTED;
    case 8:
    case "UPDATE":
      return MpdEventEventType.UPDATE;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum MpdEventEventType");
  }
}

export function mpdEventEventTypeToJSON(object: MpdEventEventType): string {
  switch (object) {
    case MpdEventEventType.UNKNOWN:
      return "UNKNOWN";
    case MpdEventEventType.DATABASE:
      return "DATABASE";
    case MpdEventEventType.PLAYLIST:
      return "PLAYLIST";
    case MpdEventEventType.PLAY_QUEUE:
      return "PLAY_QUEUE";
    case MpdEventEventType.MIXER:
      return "MIXER";
    case MpdEventEventType.OPTIONS:
      return "OPTIONS";
    case MpdEventEventType.PLAYER:
      return "PLAYER";
    case MpdEventEventType.DISCONNECTED:
      return "DISCONNECTED";
    case MpdEventEventType.UPDATE:
      return "UPDATE";
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum MpdEventEventType");
  }
}

export function mpdEventEventTypeToNumber(object: MpdEventEventType): number {
  switch (object) {
    case MpdEventEventType.UNKNOWN:
      return 0;
    case MpdEventEventType.DATABASE:
      return 1;
    case MpdEventEventType.PLAYLIST:
      return 2;
    case MpdEventEventType.PLAY_QUEUE:
      return 3;
    case MpdEventEventType.MIXER:
      return 4;
    case MpdEventEventType.OPTIONS:
      return 5;
    case MpdEventEventType.PLAYER:
      return 6;
    case MpdEventEventType.DISCONNECTED:
      return 7;
    case MpdEventEventType.UPDATE:
      return 8;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum MpdEventEventType");
  }
}

function createBaseMpdEvent(): MpdEvent {
  return { eventType: MpdEventEventType.UNKNOWN };
}

export const MpdEvent = {
  encode(message: MpdEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.eventType !== MpdEventEventType.UNKNOWN) {
      writer.uint32(8).int32(mpdEventEventTypeToNumber(message.eventType));
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdEvent {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.eventType = mpdEventEventTypeFromJSON(reader.int32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdEvent {
    return {
      eventType: isSet(object.eventType) ? mpdEventEventTypeFromJSON(object.eventType) : MpdEventEventType.UNKNOWN,
    };
  },

  toJSON(message: MpdEvent): unknown {
    const obj: any = {};
    if (message.eventType !== MpdEventEventType.UNKNOWN) {
      obj.eventType = mpdEventEventTypeToJSON(message.eventType);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdEvent>, I>>(base?: I): MpdEvent {
    return MpdEvent.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdEvent>, I>>(object: I): MpdEvent {
    const message = createBaseMpdEvent();
    message.eventType = object.eventType ?? MpdEventEventType.UNKNOWN;
    return message;
  },
};

declare const self: any | undefined;
declare const window: any | undefined;
declare const global: any | undefined;
const tsProtoGlobalThis: any = (() => {
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
