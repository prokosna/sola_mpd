import { FilterCondition } from "@sola_mpd/domain/src/models/filter_pb.js";

export type SearchConditions = {
  mpdConditions: FilterCondition[];
  nonMpdConditions: FilterCondition[];
};

export enum EditingSearchStatus {
  NOT_SAVED,
  COLUMNS_UPDATED,
  SAVED,
}
