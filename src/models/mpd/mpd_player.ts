/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { FloatValue, Int32Value } from "../google/protobuf/wrappers";
import { AudioFormat } from "../song";

export const protobufPackage = "";

export interface MpdPlayerStatus {
  isRepeat: boolean;
  isRandom: boolean;
  isSingle: boolean;
  isConsume: boolean;
  playQueueLength: number;
  playbackState: MpdPlayerStatusPlaybackState;
  song: number;
  songId: number;
  nextSong: number;
  nextSongId: number;
  elapsed: number | undefined;
  duration: number | undefined;
  bitrate: number | undefined;
  audioFormat: AudioFormat | undefined;
  isDatabaseUpdating: boolean;
}

export enum MpdPlayerStatusPlaybackState {
  UNKNOWN = "UNKNOWN",
  PLAY = "PLAY",
  STOP = "STOP",
  PAUSE = "PAUSE",
}

export function mpdPlayerStatusPlaybackStateFromJSON(object: any): MpdPlayerStatusPlaybackState {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return MpdPlayerStatusPlaybackState.UNKNOWN;
    case 1:
    case "PLAY":
      return MpdPlayerStatusPlaybackState.PLAY;
    case 2:
    case "STOP":
      return MpdPlayerStatusPlaybackState.STOP;
    case 3:
    case "PAUSE":
      return MpdPlayerStatusPlaybackState.PAUSE;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum MpdPlayerStatusPlaybackState");
  }
}

export function mpdPlayerStatusPlaybackStateToJSON(object: MpdPlayerStatusPlaybackState): string {
  switch (object) {
    case MpdPlayerStatusPlaybackState.UNKNOWN:
      return "UNKNOWN";
    case MpdPlayerStatusPlaybackState.PLAY:
      return "PLAY";
    case MpdPlayerStatusPlaybackState.STOP:
      return "STOP";
    case MpdPlayerStatusPlaybackState.PAUSE:
      return "PAUSE";
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum MpdPlayerStatusPlaybackState");
  }
}

export function mpdPlayerStatusPlaybackStateToNumber(object: MpdPlayerStatusPlaybackState): number {
  switch (object) {
    case MpdPlayerStatusPlaybackState.UNKNOWN:
      return 0;
    case MpdPlayerStatusPlaybackState.PLAY:
      return 1;
    case MpdPlayerStatusPlaybackState.STOP:
      return 2;
    case MpdPlayerStatusPlaybackState.PAUSE:
      return 3;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum MpdPlayerStatusPlaybackState");
  }
}

export interface MpdPlayerVolume {
  volume: number | undefined;
}

function createBaseMpdPlayerStatus(): MpdPlayerStatus {
  return {
    isRepeat: false,
    isRandom: false,
    isSingle: false,
    isConsume: false,
    playQueueLength: 0,
    playbackState: MpdPlayerStatusPlaybackState.UNKNOWN,
    song: 0,
    songId: 0,
    nextSong: 0,
    nextSongId: 0,
    elapsed: undefined,
    duration: undefined,
    bitrate: undefined,
    audioFormat: undefined,
    isDatabaseUpdating: false,
  };
}

export const MpdPlayerStatus = {
  encode(message: MpdPlayerStatus, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.isRepeat === true) {
      writer.uint32(8).bool(message.isRepeat);
    }
    if (message.isRandom === true) {
      writer.uint32(16).bool(message.isRandom);
    }
    if (message.isSingle === true) {
      writer.uint32(24).bool(message.isSingle);
    }
    if (message.isConsume === true) {
      writer.uint32(32).bool(message.isConsume);
    }
    if (message.playQueueLength !== 0) {
      writer.uint32(40).int32(message.playQueueLength);
    }
    if (message.playbackState !== MpdPlayerStatusPlaybackState.UNKNOWN) {
      writer.uint32(48).int32(mpdPlayerStatusPlaybackStateToNumber(message.playbackState));
    }
    if (message.song !== 0) {
      writer.uint32(56).int32(message.song);
    }
    if (message.songId !== 0) {
      writer.uint32(64).int32(message.songId);
    }
    if (message.nextSong !== 0) {
      writer.uint32(72).int32(message.nextSong);
    }
    if (message.nextSongId !== 0) {
      writer.uint32(80).int32(message.nextSongId);
    }
    if (message.elapsed !== undefined) {
      FloatValue.encode({ value: message.elapsed! }, writer.uint32(90).fork()).ldelim();
    }
    if (message.duration !== undefined) {
      FloatValue.encode({ value: message.duration! }, writer.uint32(98).fork()).ldelim();
    }
    if (message.bitrate !== undefined) {
      Int32Value.encode({ value: message.bitrate! }, writer.uint32(106).fork()).ldelim();
    }
    if (message.audioFormat !== undefined) {
      AudioFormat.encode(message.audioFormat, writer.uint32(114).fork()).ldelim();
    }
    if (message.isDatabaseUpdating === true) {
      writer.uint32(128).bool(message.isDatabaseUpdating);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdPlayerStatus {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdPlayerStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.isRepeat = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.isRandom = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.isSingle = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.isConsume = reader.bool();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.playQueueLength = reader.int32();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.playbackState = mpdPlayerStatusPlaybackStateFromJSON(reader.int32());
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.song = reader.int32();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.songId = reader.int32();
          continue;
        case 9:
          if (tag !== 72) {
            break;
          }

          message.nextSong = reader.int32();
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.nextSongId = reader.int32();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.elapsed = FloatValue.decode(reader, reader.uint32()).value;
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.duration = FloatValue.decode(reader, reader.uint32()).value;
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.bitrate = Int32Value.decode(reader, reader.uint32()).value;
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.audioFormat = AudioFormat.decode(reader, reader.uint32());
          continue;
        case 16:
          if (tag !== 128) {
            break;
          }

          message.isDatabaseUpdating = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdPlayerStatus {
    return {
      isRepeat: isSet(object.isRepeat) ? Boolean(object.isRepeat) : false,
      isRandom: isSet(object.isRandom) ? Boolean(object.isRandom) : false,
      isSingle: isSet(object.isSingle) ? Boolean(object.isSingle) : false,
      isConsume: isSet(object.isConsume) ? Boolean(object.isConsume) : false,
      playQueueLength: isSet(object.playQueueLength) ? Number(object.playQueueLength) : 0,
      playbackState: isSet(object.playbackState)
        ? mpdPlayerStatusPlaybackStateFromJSON(object.playbackState)
        : MpdPlayerStatusPlaybackState.UNKNOWN,
      song: isSet(object.song) ? Number(object.song) : 0,
      songId: isSet(object.songId) ? Number(object.songId) : 0,
      nextSong: isSet(object.nextSong) ? Number(object.nextSong) : 0,
      nextSongId: isSet(object.nextSongId) ? Number(object.nextSongId) : 0,
      elapsed: isSet(object.elapsed) ? Number(object.elapsed) : undefined,
      duration: isSet(object.duration) ? Number(object.duration) : undefined,
      bitrate: isSet(object.bitrate) ? Number(object.bitrate) : undefined,
      audioFormat: isSet(object.audioFormat) ? AudioFormat.fromJSON(object.audioFormat) : undefined,
      isDatabaseUpdating: isSet(object.isDatabaseUpdating) ? Boolean(object.isDatabaseUpdating) : false,
    };
  },

  toJSON(message: MpdPlayerStatus): unknown {
    const obj: any = {};
    message.isRepeat !== undefined && (obj.isRepeat = message.isRepeat);
    message.isRandom !== undefined && (obj.isRandom = message.isRandom);
    message.isSingle !== undefined && (obj.isSingle = message.isSingle);
    message.isConsume !== undefined && (obj.isConsume = message.isConsume);
    message.playQueueLength !== undefined && (obj.playQueueLength = Math.round(message.playQueueLength));
    message.playbackState !== undefined &&
      (obj.playbackState = mpdPlayerStatusPlaybackStateToJSON(message.playbackState));
    message.song !== undefined && (obj.song = Math.round(message.song));
    message.songId !== undefined && (obj.songId = Math.round(message.songId));
    message.nextSong !== undefined && (obj.nextSong = Math.round(message.nextSong));
    message.nextSongId !== undefined && (obj.nextSongId = Math.round(message.nextSongId));
    message.elapsed !== undefined && (obj.elapsed = message.elapsed);
    message.duration !== undefined && (obj.duration = message.duration);
    message.bitrate !== undefined && (obj.bitrate = message.bitrate);
    message.audioFormat !== undefined &&
      (obj.audioFormat = message.audioFormat ? AudioFormat.toJSON(message.audioFormat) : undefined);
    message.isDatabaseUpdating !== undefined && (obj.isDatabaseUpdating = message.isDatabaseUpdating);
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdPlayerStatus>, I>>(base?: I): MpdPlayerStatus {
    return MpdPlayerStatus.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdPlayerStatus>, I>>(object: I): MpdPlayerStatus {
    const message = createBaseMpdPlayerStatus();
    message.isRepeat = object.isRepeat ?? false;
    message.isRandom = object.isRandom ?? false;
    message.isSingle = object.isSingle ?? false;
    message.isConsume = object.isConsume ?? false;
    message.playQueueLength = object.playQueueLength ?? 0;
    message.playbackState = object.playbackState ?? MpdPlayerStatusPlaybackState.UNKNOWN;
    message.song = object.song ?? 0;
    message.songId = object.songId ?? 0;
    message.nextSong = object.nextSong ?? 0;
    message.nextSongId = object.nextSongId ?? 0;
    message.elapsed = object.elapsed ?? undefined;
    message.duration = object.duration ?? undefined;
    message.bitrate = object.bitrate ?? undefined;
    message.audioFormat = (object.audioFormat !== undefined && object.audioFormat !== null)
      ? AudioFormat.fromPartial(object.audioFormat)
      : undefined;
    message.isDatabaseUpdating = object.isDatabaseUpdating ?? false;
    return message;
  },
};

function createBaseMpdPlayerVolume(): MpdPlayerVolume {
  return { volume: undefined };
}

export const MpdPlayerVolume = {
  encode(message: MpdPlayerVolume, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.volume !== undefined) {
      Int32Value.encode({ value: message.volume! }, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdPlayerVolume {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdPlayerVolume();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.volume = Int32Value.decode(reader, reader.uint32()).value;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdPlayerVolume {
    return { volume: isSet(object.volume) ? Number(object.volume) : undefined };
  },

  toJSON(message: MpdPlayerVolume): unknown {
    const obj: any = {};
    message.volume !== undefined && (obj.volume = message.volume);
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdPlayerVolume>, I>>(base?: I): MpdPlayerVolume {
    return MpdPlayerVolume.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdPlayerVolume>, I>>(object: I): MpdPlayerVolume {
    const message = createBaseMpdPlayerVolume();
    message.volume = object.volume ?? undefined;
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
