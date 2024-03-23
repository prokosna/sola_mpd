import { StringValue } from "@bufbuild/protobuf";
import { describe, it, expect } from "vitest";

import {
  FilterCondition,
  FilterCondition_Operator,
} from "../models/filter_pb.js";
import { Song_MetadataTag, Song_MetadataValue } from "../models/song_pb.js";

import { MpdUtils } from "./MpdUtils.js";

describe("MpdUtils", () => {
  it("escapeConditionArg should correctly escape special characters", () => {
    expect(MpdUtils.escapeConditionArg('test"value')).toBe('test\\\\"value');
    expect(MpdUtils.escapeConditionArg("test'value")).toBe("test\\'value");
    expect(MpdUtils.escapeConditionArg(undefined)).toBe("");
  });

  it("escapeExpression should correctly escape backslashes and double quotes", () => {
    expect(MpdUtils.escapeExpression("path\\to\\file")).toBe(
      "path\\\\to\\\\file",
    );
    expect(MpdUtils.escapeExpression('say "hello"')).toBe(
      'say \\\\"hello\\\\"',
    );
  });

  it("escapeRegexString should correctly escape regex characters", () => {
    expect(MpdUtils.escapeRegexString("a[b]c")).toBe("a\\\\\\\\[b\\\\\\\\]c");
  });

  it("convertConditionsToString should correctly convert conditions to string", () => {
    const conditions: FilterCondition[] = [
      new FilterCondition({
        uuid: "1",
        tag: Song_MetadataTag.TITLE,
        value: new Song_MetadataValue({
          value: {
            case: "stringValue",
            value: new StringValue({ value: "Test Song" }),
          },
        }),
        operator: FilterCondition_Operator.EQUAL,
      }),
    ];
    expect(MpdUtils.convertConditionsToString(conditions)).toBe(
      '((title == "Test Song"))',
    );
  });

  it("convertConditionToString should throw an error if value is undefined", () => {
    const condition: FilterCondition = new FilterCondition({
      uuid: "1",
      tag: Song_MetadataTag.ARTIST,
      value: undefined,
      operator: FilterCondition_Operator.EQUAL,
    });
    expect(() => MpdUtils.convertConditionToString(condition)).toThrow(
      "Condition value is undefined",
    );
  });

  it("convertSong_MetadataTagToMpdTag should convert metadata tag to MPD tag", () => {
    expect(
      MpdUtils.convertSongMetadataTagToMpdTag(Song_MetadataTag.ARTIST),
    ).toBe("artist");
    expect(
      MpdUtils.convertSongMetadataTagToMpdTag(Song_MetadataTag.ALBUM_ARTIST),
    ).toBe("albumartist");
  });
});
