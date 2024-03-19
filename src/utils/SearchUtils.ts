import { FilterCondition, FilterConditionOperator } from "@/models/filter";
import { Search } from "@/models/search";
import { Song } from "@/models/song";

export type SearchConditions = {
  mpdConditions: FilterCondition[];
  nonMpdConditions: FilterCondition[];
};

export class SearchUtils {
  static convertSearchToConditions(search: Search): SearchConditions[] {
    return search.queries
      .map((query): SearchConditions => {
        const mpdConditions: FilterCondition[] = [];
        const nonMpdConditions: FilterCondition[] = [];
        for (const condition of query.conditions) {
          if (condition.value === undefined) {
            continue;
          }
          if (
            [
              FilterConditionOperator.CONTAIN,
              FilterConditionOperator.EQUAL,
              FilterConditionOperator.NOT_CONTAIN,
              FilterConditionOperator.NOT_EQUAL,
              FilterConditionOperator.REGEX,
            ].includes(condition.operator)
          ) {
            mpdConditions.push(condition);
          } else {
            nonMpdConditions.push(condition);
          }
        }
        return {
          mpdConditions,
          nonMpdConditions,
        };
      })
      .filter((v: SearchConditions) => {
        return v.mpdConditions.length + v.nonMpdConditions.length > 0;
      });
  }

  static mergeSongsList(songsList: Song[][]): Song[] {
    const all: [string, Song][] = songsList
      .flat()
      .map((song) => [song.path, song]);
    const unique = Array.from(new Map(all).values());
    return unique;
  }
}
