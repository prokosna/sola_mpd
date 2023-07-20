/* eslint-disable */
import _m0 from "protobufjs/minimal";
import {
  SongMetadataTag,
  songMetadataTagFromJSON,
  songMetadataTagToJSON,
  songMetadataTagToNumber,
  SongMetadataValue,
} from "./song";

export const protobufPackage = "";

export interface BrowserFilter {
  tag: SongMetadataTag;
  selectedValues: SongMetadataValue[];
  order: number;
  selectedOrder: number;
}

export interface BrowserState {
  filters: BrowserFilter[];
}

function createBaseBrowserFilter(): BrowserFilter {
  return { tag: SongMetadataTag.UNKNOWN, selectedValues: [], order: 0, selectedOrder: 0 };
}

export const BrowserFilter = {
  encode(message: BrowserFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tag !== SongMetadataTag.UNKNOWN) {
      writer.uint32(8).int32(songMetadataTagToNumber(message.tag));
    }
    for (const v of message.selectedValues) {
      SongMetadataValue.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.order !== 0) {
      writer.uint32(24).int32(message.order);
    }
    if (message.selectedOrder !== 0) {
      writer.uint32(32).int32(message.selectedOrder);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BrowserFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBrowserFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.tag = songMetadataTagFromJSON(reader.int32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.selectedValues.push(SongMetadataValue.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.order = reader.int32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.selectedOrder = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BrowserFilter {
    return {
      tag: isSet(object.tag) ? songMetadataTagFromJSON(object.tag) : SongMetadataTag.UNKNOWN,
      selectedValues: Array.isArray(object?.selectedValues)
        ? object.selectedValues.map((e: any) => SongMetadataValue.fromJSON(e))
        : [],
      order: isSet(object.order) ? Number(object.order) : 0,
      selectedOrder: isSet(object.selectedOrder) ? Number(object.selectedOrder) : 0,
    };
  },

  toJSON(message: BrowserFilter): unknown {
    const obj: any = {};
    if (message.tag !== SongMetadataTag.UNKNOWN) {
      obj.tag = songMetadataTagToJSON(message.tag);
    }
    if (message.selectedValues?.length) {
      obj.selectedValues = message.selectedValues.map((e) => SongMetadataValue.toJSON(e));
    }
    if (message.order !== 0) {
      obj.order = Math.round(message.order);
    }
    if (message.selectedOrder !== 0) {
      obj.selectedOrder = Math.round(message.selectedOrder);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<BrowserFilter>, I>>(base?: I): BrowserFilter {
    return BrowserFilter.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BrowserFilter>, I>>(object: I): BrowserFilter {
    const message = createBaseBrowserFilter();
    message.tag = object.tag ?? SongMetadataTag.UNKNOWN;
    message.selectedValues = object.selectedValues?.map((e) => SongMetadataValue.fromPartial(e)) || [];
    message.order = object.order ?? 0;
    message.selectedOrder = object.selectedOrder ?? 0;
    return message;
  },
};

function createBaseBrowserState(): BrowserState {
  return { filters: [] };
}

export const BrowserState = {
  encode(message: BrowserState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.filters) {
      BrowserFilter.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BrowserState {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBrowserState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.filters.push(BrowserFilter.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BrowserState {
    return { filters: Array.isArray(object?.filters) ? object.filters.map((e: any) => BrowserFilter.fromJSON(e)) : [] };
  },

  toJSON(message: BrowserState): unknown {
    const obj: any = {};
    if (message.filters?.length) {
      obj.filters = message.filters.map((e) => BrowserFilter.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<BrowserState>, I>>(base?: I): BrowserState {
    return BrowserState.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BrowserState>, I>>(object: I): BrowserState {
    const message = createBaseBrowserState();
    message.filters = object.filters?.map((e) => BrowserFilter.fromPartial(e)) || [];
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
