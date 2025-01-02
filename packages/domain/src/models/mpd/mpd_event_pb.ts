// @generated by protoc-gen-es v1.10.0 with parameter "target=ts"
// @generated from file mpd/mpd_event.proto (syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from message MpdEvent
 */
export class MpdEvent extends Message<MpdEvent> {
  /**
   * @generated from field: MpdEvent.EventType event_type = 1;
   */
  eventType = MpdEvent_EventType.UNKNOWN;

  constructor(data?: PartialMessage<MpdEvent>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "MpdEvent";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "event_type", kind: "enum", T: proto3.getEnumType(MpdEvent_EventType) },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): MpdEvent {
    return new MpdEvent().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): MpdEvent {
    return new MpdEvent().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): MpdEvent {
    return new MpdEvent().fromJsonString(jsonString, options);
  }

  static equals(a: MpdEvent | PlainMessage<MpdEvent> | undefined, b: MpdEvent | PlainMessage<MpdEvent> | undefined): boolean {
    return proto3.util.equals(MpdEvent, a, b);
  }
}

/**
 * @generated from enum MpdEvent.EventType
 */
export enum MpdEvent_EventType {
  /**
   * @generated from enum value: UNKNOWN = 0;
   */
  UNKNOWN = 0,

  /**
   * @generated from enum value: DATABASE = 1;
   */
  DATABASE = 1,

  /**
   * @generated from enum value: PLAYLIST = 2;
   */
  PLAYLIST = 2,

  /**
   * @generated from enum value: PLAY_QUEUE = 3;
   */
  PLAY_QUEUE = 3,

  /**
   * @generated from enum value: MIXER = 4;
   */
  MIXER = 4,

  /**
   * @generated from enum value: OPTIONS = 5;
   */
  OPTIONS = 5,

  /**
   * @generated from enum value: PLAYER = 6;
   */
  PLAYER = 6,

  /**
   * @generated from enum value: DISCONNECTED = 7;
   */
  DISCONNECTED = 7,

  /**
   * @generated from enum value: UPDATE = 8;
   */
  UPDATE = 8,
}
// Retrieve enum metadata with: proto3.getEnumType(MpdEvent_EventType)
proto3.util.setEnumType(MpdEvent_EventType, "MpdEvent.EventType", [
  { no: 0, name: "UNKNOWN" },
  { no: 1, name: "DATABASE" },
  { no: 2, name: "PLAYLIST" },
  { no: 3, name: "PLAY_QUEUE" },
  { no: 4, name: "MIXER" },
  { no: 5, name: "OPTIONS" },
  { no: 6, name: "PLAYER" },
  { no: 7, name: "DISCONNECTED" },
  { no: 8, name: "UPDATE" },
]);

