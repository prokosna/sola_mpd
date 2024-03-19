// @generated by protoc-gen-es v1.8.0 with parameter "target=ts"
// @generated from file plugin/plugin.proto (package sola, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";
import { Song } from "../song_pb.js";

/**
 * @generated from message sola.Plugin
 */
export class Plugin extends Message<Plugin> {
  /**
   * @generated from field: string host = 1;
   */
  host = "";

  /**
   * @generated from field: int32 port = 2;
   */
  port = 0;

  /**
   * @generated from field: sola.PluginInfo info = 3;
   */
  info?: PluginInfo;

  /**
   * @generated from field: map<string, string> plugin_parameters = 4;
   */
  pluginParameters: { [key: string]: string } = {};

  /**
   * @generated from field: bool is_available = 5;
   */
  isAvailable = false;

  constructor(data?: PartialMessage<Plugin>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "sola.Plugin";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "host", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "port", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 3, name: "info", kind: "message", T: PluginInfo },
    { no: 4, name: "plugin_parameters", kind: "map", K: 9 /* ScalarType.STRING */, V: {kind: "scalar", T: 9 /* ScalarType.STRING */} },
    { no: 5, name: "is_available", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Plugin {
    return new Plugin().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Plugin {
    return new Plugin().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Plugin {
    return new Plugin().fromJsonString(jsonString, options);
  }

  static equals(a: Plugin | PlainMessage<Plugin> | undefined, b: Plugin | PlainMessage<Plugin> | undefined): boolean {
    return proto3.util.equals(Plugin, a, b);
  }
}

/**
 * @generated from enum sola.Plugin.PluginType
 */
export enum Plugin_PluginType {
  /**
   * @generated from enum value: UNKNOWN = 0;
   */
  UNKNOWN = 0,

  /**
   * @generated from enum value: ON_PLAYLIST = 1;
   */
  ON_PLAYLIST = 1,

  /**
   * @generated from enum value: ON_SAVED_SEARCH = 2;
   */
  ON_SAVED_SEARCH = 2,

  /**
   * @generated from enum value: ON_PLAY_QUEUE = 3;
   */
  ON_PLAY_QUEUE = 3,

  /**
   * @generated from enum value: ON_FILE_EXPLORE = 4;
   */
  ON_FILE_EXPLORE = 4,

  /**
   * @generated from enum value: ON_BROWSER = 5;
   */
  ON_BROWSER = 5,
}
// Retrieve enum metadata with: proto3.getEnumType(Plugin_PluginType)
proto3.util.setEnumType(Plugin_PluginType, "sola.Plugin.PluginType", [
  { no: 0, name: "UNKNOWN" },
  { no: 1, name: "ON_PLAYLIST" },
  { no: 2, name: "ON_SAVED_SEARCH" },
  { no: 3, name: "ON_PLAY_QUEUE" },
  { no: 4, name: "ON_FILE_EXPLORE" },
  { no: 5, name: "ON_BROWSER" },
]);

/**
 * @generated from message sola.PluginInfo
 */
export class PluginInfo extends Message<PluginInfo> {
  /**
   * @generated from field: string name = 1;
   */
  name = "";

  /**
   * @generated from field: string version = 2;
   */
  version = "";

  /**
   * @generated from field: string description = 3;
   */
  description = "";

  /**
   * @generated from field: string context_menu_title = 4;
   */
  contextMenuTitle = "";

  /**
   * @generated from field: string context_menu_description = 5;
   */
  contextMenuDescription = "";

  /**
   * @generated from field: repeated sola.Plugin.PluginType supported_types = 6;
   */
  supportedTypes: Plugin_PluginType[] = [];

  /**
   * @generated from field: repeated string required_plugin_parameters = 7;
   */
  requiredPluginParameters: string[] = [];

  /**
   * @generated from field: repeated string required_request_parameters = 8;
   */
  requiredRequestParameters: string[] = [];

  constructor(data?: PartialMessage<PluginInfo>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "sola.PluginInfo";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "version", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "description", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 4, name: "context_menu_title", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 5, name: "context_menu_description", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 6, name: "supported_types", kind: "enum", T: proto3.getEnumType(Plugin_PluginType), repeated: true },
    { no: 7, name: "required_plugin_parameters", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
    { no: 8, name: "required_request_parameters", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PluginInfo {
    return new PluginInfo().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PluginInfo {
    return new PluginInfo().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PluginInfo {
    return new PluginInfo().fromJsonString(jsonString, options);
  }

  static equals(a: PluginInfo | PlainMessage<PluginInfo> | undefined, b: PluginInfo | PlainMessage<PluginInfo> | undefined): boolean {
    return proto3.util.equals(PluginInfo, a, b);
  }
}

/**
 * @generated from message sola.PluginState
 */
export class PluginState extends Message<PluginState> {
  /**
   * @generated from field: repeated sola.Plugin plugins = 1;
   */
  plugins: Plugin[] = [];

  constructor(data?: PartialMessage<PluginState>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "sola.PluginState";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "plugins", kind: "message", T: Plugin, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PluginState {
    return new PluginState().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PluginState {
    return new PluginState().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PluginState {
    return new PluginState().fromJsonString(jsonString, options);
  }

  static equals(a: PluginState | PlainMessage<PluginState> | undefined, b: PluginState | PlainMessage<PluginState> | undefined): boolean {
    return proto3.util.equals(PluginState, a, b);
  }
}

/**
 * @generated from message sola.PluginRegisterRequest
 */
export class PluginRegisterRequest extends Message<PluginRegisterRequest> {
  /**
   * @generated from field: string host = 1;
   */
  host = "";

  /**
   * @generated from field: int32 port = 2;
   */
  port = 0;

  constructor(data?: PartialMessage<PluginRegisterRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "sola.PluginRegisterRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "host", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "port", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PluginRegisterRequest {
    return new PluginRegisterRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PluginRegisterRequest {
    return new PluginRegisterRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PluginRegisterRequest {
    return new PluginRegisterRequest().fromJsonString(jsonString, options);
  }

  static equals(a: PluginRegisterRequest | PlainMessage<PluginRegisterRequest> | undefined, b: PluginRegisterRequest | PlainMessage<PluginRegisterRequest> | undefined): boolean {
    return proto3.util.equals(PluginRegisterRequest, a, b);
  }
}

/**
 * @generated from message sola.PluginRegisterResponse
 */
export class PluginRegisterResponse extends Message<PluginRegisterResponse> {
  /**
   * @generated from field: sola.PluginInfo info = 1;
   */
  info?: PluginInfo;

  constructor(data?: PartialMessage<PluginRegisterResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "sola.PluginRegisterResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "info", kind: "message", T: PluginInfo },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PluginRegisterResponse {
    return new PluginRegisterResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PluginRegisterResponse {
    return new PluginRegisterResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PluginRegisterResponse {
    return new PluginRegisterResponse().fromJsonString(jsonString, options);
  }

  static equals(a: PluginRegisterResponse | PlainMessage<PluginRegisterResponse> | undefined, b: PluginRegisterResponse | PlainMessage<PluginRegisterResponse> | undefined): boolean {
    return proto3.util.equals(PluginRegisterResponse, a, b);
  }
}

/**
 * @generated from message sola.PluginExecuteRequest
 */
export class PluginExecuteRequest extends Message<PluginExecuteRequest> {
  /**
   * @generated from field: string host = 1;
   */
  host = "";

  /**
   * @generated from field: int32 port = 2;
   */
  port = 0;

  /**
   * @generated from field: map<string, string> plugin_parameters = 3;
   */
  pluginParameters: { [key: string]: string } = {};

  /**
   * @generated from field: map<string, string> request_parameters = 4;
   */
  requestParameters: { [key: string]: string } = {};

  /**
   * @generated from field: repeated Song songs = 5;
   */
  songs: Song[] = [];

  constructor(data?: PartialMessage<PluginExecuteRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "sola.PluginExecuteRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "host", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "port", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 3, name: "plugin_parameters", kind: "map", K: 9 /* ScalarType.STRING */, V: {kind: "scalar", T: 9 /* ScalarType.STRING */} },
    { no: 4, name: "request_parameters", kind: "map", K: 9 /* ScalarType.STRING */, V: {kind: "scalar", T: 9 /* ScalarType.STRING */} },
    { no: 5, name: "songs", kind: "message", T: Song, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PluginExecuteRequest {
    return new PluginExecuteRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PluginExecuteRequest {
    return new PluginExecuteRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PluginExecuteRequest {
    return new PluginExecuteRequest().fromJsonString(jsonString, options);
  }

  static equals(a: PluginExecuteRequest | PlainMessage<PluginExecuteRequest> | undefined, b: PluginExecuteRequest | PlainMessage<PluginExecuteRequest> | undefined): boolean {
    return proto3.util.equals(PluginExecuteRequest, a, b);
  }
}

/**
 * @generated from message sola.PluginExecuteResponse
 */
export class PluginExecuteResponse extends Message<PluginExecuteResponse> {
  /**
   * @generated from field: string message = 1;
   */
  message = "";

  /**
   * @generated from field: int32 progress_percentage = 2;
   */
  progressPercentage = 0;

  /**
   * @generated from field: sola.PluginExecuteResponse.Status status = 3;
   */
  status = PluginExecuteResponse_Status.UNKNOWN;

  constructor(data?: PartialMessage<PluginExecuteResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "sola.PluginExecuteResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "message", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "progress_percentage", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 3, name: "status", kind: "enum", T: proto3.getEnumType(PluginExecuteResponse_Status) },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PluginExecuteResponse {
    return new PluginExecuteResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PluginExecuteResponse {
    return new PluginExecuteResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PluginExecuteResponse {
    return new PluginExecuteResponse().fromJsonString(jsonString, options);
  }

  static equals(a: PluginExecuteResponse | PlainMessage<PluginExecuteResponse> | undefined, b: PluginExecuteResponse | PlainMessage<PluginExecuteResponse> | undefined): boolean {
    return proto3.util.equals(PluginExecuteResponse, a, b);
  }
}

/**
 * @generated from enum sola.PluginExecuteResponse.Status
 */
export enum PluginExecuteResponse_Status {
  /**
   * @generated from enum value: UNKNOWN = 0;
   */
  UNKNOWN = 0,

  /**
   * @generated from enum value: OK = 1;
   */
  OK = 1,

  /**
   * Throw an error for ERROR
   *
   * @generated from enum value: WARN = 2;
   */
  WARN = 2,
}
// Retrieve enum metadata with: proto3.getEnumType(PluginExecuteResponse_Status)
proto3.util.setEnumType(PluginExecuteResponse_Status, "sola.PluginExecuteResponse.Status", [
  { no: 0, name: "UNKNOWN" },
  { no: 1, name: "OK" },
  { no: 2, name: "WARN" },
]);
