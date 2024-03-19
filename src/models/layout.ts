/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "";

export interface FileExploreLayout {
  sidePaneWidth: number;
}

export interface SearchLayout {
  sidePaneWidth: number;
}

export interface BrowserLayout {
  sidePaneWidth: number;
}

export interface PlaylistLayout {
  sidePaneWidth: number;
}

export interface LayoutState {
  fileExploreLayout: FileExploreLayout | undefined;
  searchLayout: SearchLayout | undefined;
  browserLayout: BrowserLayout | undefined;
  playlistLayout: PlaylistLayout | undefined;
}

function createBaseFileExploreLayout(): FileExploreLayout {
  return { sidePaneWidth: 0 };
}

export const FileExploreLayout = {
  encode(message: FileExploreLayout, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sidePaneWidth !== 0) {
      writer.uint32(13).float(message.sidePaneWidth);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FileExploreLayout {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFileExploreLayout();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.sidePaneWidth = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FileExploreLayout {
    return { sidePaneWidth: isSet(object.sidePaneWidth) ? Number(object.sidePaneWidth) : 0 };
  },

  toJSON(message: FileExploreLayout): unknown {
    const obj: any = {};
    if (message.sidePaneWidth !== 0) {
      obj.sidePaneWidth = message.sidePaneWidth;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<FileExploreLayout>, I>>(base?: I): FileExploreLayout {
    return FileExploreLayout.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<FileExploreLayout>, I>>(object: I): FileExploreLayout {
    const message = createBaseFileExploreLayout();
    message.sidePaneWidth = object.sidePaneWidth ?? 0;
    return message;
  },
};

function createBaseSearchLayout(): SearchLayout {
  return { sidePaneWidth: 0 };
}

export const SearchLayout = {
  encode(message: SearchLayout, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sidePaneWidth !== 0) {
      writer.uint32(13).float(message.sidePaneWidth);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchLayout {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearchLayout();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.sidePaneWidth = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SearchLayout {
    return { sidePaneWidth: isSet(object.sidePaneWidth) ? Number(object.sidePaneWidth) : 0 };
  },

  toJSON(message: SearchLayout): unknown {
    const obj: any = {};
    if (message.sidePaneWidth !== 0) {
      obj.sidePaneWidth = message.sidePaneWidth;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SearchLayout>, I>>(base?: I): SearchLayout {
    return SearchLayout.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<SearchLayout>, I>>(object: I): SearchLayout {
    const message = createBaseSearchLayout();
    message.sidePaneWidth = object.sidePaneWidth ?? 0;
    return message;
  },
};

function createBaseBrowserLayout(): BrowserLayout {
  return { sidePaneWidth: 0 };
}

export const BrowserLayout = {
  encode(message: BrowserLayout, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sidePaneWidth !== 0) {
      writer.uint32(13).float(message.sidePaneWidth);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BrowserLayout {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBrowserLayout();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.sidePaneWidth = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BrowserLayout {
    return { sidePaneWidth: isSet(object.sidePaneWidth) ? Number(object.sidePaneWidth) : 0 };
  },

  toJSON(message: BrowserLayout): unknown {
    const obj: any = {};
    if (message.sidePaneWidth !== 0) {
      obj.sidePaneWidth = message.sidePaneWidth;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<BrowserLayout>, I>>(base?: I): BrowserLayout {
    return BrowserLayout.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BrowserLayout>, I>>(object: I): BrowserLayout {
    const message = createBaseBrowserLayout();
    message.sidePaneWidth = object.sidePaneWidth ?? 0;
    return message;
  },
};

function createBasePlaylistLayout(): PlaylistLayout {
  return { sidePaneWidth: 0 };
}

export const PlaylistLayout = {
  encode(message: PlaylistLayout, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sidePaneWidth !== 0) {
      writer.uint32(13).float(message.sidePaneWidth);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlaylistLayout {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlaylistLayout();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.sidePaneWidth = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PlaylistLayout {
    return { sidePaneWidth: isSet(object.sidePaneWidth) ? Number(object.sidePaneWidth) : 0 };
  },

  toJSON(message: PlaylistLayout): unknown {
    const obj: any = {};
    if (message.sidePaneWidth !== 0) {
      obj.sidePaneWidth = message.sidePaneWidth;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PlaylistLayout>, I>>(base?: I): PlaylistLayout {
    return PlaylistLayout.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PlaylistLayout>, I>>(object: I): PlaylistLayout {
    const message = createBasePlaylistLayout();
    message.sidePaneWidth = object.sidePaneWidth ?? 0;
    return message;
  },
};

function createBaseLayoutState(): LayoutState {
  return { fileExploreLayout: undefined, searchLayout: undefined, browserLayout: undefined, playlistLayout: undefined };
}

export const LayoutState = {
  encode(message: LayoutState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.fileExploreLayout !== undefined) {
      FileExploreLayout.encode(message.fileExploreLayout, writer.uint32(10).fork()).ldelim();
    }
    if (message.searchLayout !== undefined) {
      SearchLayout.encode(message.searchLayout, writer.uint32(18).fork()).ldelim();
    }
    if (message.browserLayout !== undefined) {
      BrowserLayout.encode(message.browserLayout, writer.uint32(26).fork()).ldelim();
    }
    if (message.playlistLayout !== undefined) {
      PlaylistLayout.encode(message.playlistLayout, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LayoutState {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLayoutState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.fileExploreLayout = FileExploreLayout.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.searchLayout = SearchLayout.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.browserLayout = BrowserLayout.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.playlistLayout = PlaylistLayout.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): LayoutState {
    return {
      fileExploreLayout: isSet(object.fileExploreLayout)
        ? FileExploreLayout.fromJSON(object.fileExploreLayout)
        : undefined,
      searchLayout: isSet(object.searchLayout) ? SearchLayout.fromJSON(object.searchLayout) : undefined,
      browserLayout: isSet(object.browserLayout) ? BrowserLayout.fromJSON(object.browserLayout) : undefined,
      playlistLayout: isSet(object.playlistLayout) ? PlaylistLayout.fromJSON(object.playlistLayout) : undefined,
    };
  },

  toJSON(message: LayoutState): unknown {
    const obj: any = {};
    if (message.fileExploreLayout !== undefined) {
      obj.fileExploreLayout = FileExploreLayout.toJSON(message.fileExploreLayout);
    }
    if (message.searchLayout !== undefined) {
      obj.searchLayout = SearchLayout.toJSON(message.searchLayout);
    }
    if (message.browserLayout !== undefined) {
      obj.browserLayout = BrowserLayout.toJSON(message.browserLayout);
    }
    if (message.playlistLayout !== undefined) {
      obj.playlistLayout = PlaylistLayout.toJSON(message.playlistLayout);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<LayoutState>, I>>(base?: I): LayoutState {
    return LayoutState.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<LayoutState>, I>>(object: I): LayoutState {
    const message = createBaseLayoutState();
    message.fileExploreLayout = (object.fileExploreLayout !== undefined && object.fileExploreLayout !== null)
      ? FileExploreLayout.fromPartial(object.fileExploreLayout)
      : undefined;
    message.searchLayout = (object.searchLayout !== undefined && object.searchLayout !== null)
      ? SearchLayout.fromPartial(object.searchLayout)
      : undefined;
    message.browserLayout = (object.browserLayout !== undefined && object.browserLayout !== null)
      ? BrowserLayout.fromPartial(object.browserLayout)
      : undefined;
    message.playlistLayout = (object.playlistLayout !== undefined && object.playlistLayout !== null)
      ? PlaylistLayout.fromPartial(object.playlistLayout)
      : undefined;
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
