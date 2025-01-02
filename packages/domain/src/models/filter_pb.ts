// @generated by protoc-gen-es v1.10.0 with parameter "target=ts"
// @generated from file filter.proto (syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";
import { Song_MetadataTag, Song_MetadataValue } from "./song_pb.js";

/**
 * @generated from message FilterCondition
 */
export class FilterCondition extends Message<FilterCondition> {
  /**
   * @generated from field: string uuid = 1;
   */
  uuid = "";

  /**
   * @generated from field: Song.MetadataTag tag = 2;
   */
  tag = Song_MetadataTag.UNKNOWN;

  /**
   * @generated from field: Song.MetadataValue value = 3;
   */
  value?: Song_MetadataValue;

  /**
   * @generated from field: FilterCondition.Operator operator = 4;
   */
  operator = FilterCondition_Operator.UNKNOWN;

  constructor(data?: PartialMessage<FilterCondition>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "FilterCondition";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "uuid", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "tag", kind: "enum", T: proto3.getEnumType(Song_MetadataTag) },
    { no: 3, name: "value", kind: "message", T: Song_MetadataValue },
    { no: 4, name: "operator", kind: "enum", T: proto3.getEnumType(FilterCondition_Operator) },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): FilterCondition {
    return new FilterCondition().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): FilterCondition {
    return new FilterCondition().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): FilterCondition {
    return new FilterCondition().fromJsonString(jsonString, options);
  }

  static equals(a: FilterCondition | PlainMessage<FilterCondition> | undefined, b: FilterCondition | PlainMessage<FilterCondition> | undefined): boolean {
    return proto3.util.equals(FilterCondition, a, b);
  }
}

/**
 * @generated from enum FilterCondition.Operator
 */
export enum FilterCondition_Operator {
  /**
   * @generated from enum value: UNKNOWN = 0;
   */
  UNKNOWN = 0,

  /**
   * @generated from enum value: EQUAL = 1;
   */
  EQUAL = 1,

  /**
   * @generated from enum value: NOT_EQUAL = 2;
   */
  NOT_EQUAL = 2,

  /**
   * @generated from enum value: CONTAIN = 3;
   */
  CONTAIN = 3,

  /**
   * @generated from enum value: NOT_CONTAIN = 4;
   */
  NOT_CONTAIN = 4,

  /**
   * @generated from enum value: REGEX = 5;
   */
  REGEX = 5,

  /**
   * Following operators are not supported by MPD
   * Need filtering on the client side.
   *
   * @generated from enum value: LESS_THAN = 6;
   */
  LESS_THAN = 6,

  /**
   * @generated from enum value: LESS_THAN_OR_EQUAL = 7;
   */
  LESS_THAN_OR_EQUAL = 7,

  /**
   * @generated from enum value: GREATER_THAN = 8;
   */
  GREATER_THAN = 8,

  /**
   * @generated from enum value: GREATER_THAN_OR_EQUAL = 9;
   */
  GREATER_THAN_OR_EQUAL = 9,
}
// Retrieve enum metadata with: proto3.getEnumType(FilterCondition_Operator)
proto3.util.setEnumType(FilterCondition_Operator, "FilterCondition.Operator", [
  { no: 0, name: "UNKNOWN" },
  { no: 1, name: "EQUAL" },
  { no: 2, name: "NOT_EQUAL" },
  { no: 3, name: "CONTAIN" },
  { no: 4, name: "NOT_CONTAIN" },
  { no: 5, name: "REGEX" },
  { no: 6, name: "LESS_THAN" },
  { no: 7, name: "LESS_THAN_OR_EQUAL" },
  { no: 8, name: "GREATER_THAN" },
  { no: 9, name: "GREATER_THAN_OR_EQUAL" },
]);

