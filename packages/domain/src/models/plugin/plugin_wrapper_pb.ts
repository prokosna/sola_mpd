// @generated by protoc-gen-es v1.10.0 with parameter "target=ts"
// @generated from file plugin/plugin_wrapper.proto (package sola, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";
import { PluginExecuteRequest, PluginExecuteResponse, PluginRegisterRequest, PluginRegisterResponse } from "./plugin_pb.js";

/**
 * @generated from message sola.PluginRegisterRequestWrapper
 */
export class PluginRegisterRequestWrapper extends Message<PluginRegisterRequestWrapper> {
  /**
   * @generated from field: sola.PluginRegisterRequest request = 1;
   */
  request?: PluginRegisterRequest;

  constructor(data?: PartialMessage<PluginRegisterRequestWrapper>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "sola.PluginRegisterRequestWrapper";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "request", kind: "message", T: PluginRegisterRequest },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PluginRegisterRequestWrapper {
    return new PluginRegisterRequestWrapper().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PluginRegisterRequestWrapper {
    return new PluginRegisterRequestWrapper().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PluginRegisterRequestWrapper {
    return new PluginRegisterRequestWrapper().fromJsonString(jsonString, options);
  }

  static equals(a: PluginRegisterRequestWrapper | PlainMessage<PluginRegisterRequestWrapper> | undefined, b: PluginRegisterRequestWrapper | PlainMessage<PluginRegisterRequestWrapper> | undefined): boolean {
    return proto3.util.equals(PluginRegisterRequestWrapper, a, b);
  }
}

/**
 * @generated from message sola.PluginRegisterResponseWrapper
 */
export class PluginRegisterResponseWrapper extends Message<PluginRegisterResponseWrapper> {
  /**
   * @generated from oneof sola.PluginRegisterResponseWrapper.result
   */
  result: {
    /**
     * @generated from field: sola.PluginRegisterResponse response = 1;
     */
    value: PluginRegisterResponse;
    case: "response";
  } | {
    /**
     * @generated from field: string error = 2;
     */
    value: string;
    case: "error";
  } | { case: undefined; value?: undefined } = { case: undefined };

  constructor(data?: PartialMessage<PluginRegisterResponseWrapper>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "sola.PluginRegisterResponseWrapper";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "response", kind: "message", T: PluginRegisterResponse, oneof: "result" },
    { no: 2, name: "error", kind: "scalar", T: 9 /* ScalarType.STRING */, oneof: "result" },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PluginRegisterResponseWrapper {
    return new PluginRegisterResponseWrapper().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PluginRegisterResponseWrapper {
    return new PluginRegisterResponseWrapper().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PluginRegisterResponseWrapper {
    return new PluginRegisterResponseWrapper().fromJsonString(jsonString, options);
  }

  static equals(a: PluginRegisterResponseWrapper | PlainMessage<PluginRegisterResponseWrapper> | undefined, b: PluginRegisterResponseWrapper | PlainMessage<PluginRegisterResponseWrapper> | undefined): boolean {
    return proto3.util.equals(PluginRegisterResponseWrapper, a, b);
  }
}

/**
 * @generated from message sola.PluginExecuteRequestWrapper
 */
export class PluginExecuteRequestWrapper extends Message<PluginExecuteRequestWrapper> {
  /**
   * @generated from field: sola.PluginExecuteRequest request = 1;
   */
  request?: PluginExecuteRequest;

  /**
   * @generated from field: string callback_event = 2;
   */
  callbackEvent = "";

  constructor(data?: PartialMessage<PluginExecuteRequestWrapper>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "sola.PluginExecuteRequestWrapper";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "request", kind: "message", T: PluginExecuteRequest },
    { no: 2, name: "callback_event", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PluginExecuteRequestWrapper {
    return new PluginExecuteRequestWrapper().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PluginExecuteRequestWrapper {
    return new PluginExecuteRequestWrapper().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PluginExecuteRequestWrapper {
    return new PluginExecuteRequestWrapper().fromJsonString(jsonString, options);
  }

  static equals(a: PluginExecuteRequestWrapper | PlainMessage<PluginExecuteRequestWrapper> | undefined, b: PluginExecuteRequestWrapper | PlainMessage<PluginExecuteRequestWrapper> | undefined): boolean {
    return proto3.util.equals(PluginExecuteRequestWrapper, a, b);
  }
}

/**
 * @generated from message sola.PluginExecuteResponseWrapper
 */
export class PluginExecuteResponseWrapper extends Message<PluginExecuteResponseWrapper> {
  /**
   * @generated from oneof sola.PluginExecuteResponseWrapper.result
   */
  result: {
    /**
     * @generated from field: sola.PluginExecuteResponse response = 1;
     */
    value: PluginExecuteResponse;
    case: "response";
  } | {
    /**
     * @generated from field: string error = 2;
     */
    value: string;
    case: "error";
  } | {
    /**
     * @generated from field: bool complete = 3;
     */
    value: boolean;
    case: "complete";
  } | { case: undefined; value?: undefined } = { case: undefined };

  constructor(data?: PartialMessage<PluginExecuteResponseWrapper>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "sola.PluginExecuteResponseWrapper";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "response", kind: "message", T: PluginExecuteResponse, oneof: "result" },
    { no: 2, name: "error", kind: "scalar", T: 9 /* ScalarType.STRING */, oneof: "result" },
    { no: 3, name: "complete", kind: "scalar", T: 8 /* ScalarType.BOOL */, oneof: "result" },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PluginExecuteResponseWrapper {
    return new PluginExecuteResponseWrapper().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PluginExecuteResponseWrapper {
    return new PluginExecuteResponseWrapper().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PluginExecuteResponseWrapper {
    return new PluginExecuteResponseWrapper().fromJsonString(jsonString, options);
  }

  static equals(a: PluginExecuteResponseWrapper | PlainMessage<PluginExecuteResponseWrapper> | undefined, b: PluginExecuteResponseWrapper | PlainMessage<PluginExecuteResponseWrapper> | undefined): boolean {
    return proto3.util.equals(PluginExecuteResponseWrapper, a, b);
  }
}

