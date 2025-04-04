// @generated by protoc-gen-es v1.10.0 with parameter "target=ts"
// @generated from file playlist.proto (syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3, Timestamp } from "@bufbuild/protobuf";

/**
 * @generated from message Playlist
 */
export class Playlist extends Message<Playlist> {
  /**
   * @generated from field: string name = 1;
   */
  name = "";

  /**
   * @generated from field: google.protobuf.Timestamp updated_at = 2;
   */
  updatedAt?: Timestamp;

  constructor(data?: PartialMessage<Playlist>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "Playlist";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "updated_at", kind: "message", T: Timestamp },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Playlist {
    return new Playlist().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Playlist {
    return new Playlist().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Playlist {
    return new Playlist().fromJsonString(jsonString, options);
  }

  static equals(a: Playlist | PlainMessage<Playlist> | undefined, b: Playlist | PlainMessage<Playlist> | undefined): boolean {
    return proto3.util.equals(Playlist, a, b);
  }
}

