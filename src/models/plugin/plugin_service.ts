/* eslint-disable */
import {
  CallOptions,
  ChannelCredentials,
  Client,
  ClientOptions,
  ClientReadableStream,
  ClientUnaryCall,
  handleServerStreamingCall,
  handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  ServiceError,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import { PluginExecuteRequest, PluginExecuteResponse, PluginRegisterRequest, PluginRegisterResponse } from "./plugin";

export const protobufPackage = "sola";

export type PluginServiceService = typeof PluginServiceService;
export const PluginServiceService = {
  register: {
    path: "/sola.PluginService/Register",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: PluginRegisterRequest) => Buffer.from(PluginRegisterRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => PluginRegisterRequest.decode(value),
    responseSerialize: (value: PluginRegisterResponse) => Buffer.from(PluginRegisterResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => PluginRegisterResponse.decode(value),
  },
  execute: {
    path: "/sola.PluginService/Execute",
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: PluginExecuteRequest) => Buffer.from(PluginExecuteRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => PluginExecuteRequest.decode(value),
    responseSerialize: (value: PluginExecuteResponse) => Buffer.from(PluginExecuteResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => PluginExecuteResponse.decode(value),
  },
} as const;

export interface PluginServiceServer extends UntypedServiceImplementation {
  register: handleUnaryCall<PluginRegisterRequest, PluginRegisterResponse>;
  execute: handleServerStreamingCall<PluginExecuteRequest, PluginExecuteResponse>;
}

export interface PluginServiceClient extends Client {
  register(
    request: PluginRegisterRequest,
    callback: (error: ServiceError | null, response: PluginRegisterResponse) => void,
  ): ClientUnaryCall;
  register(
    request: PluginRegisterRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: PluginRegisterResponse) => void,
  ): ClientUnaryCall;
  register(
    request: PluginRegisterRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: PluginRegisterResponse) => void,
  ): ClientUnaryCall;
  execute(request: PluginExecuteRequest, options?: Partial<CallOptions>): ClientReadableStream<PluginExecuteResponse>;
  execute(
    request: PluginExecuteRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<PluginExecuteResponse>;
}

export const PluginServiceClient = makeGenericClientConstructor(
  PluginServiceService,
  "sola.PluginService",
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): PluginServiceClient;
  service: typeof PluginServiceService;
};
