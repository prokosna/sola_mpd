/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "";

export interface MpdOutputDevice {
  id: number;
  name: string;
  plugin: string;
  isEnabled: boolean;
}

function createBaseMpdOutputDevice(): MpdOutputDevice {
  return { id: 0, name: "", plugin: "", isEnabled: false };
}

export const MpdOutputDevice = {
  encode(message: MpdOutputDevice, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.plugin !== "") {
      writer.uint32(26).string(message.plugin);
    }
    if (message.isEnabled === true) {
      writer.uint32(32).bool(message.isEnabled);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdOutputDevice {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdOutputDevice();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.plugin = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.isEnabled = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdOutputDevice {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      name: isSet(object.name) ? String(object.name) : "",
      plugin: isSet(object.plugin) ? String(object.plugin) : "",
      isEnabled: isSet(object.isEnabled) ? Boolean(object.isEnabled) : false,
    };
  },

  toJSON(message: MpdOutputDevice): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.name !== undefined && (obj.name = message.name);
    message.plugin !== undefined && (obj.plugin = message.plugin);
    message.isEnabled !== undefined && (obj.isEnabled = message.isEnabled);
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdOutputDevice>, I>>(base?: I): MpdOutputDevice {
    return MpdOutputDevice.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdOutputDevice>, I>>(object: I): MpdOutputDevice {
    const message = createBaseMpdOutputDevice();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.plugin = object.plugin ?? "";
    message.isEnabled = object.isEnabled ?? false;
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
