/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "";

export interface MpdProfile {
  name: string;
  host: string;
  port: number;
}

export interface MpdProfileState {
  currentProfile: MpdProfile | undefined;
  profiles: MpdProfile[];
}

function createBaseMpdProfile(): MpdProfile {
  return { name: "", host: "", port: 0 };
}

export const MpdProfile = {
  encode(message: MpdProfile, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.host !== "") {
      writer.uint32(18).string(message.host);
    }
    if (message.port !== 0) {
      writer.uint32(24).uint32(message.port);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdProfile {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdProfile();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.host = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.port = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdProfile {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      host: isSet(object.host) ? String(object.host) : "",
      port: isSet(object.port) ? Number(object.port) : 0,
    };
  },

  toJSON(message: MpdProfile): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.host !== "") {
      obj.host = message.host;
    }
    if (message.port !== 0) {
      obj.port = Math.round(message.port);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdProfile>, I>>(base?: I): MpdProfile {
    return MpdProfile.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdProfile>, I>>(object: I): MpdProfile {
    const message = createBaseMpdProfile();
    message.name = object.name ?? "";
    message.host = object.host ?? "";
    message.port = object.port ?? 0;
    return message;
  },
};

function createBaseMpdProfileState(): MpdProfileState {
  return { currentProfile: undefined, profiles: [] };
}

export const MpdProfileState = {
  encode(message: MpdProfileState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.currentProfile !== undefined) {
      MpdProfile.encode(message.currentProfile, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.profiles) {
      MpdProfile.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdProfileState {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdProfileState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.currentProfile = MpdProfile.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.profiles.push(MpdProfile.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdProfileState {
    return {
      currentProfile: isSet(object.currentProfile) ? MpdProfile.fromJSON(object.currentProfile) : undefined,
      profiles: Array.isArray(object?.profiles) ? object.profiles.map((e: any) => MpdProfile.fromJSON(e)) : [],
    };
  },

  toJSON(message: MpdProfileState): unknown {
    const obj: any = {};
    if (message.currentProfile !== undefined) {
      obj.currentProfile = MpdProfile.toJSON(message.currentProfile);
    }
    if (message.profiles?.length) {
      obj.profiles = message.profiles.map((e) => MpdProfile.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdProfileState>, I>>(base?: I): MpdProfileState {
    return MpdProfileState.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdProfileState>, I>>(object: I): MpdProfileState {
    const message = createBaseMpdProfileState();
    message.currentProfile = (object.currentProfile !== undefined && object.currentProfile !== null)
      ? MpdProfile.fromPartial(object.currentProfile)
      : undefined;
    message.profiles = object.profiles?.map((e) => MpdProfile.fromPartial(e)) || [];
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
