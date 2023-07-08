import { normalizeSync } from "normalize-diacritics";
import { v4 as uuidv4 } from "uuid";

import { SongUtils } from "./SongUtils";

import { FilterCondition, FilterConditionOperator } from "@/models/filter";
import { Song, SongMetadataValue } from "@/models/song";
import { SongTableColumn } from "@/models/song_table";

type ComparableSongMetadataValue = string | number;
type ComparableConditionValue = string | number | RegExp;

export class FilterUtils {
  static filterSongsByAndConditions(
    songs: Song[],
    conditions: FilterCondition[],
  ): Song[] {
    let filteredSongs = songs;
    for (const condition of conditions) {
      const conditionValue =
        this.convertFilterConditionToComparableValue(condition);
      filteredSongs = filteredSongs.filter((v) => {
        const songValue = this.convertSongMetadataValueToComparableValue(
          v.metadata[condition.tag],
        );
        return this.compareValues(
          songValue,
          conditionValue,
          condition.operator,
        );
      });
    }
    return filteredSongs;
  }

  static filterSongsByGlobalFilter(
    songs: Song[],
    tokens: string[],
    targetColumns: SongTableColumn[],
  ): Song[] {
    const conditionsGroup = this.convertGlobalFilterToConditions(
      tokens,
      targetColumns,
    );
    let filteredSongs = songs;
    for (const conditions of conditionsGroup) {
      const firstCondition = conditions[0];
      if (firstCondition === undefined) {
        continue;
      }
      const conditionValue =
        this.convertFilterConditionToComparableValue(firstCondition);

      // AND - A song should match to all the conditions
      filteredSongs = filteredSongs.filter((song) =>
        // OR - Any columns should match to the condition
        conditions.some((condition) => {
          const songValue = this.convertSongMetadataValueToComparableValue(
            song.metadata[condition.tag],
          );
          return this.compareValues(
            songValue,
            conditionValue,
            condition.operator,
          );
        }),
      );
    }
    return filteredSongs;
  }

  static convertOperatorToDisplayName(
    operator: FilterConditionOperator,
  ): string {
    switch (operator) {
      case FilterConditionOperator.UNKNOWN:
        return "unknown";
      case FilterConditionOperator.EQUAL:
        return "=";
      case FilterConditionOperator.NOT_EQUAL:
        return "!=";
      case FilterConditionOperator.CONTAIN:
        return "has";
      case FilterConditionOperator.NOT_CONTAIN:
        return "!has";
      case FilterConditionOperator.REGEX:
        return "=~";
      case FilterConditionOperator.LESS_THAN:
        return "<";
      case FilterConditionOperator.LESS_THAN_OR_EQUAL:
        return "<=";
      case FilterConditionOperator.GREATER_THAN:
        return ">";
      case FilterConditionOperator.GREATER_THAN_OR_EQUAL:
        return ">=";
    }
  }

  static convertDisplayNameToOperator(str: string): FilterConditionOperator {
    switch (str) {
      case "unknown":
        return FilterConditionOperator.UNKNOWN;
      case "=":
        return FilterConditionOperator.EQUAL;
      case "!=":
        return FilterConditionOperator.NOT_EQUAL;
      case "has":
        return FilterConditionOperator.CONTAIN;
      case "!has":
        return FilterConditionOperator.NOT_CONTAIN;
      case "=~":
        return FilterConditionOperator.REGEX;
      case "<":
        return FilterConditionOperator.LESS_THAN;
      case "<=":
        return FilterConditionOperator.LESS_THAN_OR_EQUAL;
      case ">":
        return FilterConditionOperator.GREATER_THAN;
      case ">=":
        return FilterConditionOperator.GREATER_THAN_OR_EQUAL;
      default:
        throw new Error(`Not supported operator: ${str}`);
    }
  }

  static listAllFilterConditionOperators(): FilterConditionOperator[] {
    return Object.keys(FilterConditionOperator)
      .filter((v) => isNaN(Number(v)))
      .map(
        (v) =>
          FilterConditionOperator[v as keyof typeof FilterConditionOperator],
      )
      .filter((v) => v !== FilterConditionOperator.UNKNOWN);
  }

  private static compareValues(
    songValue: ComparableSongMetadataValue | undefined,
    conditionValue: ComparableConditionValue | undefined,
    operator: FilterConditionOperator,
  ): boolean {
    if (songValue === undefined || conditionValue === undefined) {
      return true;
    }
    switch (operator) {
      case FilterConditionOperator.EQUAL:
        return songValue === String(conditionValue);
      case FilterConditionOperator.NOT_EQUAL:
        return songValue !== String(conditionValue);
      case FilterConditionOperator.CONTAIN:
        return String(songValue).includes(String(conditionValue));
      case FilterConditionOperator.NOT_CONTAIN:
        return !String(songValue).includes(String(conditionValue));
      case FilterConditionOperator.REGEX:
        if (conditionValue instanceof RegExp) {
          return conditionValue.test(String(songValue));
        }
        return true;
      case FilterConditionOperator.LESS_THAN:
        if (
          typeof songValue === "number" &&
          typeof conditionValue === "number"
        ) {
          return songValue < conditionValue;
        }
        return String(songValue) < String(conditionValue);
      case FilterConditionOperator.LESS_THAN_OR_EQUAL:
        if (
          typeof songValue === "number" &&
          typeof conditionValue === "number"
        ) {
          return songValue <= conditionValue;
        }
        return String(songValue) <= String(conditionValue);
      case FilterConditionOperator.GREATER_THAN:
        if (
          typeof songValue === "number" &&
          typeof conditionValue === "number"
        ) {
          return songValue > conditionValue;
        }
        return String(songValue) > String(conditionValue);
      case FilterConditionOperator.GREATER_THAN_OR_EQUAL:
        if (
          typeof songValue === "number" &&
          typeof conditionValue === "number"
        ) {
          return songValue >= conditionValue;
        }
        return String(songValue) >= String(conditionValue);
      case FilterConditionOperator.UNKNOWN:
      default:
        return true;
    }
  }

  private static convertSongMetadataValueToComparableValue(
    value: SongMetadataValue,
  ): ComparableSongMetadataValue | undefined {
    let songValue: undefined | string | number = undefined;
    const raw = value.value;
    switch (raw?.$case) {
      case "stringValue":
        songValue = raw.stringValue;
        if (songValue !== undefined) {
          songValue = normalizeSync(songValue);
        }
        songValue = songValue?.toLowerCase();
        break;
      case "format":
        songValue = SongUtils.convertAudioFormatToString(
          raw.format,
        ).toLowerCase();
        break;
      case "intValue":
        songValue = raw.intValue;
        break;
      case "floatValue":
        songValue = raw.floatValue;
        break;
      case "timestamp":
        const timestamp = raw.timestamp;
        songValue = timestamp.getTime();
        break;
    }
    return songValue;
  }

  private static convertFilterConditionToComparableValue(
    condition: FilterCondition,
  ): ComparableConditionValue | undefined {
    let conditionValue: undefined | number | string | RegExp = undefined;
    switch (condition.value?.value?.$case) {
      case "stringValue":
        conditionValue = condition.value.value.stringValue;
        if (conditionValue !== undefined) {
          conditionValue = normalizeSync(conditionValue);
        }
        conditionValue = conditionValue?.toLowerCase();
        break;
      case "format":
        conditionValue = SongUtils.convertSongMetadataValueToString(
          condition.value,
        ).toLowerCase();
        break;
      case "intValue":
        conditionValue = condition.value.value.intValue;
        break;
      case "floatValue":
        conditionValue = condition.value.value.floatValue;
        break;
      case "timestamp":
        const timestamp = condition.value.value.timestamp;
        conditionValue = timestamp.getTime();
        break;
    }
    if (
      condition.operator === FilterConditionOperator.REGEX &&
      conditionValue !== undefined
    ) {
      conditionValue = new RegExp(String(conditionValue));
    }
    return conditionValue;
  }

  private static convertGlobalFilterToConditions(
    tokens: string[],
    targetColumns: SongTableColumn[],
  ): FilterCondition[][] {
    return tokens.map((token) =>
      targetColumns.map((column) => {
        return FilterCondition.create({
          uuid: uuidv4(),
          tag: column.tag,
          value: SongMetadataValue.create({
            value: {
              $case: "stringValue",
              stringValue: token,
            },
          }),
          operator: FilterConditionOperator.CONTAIN,
        });
      }),
    );
  }
}
