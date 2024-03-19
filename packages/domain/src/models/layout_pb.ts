// @generated by protoc-gen-es v1.8.0 with parameter "target=ts"
// @generated from file layout.proto (syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from message FileExploreLayout
 */
export class FileExploreLayout extends Message<FileExploreLayout> {
  /**
   * @generated from field: float side_pane_width = 1;
   */
  sidePaneWidth = 0;

  constructor(data?: PartialMessage<FileExploreLayout>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "FileExploreLayout";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "side_pane_width", kind: "scalar", T: 2 /* ScalarType.FLOAT */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): FileExploreLayout {
    return new FileExploreLayout().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): FileExploreLayout {
    return new FileExploreLayout().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): FileExploreLayout {
    return new FileExploreLayout().fromJsonString(jsonString, options);
  }

  static equals(a: FileExploreLayout | PlainMessage<FileExploreLayout> | undefined, b: FileExploreLayout | PlainMessage<FileExploreLayout> | undefined): boolean {
    return proto3.util.equals(FileExploreLayout, a, b);
  }
}

/**
 * @generated from message SearchLayout
 */
export class SearchLayout extends Message<SearchLayout> {
  /**
   * @generated from field: float side_pane_width = 1;
   */
  sidePaneWidth = 0;

  constructor(data?: PartialMessage<SearchLayout>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "SearchLayout";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "side_pane_width", kind: "scalar", T: 2 /* ScalarType.FLOAT */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SearchLayout {
    return new SearchLayout().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SearchLayout {
    return new SearchLayout().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SearchLayout {
    return new SearchLayout().fromJsonString(jsonString, options);
  }

  static equals(a: SearchLayout | PlainMessage<SearchLayout> | undefined, b: SearchLayout | PlainMessage<SearchLayout> | undefined): boolean {
    return proto3.util.equals(SearchLayout, a, b);
  }
}

/**
 * @generated from message BrowserLayout
 */
export class BrowserLayout extends Message<BrowserLayout> {
  /**
   * @generated from field: float side_pane_width = 1;
   */
  sidePaneWidth = 0;

  constructor(data?: PartialMessage<BrowserLayout>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "BrowserLayout";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "side_pane_width", kind: "scalar", T: 2 /* ScalarType.FLOAT */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): BrowserLayout {
    return new BrowserLayout().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): BrowserLayout {
    return new BrowserLayout().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): BrowserLayout {
    return new BrowserLayout().fromJsonString(jsonString, options);
  }

  static equals(a: BrowserLayout | PlainMessage<BrowserLayout> | undefined, b: BrowserLayout | PlainMessage<BrowserLayout> | undefined): boolean {
    return proto3.util.equals(BrowserLayout, a, b);
  }
}

/**
 * @generated from message PlaylistLayout
 */
export class PlaylistLayout extends Message<PlaylistLayout> {
  /**
   * @generated from field: float side_pane_width = 1;
   */
  sidePaneWidth = 0;

  constructor(data?: PartialMessage<PlaylistLayout>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "PlaylistLayout";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "side_pane_width", kind: "scalar", T: 2 /* ScalarType.FLOAT */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PlaylistLayout {
    return new PlaylistLayout().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PlaylistLayout {
    return new PlaylistLayout().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PlaylistLayout {
    return new PlaylistLayout().fromJsonString(jsonString, options);
  }

  static equals(a: PlaylistLayout | PlainMessage<PlaylistLayout> | undefined, b: PlaylistLayout | PlainMessage<PlaylistLayout> | undefined): boolean {
    return proto3.util.equals(PlaylistLayout, a, b);
  }
}

/**
 * @generated from message LayoutState
 */
export class LayoutState extends Message<LayoutState> {
  /**
   * @generated from field: FileExploreLayout file_explore_layout = 1;
   */
  fileExploreLayout?: FileExploreLayout;

  /**
   * @generated from field: SearchLayout search_layout = 2;
   */
  searchLayout?: SearchLayout;

  /**
   * @generated from field: BrowserLayout browser_layout = 3;
   */
  browserLayout?: BrowserLayout;

  /**
   * @generated from field: PlaylistLayout playlist_layout = 4;
   */
  playlistLayout?: PlaylistLayout;

  constructor(data?: PartialMessage<LayoutState>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "LayoutState";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "file_explore_layout", kind: "message", T: FileExploreLayout },
    { no: 2, name: "search_layout", kind: "message", T: SearchLayout },
    { no: 3, name: "browser_layout", kind: "message", T: BrowserLayout },
    { no: 4, name: "playlist_layout", kind: "message", T: PlaylistLayout },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): LayoutState {
    return new LayoutState().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): LayoutState {
    return new LayoutState().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): LayoutState {
    return new LayoutState().fromJsonString(jsonString, options);
  }

  static equals(a: LayoutState | PlainMessage<LayoutState> | undefined, b: LayoutState | PlainMessage<LayoutState> | undefined): boolean {
    return proto3.util.equals(LayoutState, a, b);
  }
}
