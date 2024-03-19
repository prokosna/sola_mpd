// @generated by protoc-gen-es v1.8.0 with parameter "target=ts"
// @generated from file mpd/mpd_player.proto (syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Int32Value, Message, proto3 } from "@bufbuild/protobuf";
import { AudioFormat } from "../song_pb.js";

/**
 * @generated from message MpdPlayerStatus
 */
export class MpdPlayerStatus extends Message<MpdPlayerStatus> {
  /**
   * @generated from field: bool is_repeat = 1;
   */
  isRepeat = false;

  /**
   * @generated from field: bool is_random = 2;
   */
  isRandom = false;

  /**
   * @generated from field: bool is_single = 3;
   */
  isSingle = false;

  /**
   * @generated from field: bool is_consume = 4;
   */
  isConsume = false;

  /**
   * @generated from field: int32 play_queue_length = 5;
   */
  playQueueLength = 0;

  /**
   * @generated from field: MpdPlayerStatus.PlaybackState playback_state = 6;
   */
  playbackState = MpdPlayerStatus_PlaybackState.UNKNOWN;

  /**
   * @generated from field: int32 song = 7;
   */
  song = 0;

  /**
   * @generated from field: int32 song_id = 8;
   */
  songId = 0;

  /**
   * @generated from field: int32 next_song = 9;
   */
  nextSong = 0;

  /**
   * @generated from field: int32 next_song_id = 10;
   */
  nextSongId = 0;

  /**
   * @generated from field: optional float elapsed = 11;
   */
  elapsed?: number;

  /**
   * @generated from field: optional float duration = 12;
   */
  duration?: number;

  /**
   * @generated from field: optional int32 bitrate = 13;
   */
  bitrate?: number;

  /**
   * @generated from field: AudioFormat audio_format = 14;
   */
  audioFormat?: AudioFormat;

  /**
   * @generated from field: bool is_database_updating = 16;
   */
  isDatabaseUpdating = false;

  constructor(data?: PartialMessage<MpdPlayerStatus>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "MpdPlayerStatus";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "is_repeat", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 2, name: "is_random", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 3, name: "is_single", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 4, name: "is_consume", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 5, name: "play_queue_length", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 6, name: "playback_state", kind: "enum", T: proto3.getEnumType(MpdPlayerStatus_PlaybackState) },
    { no: 7, name: "song", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 8, name: "song_id", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 9, name: "next_song", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 10, name: "next_song_id", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 11, name: "elapsed", kind: "scalar", T: 2 /* ScalarType.FLOAT */, opt: true },
    { no: 12, name: "duration", kind: "scalar", T: 2 /* ScalarType.FLOAT */, opt: true },
    { no: 13, name: "bitrate", kind: "scalar", T: 5 /* ScalarType.INT32 */, opt: true },
    { no: 14, name: "audio_format", kind: "message", T: AudioFormat },
    { no: 16, name: "is_database_updating", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): MpdPlayerStatus {
    return new MpdPlayerStatus().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): MpdPlayerStatus {
    return new MpdPlayerStatus().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): MpdPlayerStatus {
    return new MpdPlayerStatus().fromJsonString(jsonString, options);
  }

  static equals(a: MpdPlayerStatus | PlainMessage<MpdPlayerStatus> | undefined, b: MpdPlayerStatus | PlainMessage<MpdPlayerStatus> | undefined): boolean {
    return proto3.util.equals(MpdPlayerStatus, a, b);
  }
}

/**
 * @generated from enum MpdPlayerStatus.PlaybackState
 */
export enum MpdPlayerStatus_PlaybackState {
  /**
   * @generated from enum value: UNKNOWN = 0;
   */
  UNKNOWN = 0,

  /**
   * @generated from enum value: PLAY = 1;
   */
  PLAY = 1,

  /**
   * @generated from enum value: STOP = 2;
   */
  STOP = 2,

  /**
   * @generated from enum value: PAUSE = 3;
   */
  PAUSE = 3,
}
// Retrieve enum metadata with: proto3.getEnumType(MpdPlayerStatus_PlaybackState)
proto3.util.setEnumType(MpdPlayerStatus_PlaybackState, "MpdPlayerStatus.PlaybackState", [
  { no: 0, name: "UNKNOWN" },
  { no: 1, name: "PLAY" },
  { no: 2, name: "STOP" },
  { no: 3, name: "PAUSE" },
]);

/**
 * @generated from message MpdPlayerVolume
 */
export class MpdPlayerVolume extends Message<MpdPlayerVolume> {
  /**
   * @generated from field: google.protobuf.Int32Value volume = 1;
   */
  volume?: number;

  constructor(data?: PartialMessage<MpdPlayerVolume>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "MpdPlayerVolume";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "volume", kind: "message", T: Int32Value },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): MpdPlayerVolume {
    return new MpdPlayerVolume().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): MpdPlayerVolume {
    return new MpdPlayerVolume().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): MpdPlayerVolume {
    return new MpdPlayerVolume().fromJsonString(jsonString, options);
  }

  static equals(a: MpdPlayerVolume | PlainMessage<MpdPlayerVolume> | undefined, b: MpdPlayerVolume | PlainMessage<MpdPlayerVolume> | undefined): boolean {
    return proto3.util.equals(MpdPlayerVolume, a, b);
  }
}
