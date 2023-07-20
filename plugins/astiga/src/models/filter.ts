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

export interface FilterCondition {
  uuid: string;
  tag: SongMetadataTag;
  value: SongMetadataValue | undefined;
  operator: FilterConditionOperator;
}

export enum FilterConditionOperator {
  UNKNOWN = "UNKNOWN",
  EQUAL = "EQUAL",
  NOT_EQUAL = "NOT_EQUAL",
  CONTAIN = "CONTAIN",
  NOT_CONTAIN = "NOT_CONTAIN",
  REGEX = "REGEX",
  /**
   * LESS_THAN - Following operators are not supported by MPD
   * Need filtering on the client side.
   */
  LESS_THAN = "LESS_THAN",
  LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
  GREATER_THAN = "GREATER_THAN",
  GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
}

export function filterConditionOperatorFromJSON(object: any): FilterConditionOperator {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return FilterConditionOperator.UNKNOWN;
    case 1:
    case "EQUAL":
      return FilterConditionOperator.EQUAL;
    case 2:
    case "NOT_EQUAL":
      return FilterConditionOperator.NOT_EQUAL;
    case 3:
    case "CONTAIN":
      return FilterConditionOperator.CONTAIN;
    case 4:
    case "NOT_CONTAIN":
      return FilterConditionOperator.NOT_CONTAIN;
    case 5:
    case "REGEX":
      return FilterConditionOperator.REGEX;
    case 6:
    case "LESS_THAN":
      return FilterConditionOperator.LESS_THAN;
    case 7:
    case "LESS_THAN_OR_EQUAL":
      return FilterConditionOperator.LESS_THAN_OR_EQUAL;
    case 8:
    case "GREATER_THAN":
      return FilterConditionOperator.GREATER_THAN;
    case 9:
    case "GREATER_THAN_OR_EQUAL":
      return FilterConditionOperator.GREATER_THAN_OR_EQUAL;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum FilterConditionOperator");
  }
}

export function filterConditionOperatorToJSON(object: FilterConditionOperator): string {
  switch (object) {
    case FilterConditionOperator.UNKNOWN:
      return "UNKNOWN";
    case FilterConditionOperator.EQUAL:
      return "EQUAL";
    case FilterConditionOperator.NOT_EQUAL:
      return "NOT_EQUAL";
    case FilterConditionOperator.CONTAIN:
      return "CONTAIN";
    case FilterConditionOperator.NOT_CONTAIN:
      return "NOT_CONTAIN";
    case FilterConditionOperator.REGEX:
      return "REGEX";
    case FilterConditionOperator.LESS_THAN:
      return "LESS_THAN";
    case FilterConditionOperator.LESS_THAN_OR_EQUAL:
      return "LESS_THAN_OR_EQUAL";
    case FilterConditionOperator.GREATER_THAN:
      return "GREATER_THAN";
    case FilterConditionOperator.GREATER_THAN_OR_EQUAL:
      return "GREATER_THAN_OR_EQUAL";
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum FilterConditionOperator");
  }
}

export function filterConditionOperatorToNumber(object: FilterConditionOperator): number {
  switch (object) {
    case FilterConditionOperator.UNKNOWN:
      return 0;
    case FilterConditionOperator.EQUAL:
      return 1;
    case FilterConditionOperator.NOT_EQUAL:
      return 2;
    case FilterConditionOperator.CONTAIN:
      return 3;
    case FilterConditionOperator.NOT_CONTAIN:
      return 4;
    case FilterConditionOperator.REGEX:
      return 5;
    case FilterConditionOperator.LESS_THAN:
      return 6;
    case FilterConditionOperator.LESS_THAN_OR_EQUAL:
      return 7;
    case FilterConditionOperator.GREATER_THAN:
      return 8;
    case FilterConditionOperator.GREATER_THAN_OR_EQUAL:
      return 9;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum FilterConditionOperator");
  }
}

export const _PACKAGE_NAME = "";

function createBaseFilterCondition(): FilterCondition {
  return { uuid: "", tag: SongMetadataTag.UNKNOWN, value: undefined, operator: FilterConditionOperator.UNKNOWN };
}

export const FilterCondition = {
  encode(message: FilterCondition, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.uuid !== "") {
      writer.uint32(10).string(message.uuid);
    }
    if (message.tag !== SongMetadataTag.UNKNOWN) {
      writer.uint32(16).int32(songMetadataTagToNumber(message.tag));
    }
    if (message.value !== undefined) {
      SongMetadataValue.encode(message.value, writer.uint32(26).fork()).ldelim();
    }
    if (message.operator !== FilterConditionOperator.UNKNOWN) {
      writer.uint32(32).int32(filterConditionOperatorToNumber(message.operator));
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FilterCondition {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFilterCondition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.uuid = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.tag = songMetadataTagFromJSON(reader.int32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.value = SongMetadataValue.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.operator = filterConditionOperatorFromJSON(reader.int32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FilterCondition {
    return {
      uuid: isSet(object.uuid) ? String(object.uuid) : "",
      tag: isSet(object.tag) ? songMetadataTagFromJSON(object.tag) : SongMetadataTag.UNKNOWN,
      value: isSet(object.value) ? SongMetadataValue.fromJSON(object.value) : undefined,
      operator: isSet(object.operator)
        ? filterConditionOperatorFromJSON(object.operator)
        : FilterConditionOperator.UNKNOWN,
    };
  },

  toJSON(message: FilterCondition): unknown {
    const obj: any = {};
    if (message.uuid !== "") {
      obj.uuid = message.uuid;
    }
    if (message.tag !== SongMetadataTag.UNKNOWN) {
      obj.tag = songMetadataTagToJSON(message.tag);
    }
    if (message.value !== undefined) {
      obj.value = SongMetadataValue.toJSON(message.value);
    }
    if (message.operator !== FilterConditionOperator.UNKNOWN) {
      obj.operator = filterConditionOperatorToJSON(message.operator);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<FilterCondition>, I>>(base?: I): FilterCondition {
    return FilterCondition.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<FilterCondition>, I>>(object: I): FilterCondition {
    const message = createBaseFilterCondition();
    message.uuid = object.uuid ?? "";
    message.tag = object.tag ?? SongMetadataTag.UNKNOWN;
    message.value = (object.value !== undefined && object.value !== null)
      ? SongMetadataValue.fromPartial(object.value)
      : undefined;
    message.operator = object.operator ?? FilterConditionOperator.UNKNOWN;
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
