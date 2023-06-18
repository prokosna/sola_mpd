import { SongUtils } from "./SongUtils";

import { ENDPOINT_MPD_COMMAND, ENDPOINT_MPD_COMMAND_BULK } from "@/const";
import { FilterCondition, FilterConditionOperator } from "@/models/filter";
import {
  MpdRequest,
  MpdRequestBulk,
  MpdResponse,
} from "@/models/mpd/mpd_command";
import { SongMetadataTag } from "@/models/song";

export class MpdUtils {
  static async command(req: MpdRequest): Promise<MpdResponse> {
    const data = MpdRequest.encode(req).finish();
    const ret = await fetch(ENDPOINT_MPD_COMMAND, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: data,
    });
    if (!ret.ok) {
      const body = await ret.text();
      throw new Error(`POST failed: ${body}`);
    }
    const bytes = await ret.arrayBuffer();
    const res = MpdResponse.decode(new Uint8Array(bytes));
    return res;
  }

  static async commandBulk(requests: MpdRequest[]): Promise<void> {
    const req = MpdRequestBulk.create({ requests });
    const data = MpdRequestBulk.encode(req).finish();
    const ret = await fetch(ENDPOINT_MPD_COMMAND_BULK, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: data,
    });
    if (!ret.ok) {
      const body = await ret.text();
      throw new Error(`POST failed: ${body}`);
    }
    return;
  }

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
    const left = condition.tag.replaceAll("_", "").toLowerCase();
    const right = this.escapeConditionArg(
      SongUtils.convertSongMetadataValueToString(condition.value)
    );
    switch (condition.operator) {
      case FilterConditionOperator.EQUAL:
        return `${left} == "${right}"`;
      case FilterConditionOperator.NOT_EQUAL:
        return `${left} != "${right}"`;
      case FilterConditionOperator.CONTAIN:
        return `${left} contains "${right}"`;
      case FilterConditionOperator.NOT_CONTAIN:
        return `!(${left} contains "${right}")`;
      case FilterConditionOperator.REGEX:
        return `${left} =~ "${right}"`;
    }
    throw new Error("Unsupported condition operator");
  }

  static convertSongMetadataTagToMpdTag(tag: SongMetadataTag): string {
    return tag.toLowerCase().replaceAll("_", "");
  }
}
