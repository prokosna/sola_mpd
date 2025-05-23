// @generated by protoc-gen-es v1.10.0 with parameter "target=ts"
// @generated from file mpd/mpd_output.proto (syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from message MpdOutputDevice
 */
export class MpdOutputDevice extends Message<MpdOutputDevice> {
  /**
   * @generated from field: int32 id = 1;
   */
  id = 0;

  /**
   * @generated from field: string name = 2;
   */
  name = "";

  /**
   * @generated from field: string plugin = 3;
   */
  plugin = "";

  /**
   * @generated from field: bool is_enabled = 4;
   */
  isEnabled = false;

  constructor(data?: PartialMessage<MpdOutputDevice>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "MpdOutputDevice";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "id", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 2, name: "name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "plugin", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 4, name: "is_enabled", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): MpdOutputDevice {
    return new MpdOutputDevice().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): MpdOutputDevice {
    return new MpdOutputDevice().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): MpdOutputDevice {
    return new MpdOutputDevice().fromJsonString(jsonString, options);
  }

  static equals(a: MpdOutputDevice | PlainMessage<MpdOutputDevice> | undefined, b: MpdOutputDevice | PlainMessage<MpdOutputDevice> | undefined): boolean {
    return proto3.util.equals(MpdOutputDevice, a, b);
  }
}

