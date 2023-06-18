/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { PluginExecuteRequest, PluginExecuteResponse, PluginRegisterRequest, PluginRegisterResponse } from "./plugin";

export const protobufPackage = "sola";

export const SOLA_PACKAGE_NAME = "sola";

export interface PluginServiceClient {
  register(request: PluginRegisterRequest): Observable<PluginRegisterResponse>;

  execute(request: PluginExecuteRequest): Observable<PluginExecuteResponse>;
}

export interface PluginServiceController {
  register(
    request: PluginRegisterRequest,
  ): Promise<PluginRegisterResponse> | Observable<PluginRegisterResponse> | PluginRegisterResponse;

  execute(request: PluginExecuteRequest): Observable<PluginExecuteResponse>;
}

export function PluginServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["register", "execute"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("PluginService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("PluginService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const PLUGIN_SERVICE_NAME = "PluginService";
