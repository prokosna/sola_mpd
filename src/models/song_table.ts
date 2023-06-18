/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Int32Value } from "./google/protobuf/wrappers";
import { SongMetadataTag, songMetadataTagFromJSON, songMetadataTagToJSON, songMetadataTagToNumber } from "./song";

export const protobufPackage = "";

export interface SongTableColumn {
  tag: SongMetadataTag;
  sortOrder: number | undefined;
  isSortDesc: boolean;
  widthFlex: number;
}

export interface CommonSongTableState {
  columns: SongTableColumn[];
}

function createBaseSongTableColumn(): SongTableColumn {
  return { tag: SongMetadataTag.UNKNOWN, sortOrder: undefined, isSortDesc: false, widthFlex: 0 };
}

export const SongTableColumn = {
  encode(message: SongTableColumn, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tag !== SongMetadataTag.UNKNOWN) {
      writer.uint32(8).int32(songMetadataTagToNumber(message.tag));
    }
    if (message.sortOrder !== undefined) {
      Int32Value.encode({ value: message.sortOrder! }, writer.uint32(18).fork()).ldelim();
    }
    if (message.isSortDesc === true) {
      writer.uint32(24).bool(message.isSortDesc);
    }
    if (message.widthFlex !== 0) {
      writer.uint32(32).int32(message.widthFlex);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SongTableColumn {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSongTableColumn();
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

          message.sortOrder = Int32Value.decode(reader, reader.uint32()).value;
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.isSortDesc = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.widthFlex = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SongTableColumn {
    return {
      tag: isSet(object.tag) ? songMetadataTagFromJSON(object.tag) : SongMetadataTag.UNKNOWN,
      sortOrder: isSet(object.sortOrder) ? Number(object.sortOrder) : undefined,
      isSortDesc: isSet(object.isSortDesc) ? Boolean(object.isSortDesc) : false,
      widthFlex: isSet(object.widthFlex) ? Number(object.widthFlex) : 0,
    };
  },

  toJSON(message: SongTableColumn): unknown {
    const obj: any = {};
    message.tag !== undefined && (obj.tag = songMetadataTagToJSON(message.tag));
    message.sortOrder !== undefined && (obj.sortOrder = message.sortOrder);
    message.isSortDesc !== undefined && (obj.isSortDesc = message.isSortDesc);
    message.widthFlex !== undefined && (obj.widthFlex = Math.round(message.widthFlex));
    return obj;
  },

  create<I extends Exact<DeepPartial<SongTableColumn>, I>>(base?: I): SongTableColumn {
    return SongTableColumn.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<SongTableColumn>, I>>(object: I): SongTableColumn {
    const message = createBaseSongTableColumn();
    message.tag = object.tag ?? SongMetadataTag.UNKNOWN;
    message.sortOrder = object.sortOrder ?? undefined;
    message.isSortDesc = object.isSortDesc ?? false;
    message.widthFlex = object.widthFlex ?? 0;
    return message;
  },
};

function createBaseCommonSongTableState(): CommonSongTableState {
  return { columns: [] };
}

export const CommonSongTableState = {
  encode(message: CommonSongTableState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.columns) {
      SongTableColumn.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CommonSongTableState {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommonSongTableState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.columns.push(SongTableColumn.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CommonSongTableState {
    return {
      columns: Array.isArray(object?.columns) ? object.columns.map((e: any) => SongTableColumn.fromJSON(e)) : [],
    };
  },

  toJSON(message: CommonSongTableState): unknown {
    const obj: any = {};
    if (message.columns) {
      obj.columns = message.columns.map((e) => e ? SongTableColumn.toJSON(e) : undefined);
    } else {
      obj.columns = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CommonSongTableState>, I>>(base?: I): CommonSongTableState {
    return CommonSongTableState.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<CommonSongTableState>, I>>(object: I): CommonSongTableState {
    const message = createBaseCommonSongTableState();
    message.columns = object.columns?.map((e) => SongTableColumn.fromPartial(e)) || [];
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
