import { Reader, Writer } from "protobufjs";

export interface JSONSerializable<T> {
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
}

export interface ProtoSerializable<T> {
  encode(message: T, writer?: Writer): Writer;
  decode(input: Reader | Uint8Array, length?: number): T;
}
