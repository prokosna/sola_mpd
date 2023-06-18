/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sola";

export interface Plugin {
  host: string;
  port: number;
  info: PluginInfo | undefined;
  pluginParameters: { [key: string]: string };
  isAvailable: boolean;
}

export enum PluginPluginType {
  UNKNOWN = "UNKNOWN",
  ON_PLAYLIST = "ON_PLAYLIST",
  ON_SAVED_SEARCH = "ON_SAVED_SEARCH",
  ON_PLAY_QUEUE = "ON_PLAY_QUEUE",
  ON_FILE_EXPLORE = "ON_FILE_EXPLORE",
  ON_BROWSER = "ON_BROWSER",
}

export function pluginPluginTypeFromJSON(object: any): PluginPluginType {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return PluginPluginType.UNKNOWN;
    case 1:
    case "ON_PLAYLIST":
      return PluginPluginType.ON_PLAYLIST;
    case 2:
    case "ON_SAVED_SEARCH":
      return PluginPluginType.ON_SAVED_SEARCH;
    case 3:
    case "ON_PLAY_QUEUE":
      return PluginPluginType.ON_PLAY_QUEUE;
    case 4:
    case "ON_FILE_EXPLORE":
      return PluginPluginType.ON_FILE_EXPLORE;
    case 5:
    case "ON_BROWSER":
      return PluginPluginType.ON_BROWSER;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum PluginPluginType");
  }
}

export function pluginPluginTypeToJSON(object: PluginPluginType): string {
  switch (object) {
    case PluginPluginType.UNKNOWN:
      return "UNKNOWN";
    case PluginPluginType.ON_PLAYLIST:
      return "ON_PLAYLIST";
    case PluginPluginType.ON_SAVED_SEARCH:
      return "ON_SAVED_SEARCH";
    case PluginPluginType.ON_PLAY_QUEUE:
      return "ON_PLAY_QUEUE";
    case PluginPluginType.ON_FILE_EXPLORE:
      return "ON_FILE_EXPLORE";
    case PluginPluginType.ON_BROWSER:
      return "ON_BROWSER";
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum PluginPluginType");
  }
}

export function pluginPluginTypeToNumber(object: PluginPluginType): number {
  switch (object) {
    case PluginPluginType.UNKNOWN:
      return 0;
    case PluginPluginType.ON_PLAYLIST:
      return 1;
    case PluginPluginType.ON_SAVED_SEARCH:
      return 2;
    case PluginPluginType.ON_PLAY_QUEUE:
      return 3;
    case PluginPluginType.ON_FILE_EXPLORE:
      return 4;
    case PluginPluginType.ON_BROWSER:
      return 5;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum PluginPluginType");
  }
}

export interface PluginPluginParametersEntry {
  key: string;
  value: string;
}

export interface PluginInfo {
  name: string;
  version: string;
  description: string;
  contextMenuTitle: string;
  contextMenuDescription: string;
  supportedTypes: PluginPluginType[];
  requiredPluginParameters: string[];
  requiredRequestParameters: string[];
}

export interface PluginState {
  plugins: Plugin[];
}

export interface PluginRegisterRequest {
  host: string;
  port: number;
}

export interface PluginRegisterResponse {
  info: PluginInfo | undefined;
}

export interface PluginExecuteRequest {
  host: string;
  port: number;
  pluginParameters: { [key: string]: string };
  requestParameters: { [key: string]: string };
  payload: Uint8Array;
}

export interface PluginExecuteRequestPluginParametersEntry {
  key: string;
  value: string;
}

export interface PluginExecuteRequestRequestParametersEntry {
  key: string;
  value: string;
}

export interface PluginExecuteResponse {
  message: string;
  progressPercentage: number;
  status: PluginExecuteResponseStatus;
}

export enum PluginExecuteResponseStatus {
  UNKNOWN = "UNKNOWN",
  OK = "OK",
  WARN = "WARN",
}

export function pluginExecuteResponseStatusFromJSON(object: any): PluginExecuteResponseStatus {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return PluginExecuteResponseStatus.UNKNOWN;
    case 1:
    case "OK":
      return PluginExecuteResponseStatus.OK;
    case 2:
    case "WARN":
      return PluginExecuteResponseStatus.WARN;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum PluginExecuteResponseStatus");
  }
}

export function pluginExecuteResponseStatusToJSON(object: PluginExecuteResponseStatus): string {
  switch (object) {
    case PluginExecuteResponseStatus.UNKNOWN:
      return "UNKNOWN";
    case PluginExecuteResponseStatus.OK:
      return "OK";
    case PluginExecuteResponseStatus.WARN:
      return "WARN";
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum PluginExecuteResponseStatus");
  }
}

export function pluginExecuteResponseStatusToNumber(object: PluginExecuteResponseStatus): number {
  switch (object) {
    case PluginExecuteResponseStatus.UNKNOWN:
      return 0;
    case PluginExecuteResponseStatus.OK:
      return 1;
    case PluginExecuteResponseStatus.WARN:
      return 2;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum PluginExecuteResponseStatus");
  }
}

export const SOLA_PACKAGE_NAME = "sola";

function createBasePlugin(): Plugin {
  return { host: "", port: 0, info: undefined, pluginParameters: {}, isAvailable: false };
}

export const Plugin = {
  encode(message: Plugin, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.port !== 0) {
      writer.uint32(16).int32(message.port);
    }
    if (message.info !== undefined) {
      PluginInfo.encode(message.info, writer.uint32(26).fork()).ldelim();
    }
    Object.entries(message.pluginParameters).forEach(([key, value]) => {
      PluginPluginParametersEntry.encode({ key: key as any, value }, writer.uint32(34).fork()).ldelim();
    });
    if (message.isAvailable === true) {
      writer.uint32(40).bool(message.isAvailable);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Plugin {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlugin();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.host = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.port = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.info = PluginInfo.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          const entry4 = PluginPluginParametersEntry.decode(reader, reader.uint32());
          if (entry4.value !== undefined) {
            message.pluginParameters[entry4.key] = entry4.value;
          }
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.isAvailable = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Plugin {
    return {
      host: isSet(object.host) ? String(object.host) : "",
      port: isSet(object.port) ? Number(object.port) : 0,
      info: isSet(object.info) ? PluginInfo.fromJSON(object.info) : undefined,
      pluginParameters: isObject(object.pluginParameters)
        ? Object.entries(object.pluginParameters).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
      isAvailable: isSet(object.isAvailable) ? Boolean(object.isAvailable) : false,
    };
  },

  toJSON(message: Plugin): unknown {
    const obj: any = {};
    message.host !== undefined && (obj.host = message.host);
    message.port !== undefined && (obj.port = Math.round(message.port));
    message.info !== undefined && (obj.info = message.info ? PluginInfo.toJSON(message.info) : undefined);
    obj.pluginParameters = {};
    if (message.pluginParameters) {
      Object.entries(message.pluginParameters).forEach(([k, v]) => {
        obj.pluginParameters[k] = v;
      });
    }
    message.isAvailable !== undefined && (obj.isAvailable = message.isAvailable);
    return obj;
  },

  create<I extends Exact<DeepPartial<Plugin>, I>>(base?: I): Plugin {
    return Plugin.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Plugin>, I>>(object: I): Plugin {
    const message = createBasePlugin();
    message.host = object.host ?? "";
    message.port = object.port ?? 0;
    message.info = (object.info !== undefined && object.info !== null)
      ? PluginInfo.fromPartial(object.info)
      : undefined;
    message.pluginParameters = Object.entries(object.pluginParameters ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      },
      {},
    );
    message.isAvailable = object.isAvailable ?? false;
    return message;
  },
};

function createBasePluginPluginParametersEntry(): PluginPluginParametersEntry {
  return { key: "", value: "" };
}

export const PluginPluginParametersEntry = {
  encode(message: PluginPluginParametersEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PluginPluginParametersEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePluginPluginParametersEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PluginPluginParametersEntry {
    return { key: isSet(object.key) ? String(object.key) : "", value: isSet(object.value) ? String(object.value) : "" };
  },

  toJSON(message: PluginPluginParametersEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  create<I extends Exact<DeepPartial<PluginPluginParametersEntry>, I>>(base?: I): PluginPluginParametersEntry {
    return PluginPluginParametersEntry.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PluginPluginParametersEntry>, I>>(object: I): PluginPluginParametersEntry {
    const message = createBasePluginPluginParametersEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBasePluginInfo(): PluginInfo {
  return {
    name: "",
    version: "",
    description: "",
    contextMenuTitle: "",
    contextMenuDescription: "",
    supportedTypes: [],
    requiredPluginParameters: [],
    requiredRequestParameters: [],
  };
}

export const PluginInfo = {
  encode(message: PluginInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.version !== "") {
      writer.uint32(18).string(message.version);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.contextMenuTitle !== "") {
      writer.uint32(34).string(message.contextMenuTitle);
    }
    if (message.contextMenuDescription !== "") {
      writer.uint32(42).string(message.contextMenuDescription);
    }
    writer.uint32(50).fork();
    for (const v of message.supportedTypes) {
      writer.int32(pluginPluginTypeToNumber(v));
    }
    writer.ldelim();
    for (const v of message.requiredPluginParameters) {
      writer.uint32(58).string(v!);
    }
    for (const v of message.requiredRequestParameters) {
      writer.uint32(66).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PluginInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePluginInfo();
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

          message.version = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.contextMenuTitle = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.contextMenuDescription = reader.string();
          continue;
        case 6:
          if (tag === 48) {
            message.supportedTypes.push(pluginPluginTypeFromJSON(reader.int32()));

            continue;
          }

          if (tag === 50) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.supportedTypes.push(pluginPluginTypeFromJSON(reader.int32()));
            }

            continue;
          }

          break;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.requiredPluginParameters.push(reader.string());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.requiredRequestParameters.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PluginInfo {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      version: isSet(object.version) ? String(object.version) : "",
      description: isSet(object.description) ? String(object.description) : "",
      contextMenuTitle: isSet(object.contextMenuTitle) ? String(object.contextMenuTitle) : "",
      contextMenuDescription: isSet(object.contextMenuDescription) ? String(object.contextMenuDescription) : "",
      supportedTypes: Array.isArray(object?.supportedTypes)
        ? object.supportedTypes.map((e: any) => pluginPluginTypeFromJSON(e))
        : [],
      requiredPluginParameters: Array.isArray(object?.requiredPluginParameters)
        ? object.requiredPluginParameters.map((e: any) => String(e))
        : [],
      requiredRequestParameters: Array.isArray(object?.requiredRequestParameters)
        ? object.requiredRequestParameters.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: PluginInfo): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.version !== undefined && (obj.version = message.version);
    message.description !== undefined && (obj.description = message.description);
    message.contextMenuTitle !== undefined && (obj.contextMenuTitle = message.contextMenuTitle);
    message.contextMenuDescription !== undefined && (obj.contextMenuDescription = message.contextMenuDescription);
    if (message.supportedTypes) {
      obj.supportedTypes = message.supportedTypes.map((e) => pluginPluginTypeToJSON(e));
    } else {
      obj.supportedTypes = [];
    }
    if (message.requiredPluginParameters) {
      obj.requiredPluginParameters = message.requiredPluginParameters.map((e) => e);
    } else {
      obj.requiredPluginParameters = [];
    }
    if (message.requiredRequestParameters) {
      obj.requiredRequestParameters = message.requiredRequestParameters.map((e) => e);
    } else {
      obj.requiredRequestParameters = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PluginInfo>, I>>(base?: I): PluginInfo {
    return PluginInfo.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PluginInfo>, I>>(object: I): PluginInfo {
    const message = createBasePluginInfo();
    message.name = object.name ?? "";
    message.version = object.version ?? "";
    message.description = object.description ?? "";
    message.contextMenuTitle = object.contextMenuTitle ?? "";
    message.contextMenuDescription = object.contextMenuDescription ?? "";
    message.supportedTypes = object.supportedTypes?.map((e) => e) || [];
    message.requiredPluginParameters = object.requiredPluginParameters?.map((e) => e) || [];
    message.requiredRequestParameters = object.requiredRequestParameters?.map((e) => e) || [];
    return message;
  },
};

function createBasePluginState(): PluginState {
  return { plugins: [] };
}

export const PluginState = {
  encode(message: PluginState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.plugins) {
      Plugin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PluginState {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePluginState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.plugins.push(Plugin.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PluginState {
    return { plugins: Array.isArray(object?.plugins) ? object.plugins.map((e: any) => Plugin.fromJSON(e)) : [] };
  },

  toJSON(message: PluginState): unknown {
    const obj: any = {};
    if (message.plugins) {
      obj.plugins = message.plugins.map((e) => e ? Plugin.toJSON(e) : undefined);
    } else {
      obj.plugins = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PluginState>, I>>(base?: I): PluginState {
    return PluginState.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PluginState>, I>>(object: I): PluginState {
    const message = createBasePluginState();
    message.plugins = object.plugins?.map((e) => Plugin.fromPartial(e)) || [];
    return message;
  },
};

function createBasePluginRegisterRequest(): PluginRegisterRequest {
  return { host: "", port: 0 };
}

export const PluginRegisterRequest = {
  encode(message: PluginRegisterRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.port !== 0) {
      writer.uint32(16).int32(message.port);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PluginRegisterRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePluginRegisterRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.host = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.port = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PluginRegisterRequest {
    return { host: isSet(object.host) ? String(object.host) : "", port: isSet(object.port) ? Number(object.port) : 0 };
  },

  toJSON(message: PluginRegisterRequest): unknown {
    const obj: any = {};
    message.host !== undefined && (obj.host = message.host);
    message.port !== undefined && (obj.port = Math.round(message.port));
    return obj;
  },

  create<I extends Exact<DeepPartial<PluginRegisterRequest>, I>>(base?: I): PluginRegisterRequest {
    return PluginRegisterRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PluginRegisterRequest>, I>>(object: I): PluginRegisterRequest {
    const message = createBasePluginRegisterRequest();
    message.host = object.host ?? "";
    message.port = object.port ?? 0;
    return message;
  },
};

function createBasePluginRegisterResponse(): PluginRegisterResponse {
  return { info: undefined };
}

export const PluginRegisterResponse = {
  encode(message: PluginRegisterResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.info !== undefined) {
      PluginInfo.encode(message.info, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PluginRegisterResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePluginRegisterResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.info = PluginInfo.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PluginRegisterResponse {
    return { info: isSet(object.info) ? PluginInfo.fromJSON(object.info) : undefined };
  },

  toJSON(message: PluginRegisterResponse): unknown {
    const obj: any = {};
    message.info !== undefined && (obj.info = message.info ? PluginInfo.toJSON(message.info) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<PluginRegisterResponse>, I>>(base?: I): PluginRegisterResponse {
    return PluginRegisterResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PluginRegisterResponse>, I>>(object: I): PluginRegisterResponse {
    const message = createBasePluginRegisterResponse();
    message.info = (object.info !== undefined && object.info !== null)
      ? PluginInfo.fromPartial(object.info)
      : undefined;
    return message;
  },
};

function createBasePluginExecuteRequest(): PluginExecuteRequest {
  return { host: "", port: 0, pluginParameters: {}, requestParameters: {}, payload: new Uint8Array() };
}

export const PluginExecuteRequest = {
  encode(message: PluginExecuteRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.port !== 0) {
      writer.uint32(16).int32(message.port);
    }
    Object.entries(message.pluginParameters).forEach(([key, value]) => {
      PluginExecuteRequestPluginParametersEntry.encode({ key: key as any, value }, writer.uint32(26).fork()).ldelim();
    });
    Object.entries(message.requestParameters).forEach(([key, value]) => {
      PluginExecuteRequestRequestParametersEntry.encode({ key: key as any, value }, writer.uint32(34).fork()).ldelim();
    });
    if (message.payload.length !== 0) {
      writer.uint32(42).bytes(message.payload);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PluginExecuteRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePluginExecuteRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.host = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.port = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          const entry3 = PluginExecuteRequestPluginParametersEntry.decode(reader, reader.uint32());
          if (entry3.value !== undefined) {
            message.pluginParameters[entry3.key] = entry3.value;
          }
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          const entry4 = PluginExecuteRequestRequestParametersEntry.decode(reader, reader.uint32());
          if (entry4.value !== undefined) {
            message.requestParameters[entry4.key] = entry4.value;
          }
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.payload = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PluginExecuteRequest {
    return {
      host: isSet(object.host) ? String(object.host) : "",
      port: isSet(object.port) ? Number(object.port) : 0,
      pluginParameters: isObject(object.pluginParameters)
        ? Object.entries(object.pluginParameters).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
      requestParameters: isObject(object.requestParameters)
        ? Object.entries(object.requestParameters).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
      payload: isSet(object.payload) ? bytesFromBase64(object.payload) : new Uint8Array(),
    };
  },

  toJSON(message: PluginExecuteRequest): unknown {
    const obj: any = {};
    message.host !== undefined && (obj.host = message.host);
    message.port !== undefined && (obj.port = Math.round(message.port));
    obj.pluginParameters = {};
    if (message.pluginParameters) {
      Object.entries(message.pluginParameters).forEach(([k, v]) => {
        obj.pluginParameters[k] = v;
      });
    }
    obj.requestParameters = {};
    if (message.requestParameters) {
      Object.entries(message.requestParameters).forEach(([k, v]) => {
        obj.requestParameters[k] = v;
      });
    }
    message.payload !== undefined &&
      (obj.payload = base64FromBytes(message.payload !== undefined ? message.payload : new Uint8Array()));
    return obj;
  },

  create<I extends Exact<DeepPartial<PluginExecuteRequest>, I>>(base?: I): PluginExecuteRequest {
    return PluginExecuteRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PluginExecuteRequest>, I>>(object: I): PluginExecuteRequest {
    const message = createBasePluginExecuteRequest();
    message.host = object.host ?? "";
    message.port = object.port ?? 0;
    message.pluginParameters = Object.entries(object.pluginParameters ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      },
      {},
    );
    message.requestParameters = Object.entries(object.requestParameters ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      },
      {},
    );
    message.payload = object.payload ?? new Uint8Array();
    return message;
  },
};

function createBasePluginExecuteRequestPluginParametersEntry(): PluginExecuteRequestPluginParametersEntry {
  return { key: "", value: "" };
}

export const PluginExecuteRequestPluginParametersEntry = {
  encode(message: PluginExecuteRequestPluginParametersEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PluginExecuteRequestPluginParametersEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePluginExecuteRequestPluginParametersEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PluginExecuteRequestPluginParametersEntry {
    return { key: isSet(object.key) ? String(object.key) : "", value: isSet(object.value) ? String(object.value) : "" };
  },

  toJSON(message: PluginExecuteRequestPluginParametersEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  create<I extends Exact<DeepPartial<PluginExecuteRequestPluginParametersEntry>, I>>(
    base?: I,
  ): PluginExecuteRequestPluginParametersEntry {
    return PluginExecuteRequestPluginParametersEntry.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PluginExecuteRequestPluginParametersEntry>, I>>(
    object: I,
  ): PluginExecuteRequestPluginParametersEntry {
    const message = createBasePluginExecuteRequestPluginParametersEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBasePluginExecuteRequestRequestParametersEntry(): PluginExecuteRequestRequestParametersEntry {
  return { key: "", value: "" };
}

export const PluginExecuteRequestRequestParametersEntry = {
  encode(message: PluginExecuteRequestRequestParametersEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PluginExecuteRequestRequestParametersEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePluginExecuteRequestRequestParametersEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PluginExecuteRequestRequestParametersEntry {
    return { key: isSet(object.key) ? String(object.key) : "", value: isSet(object.value) ? String(object.value) : "" };
  },

  toJSON(message: PluginExecuteRequestRequestParametersEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  create<I extends Exact<DeepPartial<PluginExecuteRequestRequestParametersEntry>, I>>(
    base?: I,
  ): PluginExecuteRequestRequestParametersEntry {
    return PluginExecuteRequestRequestParametersEntry.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PluginExecuteRequestRequestParametersEntry>, I>>(
    object: I,
  ): PluginExecuteRequestRequestParametersEntry {
    const message = createBasePluginExecuteRequestRequestParametersEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBasePluginExecuteResponse(): PluginExecuteResponse {
  return { message: "", progressPercentage: 0, status: PluginExecuteResponseStatus.UNKNOWN };
}

export const PluginExecuteResponse = {
  encode(message: PluginExecuteResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    if (message.progressPercentage !== 0) {
      writer.uint32(16).int32(message.progressPercentage);
    }
    if (message.status !== PluginExecuteResponseStatus.UNKNOWN) {
      writer.uint32(24).int32(pluginExecuteResponseStatusToNumber(message.status));
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PluginExecuteResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePluginExecuteResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.message = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.progressPercentage = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.status = pluginExecuteResponseStatusFromJSON(reader.int32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PluginExecuteResponse {
    return {
      message: isSet(object.message) ? String(object.message) : "",
      progressPercentage: isSet(object.progressPercentage) ? Number(object.progressPercentage) : 0,
      status: isSet(object.status)
        ? pluginExecuteResponseStatusFromJSON(object.status)
        : PluginExecuteResponseStatus.UNKNOWN,
    };
  },

  toJSON(message: PluginExecuteResponse): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    message.progressPercentage !== undefined && (obj.progressPercentage = Math.round(message.progressPercentage));
    message.status !== undefined && (obj.status = pluginExecuteResponseStatusToJSON(message.status));
    return obj;
  },

  create<I extends Exact<DeepPartial<PluginExecuteResponse>, I>>(base?: I): PluginExecuteResponse {
    return PluginExecuteResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PluginExecuteResponse>, I>>(object: I): PluginExecuteResponse {
    const message = createBasePluginExecuteResponse();
    message.message = object.message ?? "";
    message.progressPercentage = object.progressPercentage ?? 0;
    message.status = object.status ?? PluginExecuteResponseStatus.UNKNOWN;
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

function bytesFromBase64(b64: string): Uint8Array {
  if (tsProtoGlobalThis.Buffer) {
    return Uint8Array.from(tsProtoGlobalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = tsProtoGlobalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (tsProtoGlobalThis.Buffer) {
    return tsProtoGlobalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return tsProtoGlobalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
