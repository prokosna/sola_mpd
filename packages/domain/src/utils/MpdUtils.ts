import {
  FilterCondition,
  FilterCondition_Operator,
} from "../models/filter_pb.js";
import { Song_MetadataTag } from "../models/song_pb.js";

import { SongUtils } from "./SongUtils.js";

export class MpdUtils {
  static escapeConditionArg(value: string | undefined): string {
    return value?.replaceAll('"', '\\\\"').replaceAll("'", "\\'") || "";
  }

  static escapeExpression(value: string): string {
    return value.replaceAll("\\", "\\\\").replaceAll('"', '\\\\"');
  }

  static escapeRegexString(value: string): string {
    return value
      .replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
      .replace(/-/g, "\\x2d")
      .replaceAll("\\", "\\\\\\\\");
  }

  static convertConditionsToString(conditions: FilterCondition[]): string {
    if (conditions.length === 0) {
      return "";
    }
    const expression = conditions
      .map((condition) => `(${this.convertConditionToString(condition)})`)
      .join(" AND ");
    return `(${expression})`;
  }

  static convertConditionToString(condition: FilterCondition): string {
    if (condition.value === undefined) {
      throw new Error("Condition value is undefined");
    }
    const left = Song_MetadataTag[condition.tag]
      .replaceAll("_", "")
      .toLowerCase();
    const right = this.escapeConditionArg(
      SongUtils.convertSongMetadataValueToString(condition.value),
    );
    switch (condition.operator) {
      case FilterCondition_Operator.EQUAL:
        return `${left} == "${right}"`;
      case FilterCondition_Operator.NOT_EQUAL:
        return `${left} != "${right}"`;
      case FilterCondition_Operator.CONTAIN:
        return `${left} contains "${right}"`;
      case FilterCondition_Operator.NOT_CONTAIN:
        return `!(${left} contains "${right}")`;
      case FilterCondition_Operator.REGEX:
        return `${left} =~ "${right}"`;
    }
    throw new Error("Unsupported condition operator");
  }

  static convertSongMetadataTagToMpdTag(tag: Song_MetadataTag): string {
    return Song_MetadataTag[tag].toLowerCase().replaceAll("_", "");
  }
}
