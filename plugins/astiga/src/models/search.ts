/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { FilterCondition } from "./filter";
import { SongTableColumn } from "./song_table";

export const protobufPackage = "";

export interface Query {
  conditions: FilterCondition[];
}

export interface Search {
  name: string;
  queries: Query[];
  columns: SongTableColumn[];
}

export interface SavedSearches {
  searches: Search[];
}

export const _PACKAGE_NAME = "";

function createBaseQuery(): Query {
  return { conditions: [] };
}

export const Query = {
  encode(message: Query, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.conditions) {
      FilterCondition.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Query {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuery();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.conditions.push(FilterCondition.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Query {
    return {
      conditions: Array.isArray(object?.conditions)
        ? object.conditions.map((e: any) => FilterCondition.fromJSON(e))
        : [],
    };
  },

  toJSON(message: Query): unknown {
    const obj: any = {};
    if (message.conditions) {
      obj.conditions = message.conditions.map((e) => e ? FilterCondition.toJSON(e) : undefined);
    } else {
      obj.conditions = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Query>, I>>(base?: I): Query {
    return Query.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Query>, I>>(object: I): Query {
    const message = createBaseQuery();
    message.conditions = object.conditions?.map((e) => FilterCondition.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSearch(): Search {
  return { name: "", queries: [], columns: [] };
}

export const Search = {
  encode(message: Search, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    for (const v of message.queries) {
      Query.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.columns) {
      SongTableColumn.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Search {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.queries.push(Query.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.columns.push(SongTableColumn.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Search {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      queries: Array.isArray(object?.queries) ? object.queries.map((e: any) => Query.fromJSON(e)) : [],
      columns: Array.isArray(object?.columns) ? object.columns.map((e: any) => SongTableColumn.fromJSON(e)) : [],
    };
  },

  toJSON(message: Search): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    if (message.queries) {
      obj.queries = message.queries.map((e) => e ? Query.toJSON(e) : undefined);
    } else {
      obj.queries = [];
    }
    if (message.columns) {
      obj.columns = message.columns.map((e) => e ? SongTableColumn.toJSON(e) : undefined);
    } else {
      obj.columns = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Search>, I>>(base?: I): Search {
    return Search.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Search>, I>>(object: I): Search {
    const message = createBaseSearch();
    message.name = object.name ?? "";
    message.queries = object.queries?.map((e) => Query.fromPartial(e)) || [];
    message.columns = object.columns?.map((e) => SongTableColumn.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSavedSearches(): SavedSearches {
  return { searches: [] };
}

export const SavedSearches = {
  encode(message: SavedSearches, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.searches) {
      Search.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SavedSearches {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSavedSearches();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.searches.push(Search.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SavedSearches {
    return { searches: Array.isArray(object?.searches) ? object.searches.map((e: any) => Search.fromJSON(e)) : [] };
  },

  toJSON(message: SavedSearches): unknown {
    const obj: any = {};
    if (message.searches) {
      obj.searches = message.searches.map((e) => e ? Search.toJSON(e) : undefined);
    } else {
      obj.searches = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SavedSearches>, I>>(base?: I): SavedSearches {
    return SavedSearches.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<SavedSearches>, I>>(object: I): SavedSearches {
    const message = createBaseSavedSearches();
    message.searches = object.searches?.map((e) => Search.fromPartial(e)) || [];
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
