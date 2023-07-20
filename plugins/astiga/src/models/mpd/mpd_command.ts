/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Folder } from "../file_explore";
import { FilterCondition } from "../filter";
import { Playlist } from "../playlist";
import {
  Song,
  SongMetadataTag,
  songMetadataTagFromJSON,
  songMetadataTagToJSON,
  songMetadataTagToNumber,
} from "../song";
import { MpdOutputDevice } from "./mpd_output";
import { MpdPlayerStatus, MpdPlayerVolume } from "./mpd_player";
import { MpdProfile } from "./mpd_profile";
import { MpdStats } from "./mpd_stats";

export const protobufPackage = "";

export interface MpdCommand {
}

export interface MpdCommandConnection {
}

export interface MpdCommandConnectionPingRequest {
}

export interface MpdCommandConnectionPingResponse {
  version: string;
}

export interface MpdCommandControl {
}

export interface MpdCommandControlNextRequest {
}

export interface MpdCommandControlNextResponse {
}

export interface MpdCommandControlPauseRequest {
  pause: boolean;
}

export interface MpdCommandControlPauseResponse {
}

export interface MpdCommandControlPlayRequest {
  target?: { $case: "pos"; pos: string } | { $case: "id"; id: string } | undefined;
}

export interface MpdCommandControlPlayResponse {
}

export interface MpdCommandControlPreviousRequest {
}

export interface MpdCommandControlPreviousResponse {
}

export interface MpdCommandControlSeekRequest {
  time: number;
  target?:
    | { $case: "pos"; pos: string }
    | { $case: "id"; id: string }
    | { $case: "current"; current: boolean }
    | undefined;
}

export interface MpdCommandControlSeekResponse {
}

export interface MpdCommandControlStopRequest {
}

export interface MpdCommandControlStopResponse {
}

export interface MpdCommandPlayback {
}

export interface MpdCommandPlaybackConsumeRequest {
  enable: boolean;
}

export interface MpdCommandPlaybackConsumeResponse {
}

export interface MpdCommandPlaybackRandomRequest {
  enable: boolean;
}

export interface MpdCommandPlaybackRandomResponse {
}

export interface MpdCommandPlaybackRepeatRequest {
  enable: boolean;
}

export interface MpdCommandPlaybackRepeatResponse {
}

export interface MpdCommandPlaybackSetVolRequest {
  vol: number;
}

export interface MpdCommandPlaybackSetVolResponse {
}

export interface MpdCommandPlaybackGetVolRequest {
}

export interface MpdCommandPlaybackGetVolResponse {
  vol: MpdPlayerVolume | undefined;
}

export interface MpdCommandPlaybackSingleRequest {
  enable: boolean;
}

export interface MpdCommandPlaybackSingleResponse {
}

export interface MpdCommandStatus {
}

export interface MpdCommandStatusCurrentSongRequest {
}

export interface MpdCommandStatusCurrentSongResponse {
  song: Song | undefined;
}

export interface MpdCommandStatusStatusRequest {
}

export interface MpdCommandStatusStatusResponse {
  status: MpdPlayerStatus | undefined;
}

export interface MpdCommandStatusStatsRequest {
}

export interface MpdCommandStatusStatsResponse {
  stats: MpdStats | undefined;
}

export interface MpdCommandQueue {
}

export interface MpdCommandQueueAddRequest {
  uri: string;
}

export interface MpdCommandQueueAddResponse {
}

export interface MpdCommandQueueClearRequest {
}

export interface MpdCommandQueueClearResponse {
}

export interface MpdCommandQueueDeleteRequest {
  target?: { $case: "pos"; pos: string } | { $case: "id"; id: string } | undefined;
}

export interface MpdCommandQueueDeleteResponse {
}

export interface MpdCommandQueueMoveRequest {
  from?: { $case: "fromPos"; fromPos: string } | { $case: "fromId"; fromId: string } | undefined;
  to: string;
}

export interface MpdCommandQueueMoveResponse {
}

export interface MpdCommandQueuePlaylistInfoRequest {
}

export interface MpdCommandQueuePlaylistInfoResponse {
  songs: Song[];
}

export interface MpdCommandQueueShuffleRequest {
}

export interface MpdCommandQueueShuffleResponse {
}

export interface MpdCommandStoredPlaylist {
}

export interface MpdCommandStoredPlaylistListPlaylistInfoRequest {
  name: string;
}

export interface MpdCommandStoredPlaylistListPlaylistInfoResponse {
  songs: Song[];
}

export interface MpdCommandStoredPlaylistListPlaylistsRequest {
}

export interface MpdCommandStoredPlaylistListPlaylistsResponse {
  playlists: Playlist[];
}

export interface MpdCommandStoredPlaylistPlaylistAddRequest {
  name: string;
  uri: string;
}

export interface MpdCommandStoredPlaylistPlaylistAddResponse {
}

export interface MpdCommandStoredPlaylistPlaylistClearRequest {
  name: string;
}

export interface MpdCommandStoredPlaylistPlaylistClearResponse {
}

export interface MpdCommandStoredPlaylistPlaylistDeleteRequest {
  name: string;
  pos: string;
}

export interface MpdCommandStoredPlaylistPlaylistDeleteResponse {
}

export interface MpdCommandStoredPlaylistPlaylistMoveRequest {
  name: string;
  from: string;
  to: string;
}

export interface MpdCommandStoredPlaylistPlaylistMoveResponse {
}

export interface MpdCommandStoredPlaylistRenameRequest {
  name: string;
  newName: string;
}

export interface MpdCommandStoredPlaylistRenameResponse {
}

export interface MpdCommandStoredPlaylistRemoveRequest {
  name: string;
}

export interface MpdCommandStoredPlaylistRemoveResponse {
}

export interface MpdCommandStoredPlaylistSaveRequest {
  name: string;
}

export interface MpdCommandStoredPlaylistSaveResponse {
}

export interface MpdCommandDatabase {
}

export interface MpdCommandDatabaseListRequest {
  tag: SongMetadataTag;
  conditions: FilterCondition[];
}

export interface MpdCommandDatabaseListResponse {
  values: string[];
}

export interface MpdCommandDatabaseSearchRequest {
  conditions: FilterCondition[];
}

export interface MpdCommandDatabaseSearchResponse {
  songs: Song[];
}

export interface MpdCommandDatabaseUpdateRequest {
}

export interface MpdCommandDatabaseUpdateResponse {
}

export interface MpdCommandAudio {
}

export interface MpdCommandAudioOutputsRequest {
}

export interface MpdCommandAudioOutputsResponse {
  devices: MpdOutputDevice[];
}

export interface MpdCommandUtility {
}

export interface MpdCommandUtilityListAllSongsRequest {
}

export interface MpdCommandUtilityListAllSongsResponse {
  songs: Song[];
}

export interface MpdCommandUtilityListAllFoldersRequest {
}

export interface MpdCommandUtilityListAllFoldersResponse {
  folders: Folder[];
}

export interface MpdCommandUtilityListSongsInFolderRequest {
  folder: Folder | undefined;
}

export interface MpdCommandUtilityListSongsInFolderResponse {
  songs: Song[];
}

export interface MpdRequest {
  profile: MpdProfile | undefined;
  command?:
    | { $case: "ping"; ping: MpdCommandConnectionPingRequest }
    | { $case: "next"; next: MpdCommandControlNextRequest }
    | { $case: "pause"; pause: MpdCommandControlPauseRequest }
    | { $case: "play"; play: MpdCommandControlPlayRequest }
    | { $case: "previous"; previous: MpdCommandControlPreviousRequest }
    | { $case: "seek"; seek: MpdCommandControlSeekRequest }
    | { $case: "stop"; stop: MpdCommandControlStopRequest }
    | { $case: "consume"; consume: MpdCommandPlaybackConsumeRequest }
    | { $case: "random"; random: MpdCommandPlaybackRandomRequest }
    | { $case: "repeat"; repeat: MpdCommandPlaybackRepeatRequest }
    | { $case: "setvol"; setvol: MpdCommandPlaybackSetVolRequest }
    | { $case: "getvol"; getvol: MpdCommandPlaybackGetVolRequest }
    | { $case: "single"; single: MpdCommandPlaybackSingleRequest }
    | { $case: "currentsong"; currentsong: MpdCommandStatusCurrentSongRequest }
    | { $case: "status"; status: MpdCommandStatusStatusRequest }
    | { $case: "stats"; stats: MpdCommandStatusStatsRequest }
    | { $case: "add"; add: MpdCommandQueueAddRequest }
    | { $case: "clear"; clear: MpdCommandQueueClearRequest }
    | { $case: "delete"; delete: MpdCommandQueueDeleteRequest }
    | { $case: "move"; move: MpdCommandQueueMoveRequest }
    | { $case: "playlistinfo"; playlistinfo: MpdCommandQueuePlaylistInfoRequest }
    | { $case: "shuffle"; shuffle: MpdCommandQueueShuffleRequest }
    | { $case: "listplaylistinfo"; listplaylistinfo: MpdCommandStoredPlaylistListPlaylistInfoRequest }
    | { $case: "listplaylists"; listplaylists: MpdCommandStoredPlaylistListPlaylistsRequest }
    | { $case: "playlistadd"; playlistadd: MpdCommandStoredPlaylistPlaylistAddRequest }
    | { $case: "playlistclear"; playlistclear: MpdCommandStoredPlaylistPlaylistClearRequest }
    | { $case: "playlistdelete"; playlistdelete: MpdCommandStoredPlaylistPlaylistDeleteRequest }
    | { $case: "playlistmove"; playlistmove: MpdCommandStoredPlaylistPlaylistMoveRequest }
    | { $case: "rename"; rename: MpdCommandStoredPlaylistRenameRequest }
    | { $case: "rm"; rm: MpdCommandStoredPlaylistRemoveRequest }
    | { $case: "save"; save: MpdCommandStoredPlaylistSaveRequest }
    | { $case: "list"; list: MpdCommandDatabaseListRequest }
    | { $case: "search"; search: MpdCommandDatabaseSearchRequest }
    | { $case: "update"; update: MpdCommandDatabaseUpdateRequest }
    | { $case: "outputs"; outputs: MpdCommandAudioOutputsRequest }
    | { $case: "listAllSongs"; listAllSongs: MpdCommandUtilityListAllSongsRequest }
    | { $case: "listAllFolders"; listAllFolders: MpdCommandUtilityListAllFoldersRequest }
    | { $case: "listSongsInFolder"; listSongsInFolder: MpdCommandUtilityListSongsInFolderRequest }
    | undefined;
}

export interface MpdRequestBulk {
  requests: MpdRequest[];
}

export interface MpdResponse {
  command?:
    | { $case: "ping"; ping: MpdCommandConnectionPingResponse }
    | { $case: "next"; next: MpdCommandControlNextResponse }
    | { $case: "pause"; pause: MpdCommandControlPauseResponse }
    | { $case: "play"; play: MpdCommandControlPlayResponse }
    | { $case: "previous"; previous: MpdCommandControlPreviousResponse }
    | { $case: "seek"; seek: MpdCommandControlSeekResponse }
    | { $case: "stop"; stop: MpdCommandControlStopResponse }
    | { $case: "consume"; consume: MpdCommandPlaybackConsumeResponse }
    | { $case: "random"; random: MpdCommandPlaybackRandomResponse }
    | { $case: "repeat"; repeat: MpdCommandPlaybackRepeatResponse }
    | { $case: "setvol"; setvol: MpdCommandPlaybackSetVolResponse }
    | { $case: "getvol"; getvol: MpdCommandPlaybackGetVolResponse }
    | { $case: "single"; single: MpdCommandPlaybackSingleResponse }
    | { $case: "currentsong"; currentsong: MpdCommandStatusCurrentSongResponse }
    | { $case: "status"; status: MpdCommandStatusStatusResponse }
    | { $case: "stats"; stats: MpdCommandStatusStatsResponse }
    | { $case: "add"; add: MpdCommandQueueAddResponse }
    | { $case: "clear"; clear: MpdCommandQueueClearResponse }
    | { $case: "delete"; delete: MpdCommandQueueDeleteResponse }
    | { $case: "move"; move: MpdCommandQueueMoveResponse }
    | { $case: "playlistinfo"; playlistinfo: MpdCommandQueuePlaylistInfoResponse }
    | { $case: "shuffle"; shuffle: MpdCommandQueueShuffleResponse }
    | { $case: "listplaylistinfo"; listplaylistinfo: MpdCommandStoredPlaylistListPlaylistInfoResponse }
    | { $case: "listplaylists"; listplaylists: MpdCommandStoredPlaylistListPlaylistsResponse }
    | { $case: "playlistadd"; playlistadd: MpdCommandStoredPlaylistPlaylistAddResponse }
    | { $case: "playlistclear"; playlistclear: MpdCommandStoredPlaylistPlaylistClearResponse }
    | { $case: "playlistdelete"; playlistdelete: MpdCommandStoredPlaylistPlaylistDeleteResponse }
    | { $case: "playlistmove"; playlistmove: MpdCommandStoredPlaylistPlaylistMoveResponse }
    | { $case: "rename"; rename: MpdCommandStoredPlaylistRenameResponse }
    | { $case: "rm"; rm: MpdCommandStoredPlaylistRemoveResponse }
    | { $case: "save"; save: MpdCommandStoredPlaylistSaveResponse }
    | { $case: "list"; list: MpdCommandDatabaseListResponse }
    | { $case: "search"; search: MpdCommandDatabaseSearchResponse }
    | { $case: "update"; update: MpdCommandDatabaseUpdateResponse }
    | { $case: "outputs"; outputs: MpdCommandAudioOutputsResponse }
    | { $case: "listAllSongs"; listAllSongs: MpdCommandUtilityListAllSongsResponse }
    | { $case: "listAllFolders"; listAllFolders: MpdCommandUtilityListAllFoldersResponse }
    | { $case: "listSongsInFolder"; listSongsInFolder: MpdCommandUtilityListSongsInFolderResponse }
    | undefined;
}

export const _PACKAGE_NAME = "";

function createBaseMpdCommand(): MpdCommand {
  return {};
}

export const MpdCommand = {
  encode(_: MpdCommand, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommand {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommand();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommand {
    return {};
  },

  toJSON(_: MpdCommand): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommand>, I>>(base?: I): MpdCommand {
    return MpdCommand.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommand>, I>>(_: I): MpdCommand {
    const message = createBaseMpdCommand();
    return message;
  },
};

function createBaseMpdCommandConnection(): MpdCommandConnection {
  return {};
}

export const MpdCommandConnection = {
  encode(_: MpdCommandConnection, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandConnection {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandConnection();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandConnection {
    return {};
  },

  toJSON(_: MpdCommandConnection): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandConnection>, I>>(base?: I): MpdCommandConnection {
    return MpdCommandConnection.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandConnection>, I>>(_: I): MpdCommandConnection {
    const message = createBaseMpdCommandConnection();
    return message;
  },
};

function createBaseMpdCommandConnectionPingRequest(): MpdCommandConnectionPingRequest {
  return {};
}

export const MpdCommandConnectionPingRequest = {
  encode(_: MpdCommandConnectionPingRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandConnectionPingRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandConnectionPingRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandConnectionPingRequest {
    return {};
  },

  toJSON(_: MpdCommandConnectionPingRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandConnectionPingRequest>, I>>(base?: I): MpdCommandConnectionPingRequest {
    return MpdCommandConnectionPingRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandConnectionPingRequest>, I>>(_: I): MpdCommandConnectionPingRequest {
    const message = createBaseMpdCommandConnectionPingRequest();
    return message;
  },
};

function createBaseMpdCommandConnectionPingResponse(): MpdCommandConnectionPingResponse {
  return { version: "" };
}

export const MpdCommandConnectionPingResponse = {
  encode(message: MpdCommandConnectionPingResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.version !== "") {
      writer.uint32(10).string(message.version);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandConnectionPingResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandConnectionPingResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.version = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandConnectionPingResponse {
    return { version: isSet(object.version) ? String(object.version) : "" };
  },

  toJSON(message: MpdCommandConnectionPingResponse): unknown {
    const obj: any = {};
    if (message.version !== "") {
      obj.version = message.version;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandConnectionPingResponse>, I>>(
    base?: I,
  ): MpdCommandConnectionPingResponse {
    return MpdCommandConnectionPingResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandConnectionPingResponse>, I>>(
    object: I,
  ): MpdCommandConnectionPingResponse {
    const message = createBaseMpdCommandConnectionPingResponse();
    message.version = object.version ?? "";
    return message;
  },
};

function createBaseMpdCommandControl(): MpdCommandControl {
  return {};
}

export const MpdCommandControl = {
  encode(_: MpdCommandControl, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandControl {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandControl();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandControl {
    return {};
  },

  toJSON(_: MpdCommandControl): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandControl>, I>>(base?: I): MpdCommandControl {
    return MpdCommandControl.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandControl>, I>>(_: I): MpdCommandControl {
    const message = createBaseMpdCommandControl();
    return message;
  },
};

function createBaseMpdCommandControlNextRequest(): MpdCommandControlNextRequest {
  return {};
}

export const MpdCommandControlNextRequest = {
  encode(_: MpdCommandControlNextRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandControlNextRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandControlNextRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandControlNextRequest {
    return {};
  },

  toJSON(_: MpdCommandControlNextRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandControlNextRequest>, I>>(base?: I): MpdCommandControlNextRequest {
    return MpdCommandControlNextRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandControlNextRequest>, I>>(_: I): MpdCommandControlNextRequest {
    const message = createBaseMpdCommandControlNextRequest();
    return message;
  },
};

function createBaseMpdCommandControlNextResponse(): MpdCommandControlNextResponse {
  return {};
}

export const MpdCommandControlNextResponse = {
  encode(_: MpdCommandControlNextResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandControlNextResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandControlNextResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandControlNextResponse {
    return {};
  },

  toJSON(_: MpdCommandControlNextResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandControlNextResponse>, I>>(base?: I): MpdCommandControlNextResponse {
    return MpdCommandControlNextResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandControlNextResponse>, I>>(_: I): MpdCommandControlNextResponse {
    const message = createBaseMpdCommandControlNextResponse();
    return message;
  },
};

function createBaseMpdCommandControlPauseRequest(): MpdCommandControlPauseRequest {
  return { pause: false };
}

export const MpdCommandControlPauseRequest = {
  encode(message: MpdCommandControlPauseRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.pause === true) {
      writer.uint32(8).bool(message.pause);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandControlPauseRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandControlPauseRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.pause = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandControlPauseRequest {
    return { pause: isSet(object.pause) ? Boolean(object.pause) : false };
  },

  toJSON(message: MpdCommandControlPauseRequest): unknown {
    const obj: any = {};
    if (message.pause === true) {
      obj.pause = message.pause;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandControlPauseRequest>, I>>(base?: I): MpdCommandControlPauseRequest {
    return MpdCommandControlPauseRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandControlPauseRequest>, I>>(
    object: I,
  ): MpdCommandControlPauseRequest {
    const message = createBaseMpdCommandControlPauseRequest();
    message.pause = object.pause ?? false;
    return message;
  },
};

function createBaseMpdCommandControlPauseResponse(): MpdCommandControlPauseResponse {
  return {};
}

export const MpdCommandControlPauseResponse = {
  encode(_: MpdCommandControlPauseResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandControlPauseResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandControlPauseResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandControlPauseResponse {
    return {};
  },

  toJSON(_: MpdCommandControlPauseResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandControlPauseResponse>, I>>(base?: I): MpdCommandControlPauseResponse {
    return MpdCommandControlPauseResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandControlPauseResponse>, I>>(_: I): MpdCommandControlPauseResponse {
    const message = createBaseMpdCommandControlPauseResponse();
    return message;
  },
};

function createBaseMpdCommandControlPlayRequest(): MpdCommandControlPlayRequest {
  return { target: undefined };
}

export const MpdCommandControlPlayRequest = {
  encode(message: MpdCommandControlPlayRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    switch (message.target?.$case) {
      case "pos":
        writer.uint32(10).string(message.target.pos);
        break;
      case "id":
        writer.uint32(18).string(message.target.id);
        break;
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandControlPlayRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandControlPlayRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.target = { $case: "pos", pos: reader.string() };
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.target = { $case: "id", id: reader.string() };
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandControlPlayRequest {
    return {
      target: isSet(object.pos)
        ? { $case: "pos", pos: String(object.pos) }
        : isSet(object.id)
        ? { $case: "id", id: String(object.id) }
        : undefined,
    };
  },

  toJSON(message: MpdCommandControlPlayRequest): unknown {
    const obj: any = {};
    if (message.target?.$case === "pos") {
      obj.pos = message.target.pos;
    }
    if (message.target?.$case === "id") {
      obj.id = message.target.id;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandControlPlayRequest>, I>>(base?: I): MpdCommandControlPlayRequest {
    return MpdCommandControlPlayRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandControlPlayRequest>, I>>(object: I): MpdCommandControlPlayRequest {
    const message = createBaseMpdCommandControlPlayRequest();
    if (object.target?.$case === "pos" && object.target?.pos !== undefined && object.target?.pos !== null) {
      message.target = { $case: "pos", pos: object.target.pos };
    }
    if (object.target?.$case === "id" && object.target?.id !== undefined && object.target?.id !== null) {
      message.target = { $case: "id", id: object.target.id };
    }
    return message;
  },
};

function createBaseMpdCommandControlPlayResponse(): MpdCommandControlPlayResponse {
  return {};
}

export const MpdCommandControlPlayResponse = {
  encode(_: MpdCommandControlPlayResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandControlPlayResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandControlPlayResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandControlPlayResponse {
    return {};
  },

  toJSON(_: MpdCommandControlPlayResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandControlPlayResponse>, I>>(base?: I): MpdCommandControlPlayResponse {
    return MpdCommandControlPlayResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandControlPlayResponse>, I>>(_: I): MpdCommandControlPlayResponse {
    const message = createBaseMpdCommandControlPlayResponse();
    return message;
  },
};

function createBaseMpdCommandControlPreviousRequest(): MpdCommandControlPreviousRequest {
  return {};
}

export const MpdCommandControlPreviousRequest = {
  encode(_: MpdCommandControlPreviousRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandControlPreviousRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandControlPreviousRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandControlPreviousRequest {
    return {};
  },

  toJSON(_: MpdCommandControlPreviousRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandControlPreviousRequest>, I>>(
    base?: I,
  ): MpdCommandControlPreviousRequest {
    return MpdCommandControlPreviousRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandControlPreviousRequest>, I>>(
    _: I,
  ): MpdCommandControlPreviousRequest {
    const message = createBaseMpdCommandControlPreviousRequest();
    return message;
  },
};

function createBaseMpdCommandControlPreviousResponse(): MpdCommandControlPreviousResponse {
  return {};
}

export const MpdCommandControlPreviousResponse = {
  encode(_: MpdCommandControlPreviousResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandControlPreviousResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandControlPreviousResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandControlPreviousResponse {
    return {};
  },

  toJSON(_: MpdCommandControlPreviousResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandControlPreviousResponse>, I>>(
    base?: I,
  ): MpdCommandControlPreviousResponse {
    return MpdCommandControlPreviousResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandControlPreviousResponse>, I>>(
    _: I,
  ): MpdCommandControlPreviousResponse {
    const message = createBaseMpdCommandControlPreviousResponse();
    return message;
  },
};

function createBaseMpdCommandControlSeekRequest(): MpdCommandControlSeekRequest {
  return { time: 0, target: undefined };
}

export const MpdCommandControlSeekRequest = {
  encode(message: MpdCommandControlSeekRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.time !== 0) {
      writer.uint32(13).float(message.time);
    }
    switch (message.target?.$case) {
      case "pos":
        writer.uint32(18).string(message.target.pos);
        break;
      case "id":
        writer.uint32(26).string(message.target.id);
        break;
      case "current":
        writer.uint32(32).bool(message.target.current);
        break;
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandControlSeekRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandControlSeekRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.time = reader.float();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.target = { $case: "pos", pos: reader.string() };
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.target = { $case: "id", id: reader.string() };
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.target = { $case: "current", current: reader.bool() };
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandControlSeekRequest {
    return {
      time: isSet(object.time) ? Number(object.time) : 0,
      target: isSet(object.pos)
        ? { $case: "pos", pos: String(object.pos) }
        : isSet(object.id)
        ? { $case: "id", id: String(object.id) }
        : isSet(object.current)
        ? { $case: "current", current: Boolean(object.current) }
        : undefined,
    };
  },

  toJSON(message: MpdCommandControlSeekRequest): unknown {
    const obj: any = {};
    if (message.time !== 0) {
      obj.time = message.time;
    }
    if (message.target?.$case === "pos") {
      obj.pos = message.target.pos;
    }
    if (message.target?.$case === "id") {
      obj.id = message.target.id;
    }
    if (message.target?.$case === "current") {
      obj.current = message.target.current;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandControlSeekRequest>, I>>(base?: I): MpdCommandControlSeekRequest {
    return MpdCommandControlSeekRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandControlSeekRequest>, I>>(object: I): MpdCommandControlSeekRequest {
    const message = createBaseMpdCommandControlSeekRequest();
    message.time = object.time ?? 0;
    if (object.target?.$case === "pos" && object.target?.pos !== undefined && object.target?.pos !== null) {
      message.target = { $case: "pos", pos: object.target.pos };
    }
    if (object.target?.$case === "id" && object.target?.id !== undefined && object.target?.id !== null) {
      message.target = { $case: "id", id: object.target.id };
    }
    if (object.target?.$case === "current" && object.target?.current !== undefined && object.target?.current !== null) {
      message.target = { $case: "current", current: object.target.current };
    }
    return message;
  },
};

function createBaseMpdCommandControlSeekResponse(): MpdCommandControlSeekResponse {
  return {};
}

export const MpdCommandControlSeekResponse = {
  encode(_: MpdCommandControlSeekResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandControlSeekResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandControlSeekResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandControlSeekResponse {
    return {};
  },

  toJSON(_: MpdCommandControlSeekResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandControlSeekResponse>, I>>(base?: I): MpdCommandControlSeekResponse {
    return MpdCommandControlSeekResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandControlSeekResponse>, I>>(_: I): MpdCommandControlSeekResponse {
    const message = createBaseMpdCommandControlSeekResponse();
    return message;
  },
};

function createBaseMpdCommandControlStopRequest(): MpdCommandControlStopRequest {
  return {};
}

export const MpdCommandControlStopRequest = {
  encode(_: MpdCommandControlStopRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandControlStopRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandControlStopRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandControlStopRequest {
    return {};
  },

  toJSON(_: MpdCommandControlStopRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandControlStopRequest>, I>>(base?: I): MpdCommandControlStopRequest {
    return MpdCommandControlStopRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandControlStopRequest>, I>>(_: I): MpdCommandControlStopRequest {
    const message = createBaseMpdCommandControlStopRequest();
    return message;
  },
};

function createBaseMpdCommandControlStopResponse(): MpdCommandControlStopResponse {
  return {};
}

export const MpdCommandControlStopResponse = {
  encode(_: MpdCommandControlStopResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandControlStopResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandControlStopResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandControlStopResponse {
    return {};
  },

  toJSON(_: MpdCommandControlStopResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandControlStopResponse>, I>>(base?: I): MpdCommandControlStopResponse {
    return MpdCommandControlStopResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandControlStopResponse>, I>>(_: I): MpdCommandControlStopResponse {
    const message = createBaseMpdCommandControlStopResponse();
    return message;
  },
};

function createBaseMpdCommandPlayback(): MpdCommandPlayback {
  return {};
}

export const MpdCommandPlayback = {
  encode(_: MpdCommandPlayback, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandPlayback {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandPlayback();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandPlayback {
    return {};
  },

  toJSON(_: MpdCommandPlayback): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandPlayback>, I>>(base?: I): MpdCommandPlayback {
    return MpdCommandPlayback.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandPlayback>, I>>(_: I): MpdCommandPlayback {
    const message = createBaseMpdCommandPlayback();
    return message;
  },
};

function createBaseMpdCommandPlaybackConsumeRequest(): MpdCommandPlaybackConsumeRequest {
  return { enable: false };
}

export const MpdCommandPlaybackConsumeRequest = {
  encode(message: MpdCommandPlaybackConsumeRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.enable === true) {
      writer.uint32(8).bool(message.enable);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandPlaybackConsumeRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandPlaybackConsumeRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.enable = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandPlaybackConsumeRequest {
    return { enable: isSet(object.enable) ? Boolean(object.enable) : false };
  },

  toJSON(message: MpdCommandPlaybackConsumeRequest): unknown {
    const obj: any = {};
    if (message.enable === true) {
      obj.enable = message.enable;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandPlaybackConsumeRequest>, I>>(
    base?: I,
  ): MpdCommandPlaybackConsumeRequest {
    return MpdCommandPlaybackConsumeRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandPlaybackConsumeRequest>, I>>(
    object: I,
  ): MpdCommandPlaybackConsumeRequest {
    const message = createBaseMpdCommandPlaybackConsumeRequest();
    message.enable = object.enable ?? false;
    return message;
  },
};

function createBaseMpdCommandPlaybackConsumeResponse(): MpdCommandPlaybackConsumeResponse {
  return {};
}

export const MpdCommandPlaybackConsumeResponse = {
  encode(_: MpdCommandPlaybackConsumeResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandPlaybackConsumeResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandPlaybackConsumeResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandPlaybackConsumeResponse {
    return {};
  },

  toJSON(_: MpdCommandPlaybackConsumeResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandPlaybackConsumeResponse>, I>>(
    base?: I,
  ): MpdCommandPlaybackConsumeResponse {
    return MpdCommandPlaybackConsumeResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandPlaybackConsumeResponse>, I>>(
    _: I,
  ): MpdCommandPlaybackConsumeResponse {
    const message = createBaseMpdCommandPlaybackConsumeResponse();
    return message;
  },
};

function createBaseMpdCommandPlaybackRandomRequest(): MpdCommandPlaybackRandomRequest {
  return { enable: false };
}

export const MpdCommandPlaybackRandomRequest = {
  encode(message: MpdCommandPlaybackRandomRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.enable === true) {
      writer.uint32(8).bool(message.enable);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandPlaybackRandomRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandPlaybackRandomRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.enable = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandPlaybackRandomRequest {
    return { enable: isSet(object.enable) ? Boolean(object.enable) : false };
  },

  toJSON(message: MpdCommandPlaybackRandomRequest): unknown {
    const obj: any = {};
    if (message.enable === true) {
      obj.enable = message.enable;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandPlaybackRandomRequest>, I>>(base?: I): MpdCommandPlaybackRandomRequest {
    return MpdCommandPlaybackRandomRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandPlaybackRandomRequest>, I>>(
    object: I,
  ): MpdCommandPlaybackRandomRequest {
    const message = createBaseMpdCommandPlaybackRandomRequest();
    message.enable = object.enable ?? false;
    return message;
  },
};

function createBaseMpdCommandPlaybackRandomResponse(): MpdCommandPlaybackRandomResponse {
  return {};
}

export const MpdCommandPlaybackRandomResponse = {
  encode(_: MpdCommandPlaybackRandomResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandPlaybackRandomResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandPlaybackRandomResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandPlaybackRandomResponse {
    return {};
  },

  toJSON(_: MpdCommandPlaybackRandomResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandPlaybackRandomResponse>, I>>(
    base?: I,
  ): MpdCommandPlaybackRandomResponse {
    return MpdCommandPlaybackRandomResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandPlaybackRandomResponse>, I>>(
    _: I,
  ): MpdCommandPlaybackRandomResponse {
    const message = createBaseMpdCommandPlaybackRandomResponse();
    return message;
  },
};

function createBaseMpdCommandPlaybackRepeatRequest(): MpdCommandPlaybackRepeatRequest {
  return { enable: false };
}

export const MpdCommandPlaybackRepeatRequest = {
  encode(message: MpdCommandPlaybackRepeatRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.enable === true) {
      writer.uint32(8).bool(message.enable);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandPlaybackRepeatRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandPlaybackRepeatRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.enable = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandPlaybackRepeatRequest {
    return { enable: isSet(object.enable) ? Boolean(object.enable) : false };
  },

  toJSON(message: MpdCommandPlaybackRepeatRequest): unknown {
    const obj: any = {};
    if (message.enable === true) {
      obj.enable = message.enable;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandPlaybackRepeatRequest>, I>>(base?: I): MpdCommandPlaybackRepeatRequest {
    return MpdCommandPlaybackRepeatRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandPlaybackRepeatRequest>, I>>(
    object: I,
  ): MpdCommandPlaybackRepeatRequest {
    const message = createBaseMpdCommandPlaybackRepeatRequest();
    message.enable = object.enable ?? false;
    return message;
  },
};

function createBaseMpdCommandPlaybackRepeatResponse(): MpdCommandPlaybackRepeatResponse {
  return {};
}

export const MpdCommandPlaybackRepeatResponse = {
  encode(_: MpdCommandPlaybackRepeatResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandPlaybackRepeatResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandPlaybackRepeatResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandPlaybackRepeatResponse {
    return {};
  },

  toJSON(_: MpdCommandPlaybackRepeatResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandPlaybackRepeatResponse>, I>>(
    base?: I,
  ): MpdCommandPlaybackRepeatResponse {
    return MpdCommandPlaybackRepeatResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandPlaybackRepeatResponse>, I>>(
    _: I,
  ): MpdCommandPlaybackRepeatResponse {
    const message = createBaseMpdCommandPlaybackRepeatResponse();
    return message;
  },
};

function createBaseMpdCommandPlaybackSetVolRequest(): MpdCommandPlaybackSetVolRequest {
  return { vol: 0 };
}

export const MpdCommandPlaybackSetVolRequest = {
  encode(message: MpdCommandPlaybackSetVolRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.vol !== 0) {
      writer.uint32(8).int32(message.vol);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandPlaybackSetVolRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandPlaybackSetVolRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.vol = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandPlaybackSetVolRequest {
    return { vol: isSet(object.vol) ? Number(object.vol) : 0 };
  },

  toJSON(message: MpdCommandPlaybackSetVolRequest): unknown {
    const obj: any = {};
    if (message.vol !== 0) {
      obj.vol = Math.round(message.vol);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandPlaybackSetVolRequest>, I>>(base?: I): MpdCommandPlaybackSetVolRequest {
    return MpdCommandPlaybackSetVolRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandPlaybackSetVolRequest>, I>>(
    object: I,
  ): MpdCommandPlaybackSetVolRequest {
    const message = createBaseMpdCommandPlaybackSetVolRequest();
    message.vol = object.vol ?? 0;
    return message;
  },
};

function createBaseMpdCommandPlaybackSetVolResponse(): MpdCommandPlaybackSetVolResponse {
  return {};
}

export const MpdCommandPlaybackSetVolResponse = {
  encode(_: MpdCommandPlaybackSetVolResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandPlaybackSetVolResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandPlaybackSetVolResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandPlaybackSetVolResponse {
    return {};
  },

  toJSON(_: MpdCommandPlaybackSetVolResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandPlaybackSetVolResponse>, I>>(
    base?: I,
  ): MpdCommandPlaybackSetVolResponse {
    return MpdCommandPlaybackSetVolResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandPlaybackSetVolResponse>, I>>(
    _: I,
  ): MpdCommandPlaybackSetVolResponse {
    const message = createBaseMpdCommandPlaybackSetVolResponse();
    return message;
  },
};

function createBaseMpdCommandPlaybackGetVolRequest(): MpdCommandPlaybackGetVolRequest {
  return {};
}

export const MpdCommandPlaybackGetVolRequest = {
  encode(_: MpdCommandPlaybackGetVolRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandPlaybackGetVolRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandPlaybackGetVolRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandPlaybackGetVolRequest {
    return {};
  },

  toJSON(_: MpdCommandPlaybackGetVolRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandPlaybackGetVolRequest>, I>>(base?: I): MpdCommandPlaybackGetVolRequest {
    return MpdCommandPlaybackGetVolRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandPlaybackGetVolRequest>, I>>(_: I): MpdCommandPlaybackGetVolRequest {
    const message = createBaseMpdCommandPlaybackGetVolRequest();
    return message;
  },
};

function createBaseMpdCommandPlaybackGetVolResponse(): MpdCommandPlaybackGetVolResponse {
  return { vol: undefined };
}

export const MpdCommandPlaybackGetVolResponse = {
  encode(message: MpdCommandPlaybackGetVolResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.vol !== undefined) {
      MpdPlayerVolume.encode(message.vol, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandPlaybackGetVolResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandPlaybackGetVolResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.vol = MpdPlayerVolume.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandPlaybackGetVolResponse {
    return { vol: isSet(object.vol) ? MpdPlayerVolume.fromJSON(object.vol) : undefined };
  },

  toJSON(message: MpdCommandPlaybackGetVolResponse): unknown {
    const obj: any = {};
    if (message.vol !== undefined) {
      obj.vol = MpdPlayerVolume.toJSON(message.vol);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandPlaybackGetVolResponse>, I>>(
    base?: I,
  ): MpdCommandPlaybackGetVolResponse {
    return MpdCommandPlaybackGetVolResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandPlaybackGetVolResponse>, I>>(
    object: I,
  ): MpdCommandPlaybackGetVolResponse {
    const message = createBaseMpdCommandPlaybackGetVolResponse();
    message.vol = (object.vol !== undefined && object.vol !== null)
      ? MpdPlayerVolume.fromPartial(object.vol)
      : undefined;
    return message;
  },
};

function createBaseMpdCommandPlaybackSingleRequest(): MpdCommandPlaybackSingleRequest {
  return { enable: false };
}

export const MpdCommandPlaybackSingleRequest = {
  encode(message: MpdCommandPlaybackSingleRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.enable === true) {
      writer.uint32(8).bool(message.enable);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandPlaybackSingleRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandPlaybackSingleRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.enable = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandPlaybackSingleRequest {
    return { enable: isSet(object.enable) ? Boolean(object.enable) : false };
  },

  toJSON(message: MpdCommandPlaybackSingleRequest): unknown {
    const obj: any = {};
    if (message.enable === true) {
      obj.enable = message.enable;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandPlaybackSingleRequest>, I>>(base?: I): MpdCommandPlaybackSingleRequest {
    return MpdCommandPlaybackSingleRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandPlaybackSingleRequest>, I>>(
    object: I,
  ): MpdCommandPlaybackSingleRequest {
    const message = createBaseMpdCommandPlaybackSingleRequest();
    message.enable = object.enable ?? false;
    return message;
  },
};

function createBaseMpdCommandPlaybackSingleResponse(): MpdCommandPlaybackSingleResponse {
  return {};
}

export const MpdCommandPlaybackSingleResponse = {
  encode(_: MpdCommandPlaybackSingleResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandPlaybackSingleResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandPlaybackSingleResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandPlaybackSingleResponse {
    return {};
  },

  toJSON(_: MpdCommandPlaybackSingleResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandPlaybackSingleResponse>, I>>(
    base?: I,
  ): MpdCommandPlaybackSingleResponse {
    return MpdCommandPlaybackSingleResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandPlaybackSingleResponse>, I>>(
    _: I,
  ): MpdCommandPlaybackSingleResponse {
    const message = createBaseMpdCommandPlaybackSingleResponse();
    return message;
  },
};

function createBaseMpdCommandStatus(): MpdCommandStatus {
  return {};
}

export const MpdCommandStatus = {
  encode(_: MpdCommandStatus, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStatus {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandStatus {
    return {};
  },

  toJSON(_: MpdCommandStatus): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStatus>, I>>(base?: I): MpdCommandStatus {
    return MpdCommandStatus.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStatus>, I>>(_: I): MpdCommandStatus {
    const message = createBaseMpdCommandStatus();
    return message;
  },
};

function createBaseMpdCommandStatusCurrentSongRequest(): MpdCommandStatusCurrentSongRequest {
  return {};
}

export const MpdCommandStatusCurrentSongRequest = {
  encode(_: MpdCommandStatusCurrentSongRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStatusCurrentSongRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStatusCurrentSongRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandStatusCurrentSongRequest {
    return {};
  },

  toJSON(_: MpdCommandStatusCurrentSongRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStatusCurrentSongRequest>, I>>(
    base?: I,
  ): MpdCommandStatusCurrentSongRequest {
    return MpdCommandStatusCurrentSongRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStatusCurrentSongRequest>, I>>(
    _: I,
  ): MpdCommandStatusCurrentSongRequest {
    const message = createBaseMpdCommandStatusCurrentSongRequest();
    return message;
  },
};

function createBaseMpdCommandStatusCurrentSongResponse(): MpdCommandStatusCurrentSongResponse {
  return { song: undefined };
}

export const MpdCommandStatusCurrentSongResponse = {
  encode(message: MpdCommandStatusCurrentSongResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.song !== undefined) {
      Song.encode(message.song, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStatusCurrentSongResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStatusCurrentSongResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.song = Song.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandStatusCurrentSongResponse {
    return { song: isSet(object.song) ? Song.fromJSON(object.song) : undefined };
  },

  toJSON(message: MpdCommandStatusCurrentSongResponse): unknown {
    const obj: any = {};
    if (message.song !== undefined) {
      obj.song = Song.toJSON(message.song);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStatusCurrentSongResponse>, I>>(
    base?: I,
  ): MpdCommandStatusCurrentSongResponse {
    return MpdCommandStatusCurrentSongResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStatusCurrentSongResponse>, I>>(
    object: I,
  ): MpdCommandStatusCurrentSongResponse {
    const message = createBaseMpdCommandStatusCurrentSongResponse();
    message.song = (object.song !== undefined && object.song !== null) ? Song.fromPartial(object.song) : undefined;
    return message;
  },
};

function createBaseMpdCommandStatusStatusRequest(): MpdCommandStatusStatusRequest {
  return {};
}

export const MpdCommandStatusStatusRequest = {
  encode(_: MpdCommandStatusStatusRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStatusStatusRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStatusStatusRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandStatusStatusRequest {
    return {};
  },

  toJSON(_: MpdCommandStatusStatusRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStatusStatusRequest>, I>>(base?: I): MpdCommandStatusStatusRequest {
    return MpdCommandStatusStatusRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStatusStatusRequest>, I>>(_: I): MpdCommandStatusStatusRequest {
    const message = createBaseMpdCommandStatusStatusRequest();
    return message;
  },
};

function createBaseMpdCommandStatusStatusResponse(): MpdCommandStatusStatusResponse {
  return { status: undefined };
}

export const MpdCommandStatusStatusResponse = {
  encode(message: MpdCommandStatusStatusResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.status !== undefined) {
      MpdPlayerStatus.encode(message.status, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStatusStatusResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStatusStatusResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.status = MpdPlayerStatus.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandStatusStatusResponse {
    return { status: isSet(object.status) ? MpdPlayerStatus.fromJSON(object.status) : undefined };
  },

  toJSON(message: MpdCommandStatusStatusResponse): unknown {
    const obj: any = {};
    if (message.status !== undefined) {
      obj.status = MpdPlayerStatus.toJSON(message.status);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStatusStatusResponse>, I>>(base?: I): MpdCommandStatusStatusResponse {
    return MpdCommandStatusStatusResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStatusStatusResponse>, I>>(
    object: I,
  ): MpdCommandStatusStatusResponse {
    const message = createBaseMpdCommandStatusStatusResponse();
    message.status = (object.status !== undefined && object.status !== null)
      ? MpdPlayerStatus.fromPartial(object.status)
      : undefined;
    return message;
  },
};

function createBaseMpdCommandStatusStatsRequest(): MpdCommandStatusStatsRequest {
  return {};
}

export const MpdCommandStatusStatsRequest = {
  encode(_: MpdCommandStatusStatsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStatusStatsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStatusStatsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandStatusStatsRequest {
    return {};
  },

  toJSON(_: MpdCommandStatusStatsRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStatusStatsRequest>, I>>(base?: I): MpdCommandStatusStatsRequest {
    return MpdCommandStatusStatsRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStatusStatsRequest>, I>>(_: I): MpdCommandStatusStatsRequest {
    const message = createBaseMpdCommandStatusStatsRequest();
    return message;
  },
};

function createBaseMpdCommandStatusStatsResponse(): MpdCommandStatusStatsResponse {
  return { stats: undefined };
}

export const MpdCommandStatusStatsResponse = {
  encode(message: MpdCommandStatusStatsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stats !== undefined) {
      MpdStats.encode(message.stats, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStatusStatsResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStatusStatsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.stats = MpdStats.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandStatusStatsResponse {
    return { stats: isSet(object.stats) ? MpdStats.fromJSON(object.stats) : undefined };
  },

  toJSON(message: MpdCommandStatusStatsResponse): unknown {
    const obj: any = {};
    if (message.stats !== undefined) {
      obj.stats = MpdStats.toJSON(message.stats);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStatusStatsResponse>, I>>(base?: I): MpdCommandStatusStatsResponse {
    return MpdCommandStatusStatsResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStatusStatsResponse>, I>>(
    object: I,
  ): MpdCommandStatusStatsResponse {
    const message = createBaseMpdCommandStatusStatsResponse();
    message.stats = (object.stats !== undefined && object.stats !== null)
      ? MpdStats.fromPartial(object.stats)
      : undefined;
    return message;
  },
};

function createBaseMpdCommandQueue(): MpdCommandQueue {
  return {};
}

export const MpdCommandQueue = {
  encode(_: MpdCommandQueue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandQueue {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandQueue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandQueue {
    return {};
  },

  toJSON(_: MpdCommandQueue): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandQueue>, I>>(base?: I): MpdCommandQueue {
    return MpdCommandQueue.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandQueue>, I>>(_: I): MpdCommandQueue {
    const message = createBaseMpdCommandQueue();
    return message;
  },
};

function createBaseMpdCommandQueueAddRequest(): MpdCommandQueueAddRequest {
  return { uri: "" };
}

export const MpdCommandQueueAddRequest = {
  encode(message: MpdCommandQueueAddRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.uri !== "") {
      writer.uint32(10).string(message.uri);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandQueueAddRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandQueueAddRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.uri = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandQueueAddRequest {
    return { uri: isSet(object.uri) ? String(object.uri) : "" };
  },

  toJSON(message: MpdCommandQueueAddRequest): unknown {
    const obj: any = {};
    if (message.uri !== "") {
      obj.uri = message.uri;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandQueueAddRequest>, I>>(base?: I): MpdCommandQueueAddRequest {
    return MpdCommandQueueAddRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandQueueAddRequest>, I>>(object: I): MpdCommandQueueAddRequest {
    const message = createBaseMpdCommandQueueAddRequest();
    message.uri = object.uri ?? "";
    return message;
  },
};

function createBaseMpdCommandQueueAddResponse(): MpdCommandQueueAddResponse {
  return {};
}

export const MpdCommandQueueAddResponse = {
  encode(_: MpdCommandQueueAddResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandQueueAddResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandQueueAddResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandQueueAddResponse {
    return {};
  },

  toJSON(_: MpdCommandQueueAddResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandQueueAddResponse>, I>>(base?: I): MpdCommandQueueAddResponse {
    return MpdCommandQueueAddResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandQueueAddResponse>, I>>(_: I): MpdCommandQueueAddResponse {
    const message = createBaseMpdCommandQueueAddResponse();
    return message;
  },
};

function createBaseMpdCommandQueueClearRequest(): MpdCommandQueueClearRequest {
  return {};
}

export const MpdCommandQueueClearRequest = {
  encode(_: MpdCommandQueueClearRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandQueueClearRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandQueueClearRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandQueueClearRequest {
    return {};
  },

  toJSON(_: MpdCommandQueueClearRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandQueueClearRequest>, I>>(base?: I): MpdCommandQueueClearRequest {
    return MpdCommandQueueClearRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandQueueClearRequest>, I>>(_: I): MpdCommandQueueClearRequest {
    const message = createBaseMpdCommandQueueClearRequest();
    return message;
  },
};

function createBaseMpdCommandQueueClearResponse(): MpdCommandQueueClearResponse {
  return {};
}

export const MpdCommandQueueClearResponse = {
  encode(_: MpdCommandQueueClearResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandQueueClearResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandQueueClearResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandQueueClearResponse {
    return {};
  },

  toJSON(_: MpdCommandQueueClearResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandQueueClearResponse>, I>>(base?: I): MpdCommandQueueClearResponse {
    return MpdCommandQueueClearResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandQueueClearResponse>, I>>(_: I): MpdCommandQueueClearResponse {
    const message = createBaseMpdCommandQueueClearResponse();
    return message;
  },
};

function createBaseMpdCommandQueueDeleteRequest(): MpdCommandQueueDeleteRequest {
  return { target: undefined };
}

export const MpdCommandQueueDeleteRequest = {
  encode(message: MpdCommandQueueDeleteRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    switch (message.target?.$case) {
      case "pos":
        writer.uint32(10).string(message.target.pos);
        break;
      case "id":
        writer.uint32(18).string(message.target.id);
        break;
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandQueueDeleteRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandQueueDeleteRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.target = { $case: "pos", pos: reader.string() };
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.target = { $case: "id", id: reader.string() };
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandQueueDeleteRequest {
    return {
      target: isSet(object.pos)
        ? { $case: "pos", pos: String(object.pos) }
        : isSet(object.id)
        ? { $case: "id", id: String(object.id) }
        : undefined,
    };
  },

  toJSON(message: MpdCommandQueueDeleteRequest): unknown {
    const obj: any = {};
    if (message.target?.$case === "pos") {
      obj.pos = message.target.pos;
    }
    if (message.target?.$case === "id") {
      obj.id = message.target.id;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandQueueDeleteRequest>, I>>(base?: I): MpdCommandQueueDeleteRequest {
    return MpdCommandQueueDeleteRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandQueueDeleteRequest>, I>>(object: I): MpdCommandQueueDeleteRequest {
    const message = createBaseMpdCommandQueueDeleteRequest();
    if (object.target?.$case === "pos" && object.target?.pos !== undefined && object.target?.pos !== null) {
      message.target = { $case: "pos", pos: object.target.pos };
    }
    if (object.target?.$case === "id" && object.target?.id !== undefined && object.target?.id !== null) {
      message.target = { $case: "id", id: object.target.id };
    }
    return message;
  },
};

function createBaseMpdCommandQueueDeleteResponse(): MpdCommandQueueDeleteResponse {
  return {};
}

export const MpdCommandQueueDeleteResponse = {
  encode(_: MpdCommandQueueDeleteResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandQueueDeleteResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandQueueDeleteResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandQueueDeleteResponse {
    return {};
  },

  toJSON(_: MpdCommandQueueDeleteResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandQueueDeleteResponse>, I>>(base?: I): MpdCommandQueueDeleteResponse {
    return MpdCommandQueueDeleteResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandQueueDeleteResponse>, I>>(_: I): MpdCommandQueueDeleteResponse {
    const message = createBaseMpdCommandQueueDeleteResponse();
    return message;
  },
};

function createBaseMpdCommandQueueMoveRequest(): MpdCommandQueueMoveRequest {
  return { from: undefined, to: "" };
}

export const MpdCommandQueueMoveRequest = {
  encode(message: MpdCommandQueueMoveRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    switch (message.from?.$case) {
      case "fromPos":
        writer.uint32(10).string(message.from.fromPos);
        break;
      case "fromId":
        writer.uint32(18).string(message.from.fromId);
        break;
    }
    if (message.to !== "") {
      writer.uint32(26).string(message.to);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandQueueMoveRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandQueueMoveRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = { $case: "fromPos", fromPos: reader.string() };
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.from = { $case: "fromId", fromId: reader.string() };
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.to = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandQueueMoveRequest {
    return {
      from: isSet(object.fromPos)
        ? { $case: "fromPos", fromPos: String(object.fromPos) }
        : isSet(object.fromId)
        ? { $case: "fromId", fromId: String(object.fromId) }
        : undefined,
      to: isSet(object.to) ? String(object.to) : "",
    };
  },

  toJSON(message: MpdCommandQueueMoveRequest): unknown {
    const obj: any = {};
    if (message.from?.$case === "fromPos") {
      obj.fromPos = message.from.fromPos;
    }
    if (message.from?.$case === "fromId") {
      obj.fromId = message.from.fromId;
    }
    if (message.to !== "") {
      obj.to = message.to;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandQueueMoveRequest>, I>>(base?: I): MpdCommandQueueMoveRequest {
    return MpdCommandQueueMoveRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandQueueMoveRequest>, I>>(object: I): MpdCommandQueueMoveRequest {
    const message = createBaseMpdCommandQueueMoveRequest();
    if (object.from?.$case === "fromPos" && object.from?.fromPos !== undefined && object.from?.fromPos !== null) {
      message.from = { $case: "fromPos", fromPos: object.from.fromPos };
    }
    if (object.from?.$case === "fromId" && object.from?.fromId !== undefined && object.from?.fromId !== null) {
      message.from = { $case: "fromId", fromId: object.from.fromId };
    }
    message.to = object.to ?? "";
    return message;
  },
};

function createBaseMpdCommandQueueMoveResponse(): MpdCommandQueueMoveResponse {
  return {};
}

export const MpdCommandQueueMoveResponse = {
  encode(_: MpdCommandQueueMoveResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandQueueMoveResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandQueueMoveResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandQueueMoveResponse {
    return {};
  },

  toJSON(_: MpdCommandQueueMoveResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandQueueMoveResponse>, I>>(base?: I): MpdCommandQueueMoveResponse {
    return MpdCommandQueueMoveResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandQueueMoveResponse>, I>>(_: I): MpdCommandQueueMoveResponse {
    const message = createBaseMpdCommandQueueMoveResponse();
    return message;
  },
};

function createBaseMpdCommandQueuePlaylistInfoRequest(): MpdCommandQueuePlaylistInfoRequest {
  return {};
}

export const MpdCommandQueuePlaylistInfoRequest = {
  encode(_: MpdCommandQueuePlaylistInfoRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandQueuePlaylistInfoRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandQueuePlaylistInfoRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandQueuePlaylistInfoRequest {
    return {};
  },

  toJSON(_: MpdCommandQueuePlaylistInfoRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandQueuePlaylistInfoRequest>, I>>(
    base?: I,
  ): MpdCommandQueuePlaylistInfoRequest {
    return MpdCommandQueuePlaylistInfoRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandQueuePlaylistInfoRequest>, I>>(
    _: I,
  ): MpdCommandQueuePlaylistInfoRequest {
    const message = createBaseMpdCommandQueuePlaylistInfoRequest();
    return message;
  },
};

function createBaseMpdCommandQueuePlaylistInfoResponse(): MpdCommandQueuePlaylistInfoResponse {
  return { songs: [] };
}

export const MpdCommandQueuePlaylistInfoResponse = {
  encode(message: MpdCommandQueuePlaylistInfoResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.songs) {
      Song.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandQueuePlaylistInfoResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandQueuePlaylistInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.songs.push(Song.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandQueuePlaylistInfoResponse {
    return { songs: Array.isArray(object?.songs) ? object.songs.map((e: any) => Song.fromJSON(e)) : [] };
  },

  toJSON(message: MpdCommandQueuePlaylistInfoResponse): unknown {
    const obj: any = {};
    if (message.songs?.length) {
      obj.songs = message.songs.map((e) => Song.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandQueuePlaylistInfoResponse>, I>>(
    base?: I,
  ): MpdCommandQueuePlaylistInfoResponse {
    return MpdCommandQueuePlaylistInfoResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandQueuePlaylistInfoResponse>, I>>(
    object: I,
  ): MpdCommandQueuePlaylistInfoResponse {
    const message = createBaseMpdCommandQueuePlaylistInfoResponse();
    message.songs = object.songs?.map((e) => Song.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMpdCommandQueueShuffleRequest(): MpdCommandQueueShuffleRequest {
  return {};
}

export const MpdCommandQueueShuffleRequest = {
  encode(_: MpdCommandQueueShuffleRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandQueueShuffleRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandQueueShuffleRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandQueueShuffleRequest {
    return {};
  },

  toJSON(_: MpdCommandQueueShuffleRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandQueueShuffleRequest>, I>>(base?: I): MpdCommandQueueShuffleRequest {
    return MpdCommandQueueShuffleRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandQueueShuffleRequest>, I>>(_: I): MpdCommandQueueShuffleRequest {
    const message = createBaseMpdCommandQueueShuffleRequest();
    return message;
  },
};

function createBaseMpdCommandQueueShuffleResponse(): MpdCommandQueueShuffleResponse {
  return {};
}

export const MpdCommandQueueShuffleResponse = {
  encode(_: MpdCommandQueueShuffleResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandQueueShuffleResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandQueueShuffleResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandQueueShuffleResponse {
    return {};
  },

  toJSON(_: MpdCommandQueueShuffleResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandQueueShuffleResponse>, I>>(base?: I): MpdCommandQueueShuffleResponse {
    return MpdCommandQueueShuffleResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandQueueShuffleResponse>, I>>(_: I): MpdCommandQueueShuffleResponse {
    const message = createBaseMpdCommandQueueShuffleResponse();
    return message;
  },
};

function createBaseMpdCommandStoredPlaylist(): MpdCommandStoredPlaylist {
  return {};
}

export const MpdCommandStoredPlaylist = {
  encode(_: MpdCommandStoredPlaylist, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylist {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylist();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandStoredPlaylist {
    return {};
  },

  toJSON(_: MpdCommandStoredPlaylist): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylist>, I>>(base?: I): MpdCommandStoredPlaylist {
    return MpdCommandStoredPlaylist.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylist>, I>>(_: I): MpdCommandStoredPlaylist {
    const message = createBaseMpdCommandStoredPlaylist();
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistListPlaylistInfoRequest(): MpdCommandStoredPlaylistListPlaylistInfoRequest {
  return { name: "" };
}

export const MpdCommandStoredPlaylistListPlaylistInfoRequest = {
  encode(
    message: MpdCommandStoredPlaylistListPlaylistInfoRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistListPlaylistInfoRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistListPlaylistInfoRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandStoredPlaylistListPlaylistInfoRequest {
    return { name: isSet(object.name) ? String(object.name) : "" };
  },

  toJSON(message: MpdCommandStoredPlaylistListPlaylistInfoRequest): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistListPlaylistInfoRequest>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistListPlaylistInfoRequest {
    return MpdCommandStoredPlaylistListPlaylistInfoRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistListPlaylistInfoRequest>, I>>(
    object: I,
  ): MpdCommandStoredPlaylistListPlaylistInfoRequest {
    const message = createBaseMpdCommandStoredPlaylistListPlaylistInfoRequest();
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistListPlaylistInfoResponse(): MpdCommandStoredPlaylistListPlaylistInfoResponse {
  return { songs: [] };
}

export const MpdCommandStoredPlaylistListPlaylistInfoResponse = {
  encode(
    message: MpdCommandStoredPlaylistListPlaylistInfoResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.songs) {
      Song.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistListPlaylistInfoResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistListPlaylistInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.songs.push(Song.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandStoredPlaylistListPlaylistInfoResponse {
    return { songs: Array.isArray(object?.songs) ? object.songs.map((e: any) => Song.fromJSON(e)) : [] };
  },

  toJSON(message: MpdCommandStoredPlaylistListPlaylistInfoResponse): unknown {
    const obj: any = {};
    if (message.songs?.length) {
      obj.songs = message.songs.map((e) => Song.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistListPlaylistInfoResponse>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistListPlaylistInfoResponse {
    return MpdCommandStoredPlaylistListPlaylistInfoResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistListPlaylistInfoResponse>, I>>(
    object: I,
  ): MpdCommandStoredPlaylistListPlaylistInfoResponse {
    const message = createBaseMpdCommandStoredPlaylistListPlaylistInfoResponse();
    message.songs = object.songs?.map((e) => Song.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistListPlaylistsRequest(): MpdCommandStoredPlaylistListPlaylistsRequest {
  return {};
}

export const MpdCommandStoredPlaylistListPlaylistsRequest = {
  encode(_: MpdCommandStoredPlaylistListPlaylistsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistListPlaylistsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistListPlaylistsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandStoredPlaylistListPlaylistsRequest {
    return {};
  },

  toJSON(_: MpdCommandStoredPlaylistListPlaylistsRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistListPlaylistsRequest>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistListPlaylistsRequest {
    return MpdCommandStoredPlaylistListPlaylistsRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistListPlaylistsRequest>, I>>(
    _: I,
  ): MpdCommandStoredPlaylistListPlaylistsRequest {
    const message = createBaseMpdCommandStoredPlaylistListPlaylistsRequest();
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistListPlaylistsResponse(): MpdCommandStoredPlaylistListPlaylistsResponse {
  return { playlists: [] };
}

export const MpdCommandStoredPlaylistListPlaylistsResponse = {
  encode(message: MpdCommandStoredPlaylistListPlaylistsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.playlists) {
      Playlist.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistListPlaylistsResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistListPlaylistsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.playlists.push(Playlist.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandStoredPlaylistListPlaylistsResponse {
    return {
      playlists: Array.isArray(object?.playlists) ? object.playlists.map((e: any) => Playlist.fromJSON(e)) : [],
    };
  },

  toJSON(message: MpdCommandStoredPlaylistListPlaylistsResponse): unknown {
    const obj: any = {};
    if (message.playlists?.length) {
      obj.playlists = message.playlists.map((e) => Playlist.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistListPlaylistsResponse>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistListPlaylistsResponse {
    return MpdCommandStoredPlaylistListPlaylistsResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistListPlaylistsResponse>, I>>(
    object: I,
  ): MpdCommandStoredPlaylistListPlaylistsResponse {
    const message = createBaseMpdCommandStoredPlaylistListPlaylistsResponse();
    message.playlists = object.playlists?.map((e) => Playlist.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistPlaylistAddRequest(): MpdCommandStoredPlaylistPlaylistAddRequest {
  return { name: "", uri: "" };
}

export const MpdCommandStoredPlaylistPlaylistAddRequest = {
  encode(message: MpdCommandStoredPlaylistPlaylistAddRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.uri !== "") {
      writer.uint32(18).string(message.uri);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistPlaylistAddRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistPlaylistAddRequest();
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

          message.uri = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandStoredPlaylistPlaylistAddRequest {
    return { name: isSet(object.name) ? String(object.name) : "", uri: isSet(object.uri) ? String(object.uri) : "" };
  },

  toJSON(message: MpdCommandStoredPlaylistPlaylistAddRequest): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.uri !== "") {
      obj.uri = message.uri;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistAddRequest>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistPlaylistAddRequest {
    return MpdCommandStoredPlaylistPlaylistAddRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistAddRequest>, I>>(
    object: I,
  ): MpdCommandStoredPlaylistPlaylistAddRequest {
    const message = createBaseMpdCommandStoredPlaylistPlaylistAddRequest();
    message.name = object.name ?? "";
    message.uri = object.uri ?? "";
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistPlaylistAddResponse(): MpdCommandStoredPlaylistPlaylistAddResponse {
  return {};
}

export const MpdCommandStoredPlaylistPlaylistAddResponse = {
  encode(_: MpdCommandStoredPlaylistPlaylistAddResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistPlaylistAddResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistPlaylistAddResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandStoredPlaylistPlaylistAddResponse {
    return {};
  },

  toJSON(_: MpdCommandStoredPlaylistPlaylistAddResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistAddResponse>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistPlaylistAddResponse {
    return MpdCommandStoredPlaylistPlaylistAddResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistAddResponse>, I>>(
    _: I,
  ): MpdCommandStoredPlaylistPlaylistAddResponse {
    const message = createBaseMpdCommandStoredPlaylistPlaylistAddResponse();
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistPlaylistClearRequest(): MpdCommandStoredPlaylistPlaylistClearRequest {
  return { name: "" };
}

export const MpdCommandStoredPlaylistPlaylistClearRequest = {
  encode(message: MpdCommandStoredPlaylistPlaylistClearRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistPlaylistClearRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistPlaylistClearRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandStoredPlaylistPlaylistClearRequest {
    return { name: isSet(object.name) ? String(object.name) : "" };
  },

  toJSON(message: MpdCommandStoredPlaylistPlaylistClearRequest): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistClearRequest>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistPlaylistClearRequest {
    return MpdCommandStoredPlaylistPlaylistClearRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistClearRequest>, I>>(
    object: I,
  ): MpdCommandStoredPlaylistPlaylistClearRequest {
    const message = createBaseMpdCommandStoredPlaylistPlaylistClearRequest();
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistPlaylistClearResponse(): MpdCommandStoredPlaylistPlaylistClearResponse {
  return {};
}

export const MpdCommandStoredPlaylistPlaylistClearResponse = {
  encode(_: MpdCommandStoredPlaylistPlaylistClearResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistPlaylistClearResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistPlaylistClearResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandStoredPlaylistPlaylistClearResponse {
    return {};
  },

  toJSON(_: MpdCommandStoredPlaylistPlaylistClearResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistClearResponse>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistPlaylistClearResponse {
    return MpdCommandStoredPlaylistPlaylistClearResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistClearResponse>, I>>(
    _: I,
  ): MpdCommandStoredPlaylistPlaylistClearResponse {
    const message = createBaseMpdCommandStoredPlaylistPlaylistClearResponse();
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistPlaylistDeleteRequest(): MpdCommandStoredPlaylistPlaylistDeleteRequest {
  return { name: "", pos: "" };
}

export const MpdCommandStoredPlaylistPlaylistDeleteRequest = {
  encode(message: MpdCommandStoredPlaylistPlaylistDeleteRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.pos !== "") {
      writer.uint32(18).string(message.pos);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistPlaylistDeleteRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistPlaylistDeleteRequest();
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

          message.pos = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandStoredPlaylistPlaylistDeleteRequest {
    return { name: isSet(object.name) ? String(object.name) : "", pos: isSet(object.pos) ? String(object.pos) : "" };
  },

  toJSON(message: MpdCommandStoredPlaylistPlaylistDeleteRequest): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.pos !== "") {
      obj.pos = message.pos;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistDeleteRequest>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistPlaylistDeleteRequest {
    return MpdCommandStoredPlaylistPlaylistDeleteRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistDeleteRequest>, I>>(
    object: I,
  ): MpdCommandStoredPlaylistPlaylistDeleteRequest {
    const message = createBaseMpdCommandStoredPlaylistPlaylistDeleteRequest();
    message.name = object.name ?? "";
    message.pos = object.pos ?? "";
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistPlaylistDeleteResponse(): MpdCommandStoredPlaylistPlaylistDeleteResponse {
  return {};
}

export const MpdCommandStoredPlaylistPlaylistDeleteResponse = {
  encode(_: MpdCommandStoredPlaylistPlaylistDeleteResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistPlaylistDeleteResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistPlaylistDeleteResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandStoredPlaylistPlaylistDeleteResponse {
    return {};
  },

  toJSON(_: MpdCommandStoredPlaylistPlaylistDeleteResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistDeleteResponse>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistPlaylistDeleteResponse {
    return MpdCommandStoredPlaylistPlaylistDeleteResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistDeleteResponse>, I>>(
    _: I,
  ): MpdCommandStoredPlaylistPlaylistDeleteResponse {
    const message = createBaseMpdCommandStoredPlaylistPlaylistDeleteResponse();
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistPlaylistMoveRequest(): MpdCommandStoredPlaylistPlaylistMoveRequest {
  return { name: "", from: "", to: "" };
}

export const MpdCommandStoredPlaylistPlaylistMoveRequest = {
  encode(message: MpdCommandStoredPlaylistPlaylistMoveRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.from !== "") {
      writer.uint32(18).string(message.from);
    }
    if (message.to !== "") {
      writer.uint32(26).string(message.to);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistPlaylistMoveRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistPlaylistMoveRequest();
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

          message.from = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.to = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandStoredPlaylistPlaylistMoveRequest {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      from: isSet(object.from) ? String(object.from) : "",
      to: isSet(object.to) ? String(object.to) : "",
    };
  },

  toJSON(message: MpdCommandStoredPlaylistPlaylistMoveRequest): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.from !== "") {
      obj.from = message.from;
    }
    if (message.to !== "") {
      obj.to = message.to;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistMoveRequest>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistPlaylistMoveRequest {
    return MpdCommandStoredPlaylistPlaylistMoveRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistMoveRequest>, I>>(
    object: I,
  ): MpdCommandStoredPlaylistPlaylistMoveRequest {
    const message = createBaseMpdCommandStoredPlaylistPlaylistMoveRequest();
    message.name = object.name ?? "";
    message.from = object.from ?? "";
    message.to = object.to ?? "";
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistPlaylistMoveResponse(): MpdCommandStoredPlaylistPlaylistMoveResponse {
  return {};
}

export const MpdCommandStoredPlaylistPlaylistMoveResponse = {
  encode(_: MpdCommandStoredPlaylistPlaylistMoveResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistPlaylistMoveResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistPlaylistMoveResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandStoredPlaylistPlaylistMoveResponse {
    return {};
  },

  toJSON(_: MpdCommandStoredPlaylistPlaylistMoveResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistMoveResponse>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistPlaylistMoveResponse {
    return MpdCommandStoredPlaylistPlaylistMoveResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistPlaylistMoveResponse>, I>>(
    _: I,
  ): MpdCommandStoredPlaylistPlaylistMoveResponse {
    const message = createBaseMpdCommandStoredPlaylistPlaylistMoveResponse();
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistRenameRequest(): MpdCommandStoredPlaylistRenameRequest {
  return { name: "", newName: "" };
}

export const MpdCommandStoredPlaylistRenameRequest = {
  encode(message: MpdCommandStoredPlaylistRenameRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.newName !== "") {
      writer.uint32(18).string(message.newName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistRenameRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistRenameRequest();
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

          message.newName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandStoredPlaylistRenameRequest {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      newName: isSet(object.newName) ? String(object.newName) : "",
    };
  },

  toJSON(message: MpdCommandStoredPlaylistRenameRequest): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.newName !== "") {
      obj.newName = message.newName;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistRenameRequest>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistRenameRequest {
    return MpdCommandStoredPlaylistRenameRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistRenameRequest>, I>>(
    object: I,
  ): MpdCommandStoredPlaylistRenameRequest {
    const message = createBaseMpdCommandStoredPlaylistRenameRequest();
    message.name = object.name ?? "";
    message.newName = object.newName ?? "";
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistRenameResponse(): MpdCommandStoredPlaylistRenameResponse {
  return {};
}

export const MpdCommandStoredPlaylistRenameResponse = {
  encode(_: MpdCommandStoredPlaylistRenameResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistRenameResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistRenameResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandStoredPlaylistRenameResponse {
    return {};
  },

  toJSON(_: MpdCommandStoredPlaylistRenameResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistRenameResponse>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistRenameResponse {
    return MpdCommandStoredPlaylistRenameResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistRenameResponse>, I>>(
    _: I,
  ): MpdCommandStoredPlaylistRenameResponse {
    const message = createBaseMpdCommandStoredPlaylistRenameResponse();
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistRemoveRequest(): MpdCommandStoredPlaylistRemoveRequest {
  return { name: "" };
}

export const MpdCommandStoredPlaylistRemoveRequest = {
  encode(message: MpdCommandStoredPlaylistRemoveRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistRemoveRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistRemoveRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandStoredPlaylistRemoveRequest {
    return { name: isSet(object.name) ? String(object.name) : "" };
  },

  toJSON(message: MpdCommandStoredPlaylistRemoveRequest): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistRemoveRequest>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistRemoveRequest {
    return MpdCommandStoredPlaylistRemoveRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistRemoveRequest>, I>>(
    object: I,
  ): MpdCommandStoredPlaylistRemoveRequest {
    const message = createBaseMpdCommandStoredPlaylistRemoveRequest();
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistRemoveResponse(): MpdCommandStoredPlaylistRemoveResponse {
  return {};
}

export const MpdCommandStoredPlaylistRemoveResponse = {
  encode(_: MpdCommandStoredPlaylistRemoveResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistRemoveResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistRemoveResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandStoredPlaylistRemoveResponse {
    return {};
  },

  toJSON(_: MpdCommandStoredPlaylistRemoveResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistRemoveResponse>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistRemoveResponse {
    return MpdCommandStoredPlaylistRemoveResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistRemoveResponse>, I>>(
    _: I,
  ): MpdCommandStoredPlaylistRemoveResponse {
    const message = createBaseMpdCommandStoredPlaylistRemoveResponse();
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistSaveRequest(): MpdCommandStoredPlaylistSaveRequest {
  return { name: "" };
}

export const MpdCommandStoredPlaylistSaveRequest = {
  encode(message: MpdCommandStoredPlaylistSaveRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistSaveRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistSaveRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandStoredPlaylistSaveRequest {
    return { name: isSet(object.name) ? String(object.name) : "" };
  },

  toJSON(message: MpdCommandStoredPlaylistSaveRequest): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistSaveRequest>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistSaveRequest {
    return MpdCommandStoredPlaylistSaveRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistSaveRequest>, I>>(
    object: I,
  ): MpdCommandStoredPlaylistSaveRequest {
    const message = createBaseMpdCommandStoredPlaylistSaveRequest();
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseMpdCommandStoredPlaylistSaveResponse(): MpdCommandStoredPlaylistSaveResponse {
  return {};
}

export const MpdCommandStoredPlaylistSaveResponse = {
  encode(_: MpdCommandStoredPlaylistSaveResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandStoredPlaylistSaveResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandStoredPlaylistSaveResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandStoredPlaylistSaveResponse {
    return {};
  },

  toJSON(_: MpdCommandStoredPlaylistSaveResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandStoredPlaylistSaveResponse>, I>>(
    base?: I,
  ): MpdCommandStoredPlaylistSaveResponse {
    return MpdCommandStoredPlaylistSaveResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandStoredPlaylistSaveResponse>, I>>(
    _: I,
  ): MpdCommandStoredPlaylistSaveResponse {
    const message = createBaseMpdCommandStoredPlaylistSaveResponse();
    return message;
  },
};

function createBaseMpdCommandDatabase(): MpdCommandDatabase {
  return {};
}

export const MpdCommandDatabase = {
  encode(_: MpdCommandDatabase, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandDatabase {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandDatabase();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandDatabase {
    return {};
  },

  toJSON(_: MpdCommandDatabase): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandDatabase>, I>>(base?: I): MpdCommandDatabase {
    return MpdCommandDatabase.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandDatabase>, I>>(_: I): MpdCommandDatabase {
    const message = createBaseMpdCommandDatabase();
    return message;
  },
};

function createBaseMpdCommandDatabaseListRequest(): MpdCommandDatabaseListRequest {
  return { tag: SongMetadataTag.UNKNOWN, conditions: [] };
}

export const MpdCommandDatabaseListRequest = {
  encode(message: MpdCommandDatabaseListRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tag !== SongMetadataTag.UNKNOWN) {
      writer.uint32(8).int32(songMetadataTagToNumber(message.tag));
    }
    for (const v of message.conditions) {
      FilterCondition.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandDatabaseListRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandDatabaseListRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.tag = songMetadataTagFromJSON(reader.int32());
          continue;
        case 2:
          if (tag !== 18) {
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

  fromJSON(object: any): MpdCommandDatabaseListRequest {
    return {
      tag: isSet(object.tag) ? songMetadataTagFromJSON(object.tag) : SongMetadataTag.UNKNOWN,
      conditions: Array.isArray(object?.conditions)
        ? object.conditions.map((e: any) => FilterCondition.fromJSON(e))
        : [],
    };
  },

  toJSON(message: MpdCommandDatabaseListRequest): unknown {
    const obj: any = {};
    if (message.tag !== SongMetadataTag.UNKNOWN) {
      obj.tag = songMetadataTagToJSON(message.tag);
    }
    if (message.conditions?.length) {
      obj.conditions = message.conditions.map((e) => FilterCondition.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandDatabaseListRequest>, I>>(base?: I): MpdCommandDatabaseListRequest {
    return MpdCommandDatabaseListRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandDatabaseListRequest>, I>>(
    object: I,
  ): MpdCommandDatabaseListRequest {
    const message = createBaseMpdCommandDatabaseListRequest();
    message.tag = object.tag ?? SongMetadataTag.UNKNOWN;
    message.conditions = object.conditions?.map((e) => FilterCondition.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMpdCommandDatabaseListResponse(): MpdCommandDatabaseListResponse {
  return { values: [] };
}

export const MpdCommandDatabaseListResponse = {
  encode(message: MpdCommandDatabaseListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.values) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandDatabaseListResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandDatabaseListResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.values.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandDatabaseListResponse {
    return { values: Array.isArray(object?.values) ? object.values.map((e: any) => String(e)) : [] };
  },

  toJSON(message: MpdCommandDatabaseListResponse): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandDatabaseListResponse>, I>>(base?: I): MpdCommandDatabaseListResponse {
    return MpdCommandDatabaseListResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandDatabaseListResponse>, I>>(
    object: I,
  ): MpdCommandDatabaseListResponse {
    const message = createBaseMpdCommandDatabaseListResponse();
    message.values = object.values?.map((e) => e) || [];
    return message;
  },
};

function createBaseMpdCommandDatabaseSearchRequest(): MpdCommandDatabaseSearchRequest {
  return { conditions: [] };
}

export const MpdCommandDatabaseSearchRequest = {
  encode(message: MpdCommandDatabaseSearchRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.conditions) {
      FilterCondition.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandDatabaseSearchRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandDatabaseSearchRequest();
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

  fromJSON(object: any): MpdCommandDatabaseSearchRequest {
    return {
      conditions: Array.isArray(object?.conditions)
        ? object.conditions.map((e: any) => FilterCondition.fromJSON(e))
        : [],
    };
  },

  toJSON(message: MpdCommandDatabaseSearchRequest): unknown {
    const obj: any = {};
    if (message.conditions?.length) {
      obj.conditions = message.conditions.map((e) => FilterCondition.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandDatabaseSearchRequest>, I>>(base?: I): MpdCommandDatabaseSearchRequest {
    return MpdCommandDatabaseSearchRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandDatabaseSearchRequest>, I>>(
    object: I,
  ): MpdCommandDatabaseSearchRequest {
    const message = createBaseMpdCommandDatabaseSearchRequest();
    message.conditions = object.conditions?.map((e) => FilterCondition.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMpdCommandDatabaseSearchResponse(): MpdCommandDatabaseSearchResponse {
  return { songs: [] };
}

export const MpdCommandDatabaseSearchResponse = {
  encode(message: MpdCommandDatabaseSearchResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.songs) {
      Song.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandDatabaseSearchResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandDatabaseSearchResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.songs.push(Song.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandDatabaseSearchResponse {
    return { songs: Array.isArray(object?.songs) ? object.songs.map((e: any) => Song.fromJSON(e)) : [] };
  },

  toJSON(message: MpdCommandDatabaseSearchResponse): unknown {
    const obj: any = {};
    if (message.songs?.length) {
      obj.songs = message.songs.map((e) => Song.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandDatabaseSearchResponse>, I>>(
    base?: I,
  ): MpdCommandDatabaseSearchResponse {
    return MpdCommandDatabaseSearchResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandDatabaseSearchResponse>, I>>(
    object: I,
  ): MpdCommandDatabaseSearchResponse {
    const message = createBaseMpdCommandDatabaseSearchResponse();
    message.songs = object.songs?.map((e) => Song.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMpdCommandDatabaseUpdateRequest(): MpdCommandDatabaseUpdateRequest {
  return {};
}

export const MpdCommandDatabaseUpdateRequest = {
  encode(_: MpdCommandDatabaseUpdateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandDatabaseUpdateRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandDatabaseUpdateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandDatabaseUpdateRequest {
    return {};
  },

  toJSON(_: MpdCommandDatabaseUpdateRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandDatabaseUpdateRequest>, I>>(base?: I): MpdCommandDatabaseUpdateRequest {
    return MpdCommandDatabaseUpdateRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandDatabaseUpdateRequest>, I>>(_: I): MpdCommandDatabaseUpdateRequest {
    const message = createBaseMpdCommandDatabaseUpdateRequest();
    return message;
  },
};

function createBaseMpdCommandDatabaseUpdateResponse(): MpdCommandDatabaseUpdateResponse {
  return {};
}

export const MpdCommandDatabaseUpdateResponse = {
  encode(_: MpdCommandDatabaseUpdateResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandDatabaseUpdateResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandDatabaseUpdateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandDatabaseUpdateResponse {
    return {};
  },

  toJSON(_: MpdCommandDatabaseUpdateResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandDatabaseUpdateResponse>, I>>(
    base?: I,
  ): MpdCommandDatabaseUpdateResponse {
    return MpdCommandDatabaseUpdateResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandDatabaseUpdateResponse>, I>>(
    _: I,
  ): MpdCommandDatabaseUpdateResponse {
    const message = createBaseMpdCommandDatabaseUpdateResponse();
    return message;
  },
};

function createBaseMpdCommandAudio(): MpdCommandAudio {
  return {};
}

export const MpdCommandAudio = {
  encode(_: MpdCommandAudio, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandAudio {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandAudio();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandAudio {
    return {};
  },

  toJSON(_: MpdCommandAudio): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandAudio>, I>>(base?: I): MpdCommandAudio {
    return MpdCommandAudio.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandAudio>, I>>(_: I): MpdCommandAudio {
    const message = createBaseMpdCommandAudio();
    return message;
  },
};

function createBaseMpdCommandAudioOutputsRequest(): MpdCommandAudioOutputsRequest {
  return {};
}

export const MpdCommandAudioOutputsRequest = {
  encode(_: MpdCommandAudioOutputsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandAudioOutputsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandAudioOutputsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandAudioOutputsRequest {
    return {};
  },

  toJSON(_: MpdCommandAudioOutputsRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandAudioOutputsRequest>, I>>(base?: I): MpdCommandAudioOutputsRequest {
    return MpdCommandAudioOutputsRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandAudioOutputsRequest>, I>>(_: I): MpdCommandAudioOutputsRequest {
    const message = createBaseMpdCommandAudioOutputsRequest();
    return message;
  },
};

function createBaseMpdCommandAudioOutputsResponse(): MpdCommandAudioOutputsResponse {
  return { devices: [] };
}

export const MpdCommandAudioOutputsResponse = {
  encode(message: MpdCommandAudioOutputsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.devices) {
      MpdOutputDevice.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandAudioOutputsResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandAudioOutputsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.devices.push(MpdOutputDevice.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandAudioOutputsResponse {
    return {
      devices: Array.isArray(object?.devices) ? object.devices.map((e: any) => MpdOutputDevice.fromJSON(e)) : [],
    };
  },

  toJSON(message: MpdCommandAudioOutputsResponse): unknown {
    const obj: any = {};
    if (message.devices?.length) {
      obj.devices = message.devices.map((e) => MpdOutputDevice.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandAudioOutputsResponse>, I>>(base?: I): MpdCommandAudioOutputsResponse {
    return MpdCommandAudioOutputsResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandAudioOutputsResponse>, I>>(
    object: I,
  ): MpdCommandAudioOutputsResponse {
    const message = createBaseMpdCommandAudioOutputsResponse();
    message.devices = object.devices?.map((e) => MpdOutputDevice.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMpdCommandUtility(): MpdCommandUtility {
  return {};
}

export const MpdCommandUtility = {
  encode(_: MpdCommandUtility, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandUtility {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandUtility();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandUtility {
    return {};
  },

  toJSON(_: MpdCommandUtility): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandUtility>, I>>(base?: I): MpdCommandUtility {
    return MpdCommandUtility.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandUtility>, I>>(_: I): MpdCommandUtility {
    const message = createBaseMpdCommandUtility();
    return message;
  },
};

function createBaseMpdCommandUtilityListAllSongsRequest(): MpdCommandUtilityListAllSongsRequest {
  return {};
}

export const MpdCommandUtilityListAllSongsRequest = {
  encode(_: MpdCommandUtilityListAllSongsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandUtilityListAllSongsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandUtilityListAllSongsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandUtilityListAllSongsRequest {
    return {};
  },

  toJSON(_: MpdCommandUtilityListAllSongsRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandUtilityListAllSongsRequest>, I>>(
    base?: I,
  ): MpdCommandUtilityListAllSongsRequest {
    return MpdCommandUtilityListAllSongsRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandUtilityListAllSongsRequest>, I>>(
    _: I,
  ): MpdCommandUtilityListAllSongsRequest {
    const message = createBaseMpdCommandUtilityListAllSongsRequest();
    return message;
  },
};

function createBaseMpdCommandUtilityListAllSongsResponse(): MpdCommandUtilityListAllSongsResponse {
  return { songs: [] };
}

export const MpdCommandUtilityListAllSongsResponse = {
  encode(message: MpdCommandUtilityListAllSongsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.songs) {
      Song.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandUtilityListAllSongsResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandUtilityListAllSongsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.songs.push(Song.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandUtilityListAllSongsResponse {
    return { songs: Array.isArray(object?.songs) ? object.songs.map((e: any) => Song.fromJSON(e)) : [] };
  },

  toJSON(message: MpdCommandUtilityListAllSongsResponse): unknown {
    const obj: any = {};
    if (message.songs?.length) {
      obj.songs = message.songs.map((e) => Song.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandUtilityListAllSongsResponse>, I>>(
    base?: I,
  ): MpdCommandUtilityListAllSongsResponse {
    return MpdCommandUtilityListAllSongsResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandUtilityListAllSongsResponse>, I>>(
    object: I,
  ): MpdCommandUtilityListAllSongsResponse {
    const message = createBaseMpdCommandUtilityListAllSongsResponse();
    message.songs = object.songs?.map((e) => Song.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMpdCommandUtilityListAllFoldersRequest(): MpdCommandUtilityListAllFoldersRequest {
  return {};
}

export const MpdCommandUtilityListAllFoldersRequest = {
  encode(_: MpdCommandUtilityListAllFoldersRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandUtilityListAllFoldersRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandUtilityListAllFoldersRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MpdCommandUtilityListAllFoldersRequest {
    return {};
  },

  toJSON(_: MpdCommandUtilityListAllFoldersRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandUtilityListAllFoldersRequest>, I>>(
    base?: I,
  ): MpdCommandUtilityListAllFoldersRequest {
    return MpdCommandUtilityListAllFoldersRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandUtilityListAllFoldersRequest>, I>>(
    _: I,
  ): MpdCommandUtilityListAllFoldersRequest {
    const message = createBaseMpdCommandUtilityListAllFoldersRequest();
    return message;
  },
};

function createBaseMpdCommandUtilityListAllFoldersResponse(): MpdCommandUtilityListAllFoldersResponse {
  return { folders: [] };
}

export const MpdCommandUtilityListAllFoldersResponse = {
  encode(message: MpdCommandUtilityListAllFoldersResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.folders) {
      Folder.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandUtilityListAllFoldersResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandUtilityListAllFoldersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.folders.push(Folder.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandUtilityListAllFoldersResponse {
    return { folders: Array.isArray(object?.folders) ? object.folders.map((e: any) => Folder.fromJSON(e)) : [] };
  },

  toJSON(message: MpdCommandUtilityListAllFoldersResponse): unknown {
    const obj: any = {};
    if (message.folders?.length) {
      obj.folders = message.folders.map((e) => Folder.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandUtilityListAllFoldersResponse>, I>>(
    base?: I,
  ): MpdCommandUtilityListAllFoldersResponse {
    return MpdCommandUtilityListAllFoldersResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandUtilityListAllFoldersResponse>, I>>(
    object: I,
  ): MpdCommandUtilityListAllFoldersResponse {
    const message = createBaseMpdCommandUtilityListAllFoldersResponse();
    message.folders = object.folders?.map((e) => Folder.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMpdCommandUtilityListSongsInFolderRequest(): MpdCommandUtilityListSongsInFolderRequest {
  return { folder: undefined };
}

export const MpdCommandUtilityListSongsInFolderRequest = {
  encode(message: MpdCommandUtilityListSongsInFolderRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.folder !== undefined) {
      Folder.encode(message.folder, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandUtilityListSongsInFolderRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandUtilityListSongsInFolderRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.folder = Folder.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandUtilityListSongsInFolderRequest {
    return { folder: isSet(object.folder) ? Folder.fromJSON(object.folder) : undefined };
  },

  toJSON(message: MpdCommandUtilityListSongsInFolderRequest): unknown {
    const obj: any = {};
    if (message.folder !== undefined) {
      obj.folder = Folder.toJSON(message.folder);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandUtilityListSongsInFolderRequest>, I>>(
    base?: I,
  ): MpdCommandUtilityListSongsInFolderRequest {
    return MpdCommandUtilityListSongsInFolderRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandUtilityListSongsInFolderRequest>, I>>(
    object: I,
  ): MpdCommandUtilityListSongsInFolderRequest {
    const message = createBaseMpdCommandUtilityListSongsInFolderRequest();
    message.folder = (object.folder !== undefined && object.folder !== null)
      ? Folder.fromPartial(object.folder)
      : undefined;
    return message;
  },
};

function createBaseMpdCommandUtilityListSongsInFolderResponse(): MpdCommandUtilityListSongsInFolderResponse {
  return { songs: [] };
}

export const MpdCommandUtilityListSongsInFolderResponse = {
  encode(message: MpdCommandUtilityListSongsInFolderResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.songs) {
      Song.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdCommandUtilityListSongsInFolderResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdCommandUtilityListSongsInFolderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.songs.push(Song.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdCommandUtilityListSongsInFolderResponse {
    return { songs: Array.isArray(object?.songs) ? object.songs.map((e: any) => Song.fromJSON(e)) : [] };
  },

  toJSON(message: MpdCommandUtilityListSongsInFolderResponse): unknown {
    const obj: any = {};
    if (message.songs?.length) {
      obj.songs = message.songs.map((e) => Song.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdCommandUtilityListSongsInFolderResponse>, I>>(
    base?: I,
  ): MpdCommandUtilityListSongsInFolderResponse {
    return MpdCommandUtilityListSongsInFolderResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdCommandUtilityListSongsInFolderResponse>, I>>(
    object: I,
  ): MpdCommandUtilityListSongsInFolderResponse {
    const message = createBaseMpdCommandUtilityListSongsInFolderResponse();
    message.songs = object.songs?.map((e) => Song.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMpdRequest(): MpdRequest {
  return { profile: undefined, command: undefined };
}

export const MpdRequest = {
  encode(message: MpdRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.profile !== undefined) {
      MpdProfile.encode(message.profile, writer.uint32(10).fork()).ldelim();
    }
    switch (message.command?.$case) {
      case "ping":
        MpdCommandConnectionPingRequest.encode(message.command.ping, writer.uint32(18).fork()).ldelim();
        break;
      case "next":
        MpdCommandControlNextRequest.encode(message.command.next, writer.uint32(26).fork()).ldelim();
        break;
      case "pause":
        MpdCommandControlPauseRequest.encode(message.command.pause, writer.uint32(34).fork()).ldelim();
        break;
      case "play":
        MpdCommandControlPlayRequest.encode(message.command.play, writer.uint32(42).fork()).ldelim();
        break;
      case "previous":
        MpdCommandControlPreviousRequest.encode(message.command.previous, writer.uint32(50).fork()).ldelim();
        break;
      case "seek":
        MpdCommandControlSeekRequest.encode(message.command.seek, writer.uint32(58).fork()).ldelim();
        break;
      case "stop":
        MpdCommandControlStopRequest.encode(message.command.stop, writer.uint32(66).fork()).ldelim();
        break;
      case "consume":
        MpdCommandPlaybackConsumeRequest.encode(message.command.consume, writer.uint32(74).fork()).ldelim();
        break;
      case "random":
        MpdCommandPlaybackRandomRequest.encode(message.command.random, writer.uint32(82).fork()).ldelim();
        break;
      case "repeat":
        MpdCommandPlaybackRepeatRequest.encode(message.command.repeat, writer.uint32(90).fork()).ldelim();
        break;
      case "setvol":
        MpdCommandPlaybackSetVolRequest.encode(message.command.setvol, writer.uint32(98).fork()).ldelim();
        break;
      case "getvol":
        MpdCommandPlaybackGetVolRequest.encode(message.command.getvol, writer.uint32(106).fork()).ldelim();
        break;
      case "single":
        MpdCommandPlaybackSingleRequest.encode(message.command.single, writer.uint32(114).fork()).ldelim();
        break;
      case "currentsong":
        MpdCommandStatusCurrentSongRequest.encode(message.command.currentsong, writer.uint32(122).fork()).ldelim();
        break;
      case "status":
        MpdCommandStatusStatusRequest.encode(message.command.status, writer.uint32(130).fork()).ldelim();
        break;
      case "stats":
        MpdCommandStatusStatsRequest.encode(message.command.stats, writer.uint32(138).fork()).ldelim();
        break;
      case "add":
        MpdCommandQueueAddRequest.encode(message.command.add, writer.uint32(146).fork()).ldelim();
        break;
      case "clear":
        MpdCommandQueueClearRequest.encode(message.command.clear, writer.uint32(154).fork()).ldelim();
        break;
      case "delete":
        MpdCommandQueueDeleteRequest.encode(message.command.delete, writer.uint32(162).fork()).ldelim();
        break;
      case "move":
        MpdCommandQueueMoveRequest.encode(message.command.move, writer.uint32(170).fork()).ldelim();
        break;
      case "playlistinfo":
        MpdCommandQueuePlaylistInfoRequest.encode(message.command.playlistinfo, writer.uint32(178).fork()).ldelim();
        break;
      case "shuffle":
        MpdCommandQueueShuffleRequest.encode(message.command.shuffle, writer.uint32(186).fork()).ldelim();
        break;
      case "listplaylistinfo":
        MpdCommandStoredPlaylistListPlaylistInfoRequest.encode(
          message.command.listplaylistinfo,
          writer.uint32(194).fork(),
        ).ldelim();
        break;
      case "listplaylists":
        MpdCommandStoredPlaylistListPlaylistsRequest.encode(message.command.listplaylists, writer.uint32(202).fork())
          .ldelim();
        break;
      case "playlistadd":
        MpdCommandStoredPlaylistPlaylistAddRequest.encode(message.command.playlistadd, writer.uint32(210).fork())
          .ldelim();
        break;
      case "playlistclear":
        MpdCommandStoredPlaylistPlaylistClearRequest.encode(message.command.playlistclear, writer.uint32(218).fork())
          .ldelim();
        break;
      case "playlistdelete":
        MpdCommandStoredPlaylistPlaylistDeleteRequest.encode(message.command.playlistdelete, writer.uint32(226).fork())
          .ldelim();
        break;
      case "playlistmove":
        MpdCommandStoredPlaylistPlaylistMoveRequest.encode(message.command.playlistmove, writer.uint32(234).fork())
          .ldelim();
        break;
      case "rename":
        MpdCommandStoredPlaylistRenameRequest.encode(message.command.rename, writer.uint32(242).fork()).ldelim();
        break;
      case "rm":
        MpdCommandStoredPlaylistRemoveRequest.encode(message.command.rm, writer.uint32(250).fork()).ldelim();
        break;
      case "save":
        MpdCommandStoredPlaylistSaveRequest.encode(message.command.save, writer.uint32(258).fork()).ldelim();
        break;
      case "list":
        MpdCommandDatabaseListRequest.encode(message.command.list, writer.uint32(266).fork()).ldelim();
        break;
      case "search":
        MpdCommandDatabaseSearchRequest.encode(message.command.search, writer.uint32(274).fork()).ldelim();
        break;
      case "update":
        MpdCommandDatabaseUpdateRequest.encode(message.command.update, writer.uint32(282).fork()).ldelim();
        break;
      case "outputs":
        MpdCommandAudioOutputsRequest.encode(message.command.outputs, writer.uint32(290).fork()).ldelim();
        break;
      case "listAllSongs":
        MpdCommandUtilityListAllSongsRequest.encode(message.command.listAllSongs, writer.uint32(298).fork()).ldelim();
        break;
      case "listAllFolders":
        MpdCommandUtilityListAllFoldersRequest.encode(message.command.listAllFolders, writer.uint32(306).fork())
          .ldelim();
        break;
      case "listSongsInFolder":
        MpdCommandUtilityListSongsInFolderRequest.encode(message.command.listSongsInFolder, writer.uint32(314).fork())
          .ldelim();
        break;
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.profile = MpdProfile.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.command = { $case: "ping", ping: MpdCommandConnectionPingRequest.decode(reader, reader.uint32()) };
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.command = { $case: "next", next: MpdCommandControlNextRequest.decode(reader, reader.uint32()) };
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.command = { $case: "pause", pause: MpdCommandControlPauseRequest.decode(reader, reader.uint32()) };
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.command = { $case: "play", play: MpdCommandControlPlayRequest.decode(reader, reader.uint32()) };
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.command = {
            $case: "previous",
            previous: MpdCommandControlPreviousRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.command = { $case: "seek", seek: MpdCommandControlSeekRequest.decode(reader, reader.uint32()) };
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.command = { $case: "stop", stop: MpdCommandControlStopRequest.decode(reader, reader.uint32()) };
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.command = {
            $case: "consume",
            consume: MpdCommandPlaybackConsumeRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.command = {
            $case: "random",
            random: MpdCommandPlaybackRandomRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.command = {
            $case: "repeat",
            repeat: MpdCommandPlaybackRepeatRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.command = {
            $case: "setvol",
            setvol: MpdCommandPlaybackSetVolRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.command = {
            $case: "getvol",
            getvol: MpdCommandPlaybackGetVolRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.command = {
            $case: "single",
            single: MpdCommandPlaybackSingleRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.command = {
            $case: "currentsong",
            currentsong: MpdCommandStatusCurrentSongRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.command = { $case: "status", status: MpdCommandStatusStatusRequest.decode(reader, reader.uint32()) };
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.command = { $case: "stats", stats: MpdCommandStatusStatsRequest.decode(reader, reader.uint32()) };
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.command = { $case: "add", add: MpdCommandQueueAddRequest.decode(reader, reader.uint32()) };
          continue;
        case 19:
          if (tag !== 154) {
            break;
          }

          message.command = { $case: "clear", clear: MpdCommandQueueClearRequest.decode(reader, reader.uint32()) };
          continue;
        case 20:
          if (tag !== 162) {
            break;
          }

          message.command = { $case: "delete", delete: MpdCommandQueueDeleteRequest.decode(reader, reader.uint32()) };
          continue;
        case 21:
          if (tag !== 170) {
            break;
          }

          message.command = { $case: "move", move: MpdCommandQueueMoveRequest.decode(reader, reader.uint32()) };
          continue;
        case 22:
          if (tag !== 178) {
            break;
          }

          message.command = {
            $case: "playlistinfo",
            playlistinfo: MpdCommandQueuePlaylistInfoRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 23:
          if (tag !== 186) {
            break;
          }

          message.command = {
            $case: "shuffle",
            shuffle: MpdCommandQueueShuffleRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 24:
          if (tag !== 194) {
            break;
          }

          message.command = {
            $case: "listplaylistinfo",
            listplaylistinfo: MpdCommandStoredPlaylistListPlaylistInfoRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 25:
          if (tag !== 202) {
            break;
          }

          message.command = {
            $case: "listplaylists",
            listplaylists: MpdCommandStoredPlaylistListPlaylistsRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 26:
          if (tag !== 210) {
            break;
          }

          message.command = {
            $case: "playlistadd",
            playlistadd: MpdCommandStoredPlaylistPlaylistAddRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 27:
          if (tag !== 218) {
            break;
          }

          message.command = {
            $case: "playlistclear",
            playlistclear: MpdCommandStoredPlaylistPlaylistClearRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 28:
          if (tag !== 226) {
            break;
          }

          message.command = {
            $case: "playlistdelete",
            playlistdelete: MpdCommandStoredPlaylistPlaylistDeleteRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 29:
          if (tag !== 234) {
            break;
          }

          message.command = {
            $case: "playlistmove",
            playlistmove: MpdCommandStoredPlaylistPlaylistMoveRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 30:
          if (tag !== 242) {
            break;
          }

          message.command = {
            $case: "rename",
            rename: MpdCommandStoredPlaylistRenameRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 31:
          if (tag !== 250) {
            break;
          }

          message.command = { $case: "rm", rm: MpdCommandStoredPlaylistRemoveRequest.decode(reader, reader.uint32()) };
          continue;
        case 32:
          if (tag !== 258) {
            break;
          }

          message.command = {
            $case: "save",
            save: MpdCommandStoredPlaylistSaveRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 33:
          if (tag !== 266) {
            break;
          }

          message.command = { $case: "list", list: MpdCommandDatabaseListRequest.decode(reader, reader.uint32()) };
          continue;
        case 34:
          if (tag !== 274) {
            break;
          }

          message.command = {
            $case: "search",
            search: MpdCommandDatabaseSearchRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 35:
          if (tag !== 282) {
            break;
          }

          message.command = {
            $case: "update",
            update: MpdCommandDatabaseUpdateRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 36:
          if (tag !== 290) {
            break;
          }

          message.command = {
            $case: "outputs",
            outputs: MpdCommandAudioOutputsRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 37:
          if (tag !== 298) {
            break;
          }

          message.command = {
            $case: "listAllSongs",
            listAllSongs: MpdCommandUtilityListAllSongsRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 38:
          if (tag !== 306) {
            break;
          }

          message.command = {
            $case: "listAllFolders",
            listAllFolders: MpdCommandUtilityListAllFoldersRequest.decode(reader, reader.uint32()),
          };
          continue;
        case 39:
          if (tag !== 314) {
            break;
          }

          message.command = {
            $case: "listSongsInFolder",
            listSongsInFolder: MpdCommandUtilityListSongsInFolderRequest.decode(reader, reader.uint32()),
          };
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdRequest {
    return {
      profile: isSet(object.profile) ? MpdProfile.fromJSON(object.profile) : undefined,
      command: isSet(object.ping)
        ? { $case: "ping", ping: MpdCommandConnectionPingRequest.fromJSON(object.ping) }
        : isSet(object.next)
        ? { $case: "next", next: MpdCommandControlNextRequest.fromJSON(object.next) }
        : isSet(object.pause)
        ? { $case: "pause", pause: MpdCommandControlPauseRequest.fromJSON(object.pause) }
        : isSet(object.play)
        ? { $case: "play", play: MpdCommandControlPlayRequest.fromJSON(object.play) }
        : isSet(object.previous)
        ? { $case: "previous", previous: MpdCommandControlPreviousRequest.fromJSON(object.previous) }
        : isSet(object.seek)
        ? { $case: "seek", seek: MpdCommandControlSeekRequest.fromJSON(object.seek) }
        : isSet(object.stop)
        ? { $case: "stop", stop: MpdCommandControlStopRequest.fromJSON(object.stop) }
        : isSet(object.consume)
        ? { $case: "consume", consume: MpdCommandPlaybackConsumeRequest.fromJSON(object.consume) }
        : isSet(object.random)
        ? { $case: "random", random: MpdCommandPlaybackRandomRequest.fromJSON(object.random) }
        : isSet(object.repeat)
        ? { $case: "repeat", repeat: MpdCommandPlaybackRepeatRequest.fromJSON(object.repeat) }
        : isSet(object.setvol)
        ? { $case: "setvol", setvol: MpdCommandPlaybackSetVolRequest.fromJSON(object.setvol) }
        : isSet(object.getvol)
        ? { $case: "getvol", getvol: MpdCommandPlaybackGetVolRequest.fromJSON(object.getvol) }
        : isSet(object.single)
        ? { $case: "single", single: MpdCommandPlaybackSingleRequest.fromJSON(object.single) }
        : isSet(object.currentsong)
        ? { $case: "currentsong", currentsong: MpdCommandStatusCurrentSongRequest.fromJSON(object.currentsong) }
        : isSet(object.status)
        ? { $case: "status", status: MpdCommandStatusStatusRequest.fromJSON(object.status) }
        : isSet(object.stats)
        ? { $case: "stats", stats: MpdCommandStatusStatsRequest.fromJSON(object.stats) }
        : isSet(object.add)
        ? { $case: "add", add: MpdCommandQueueAddRequest.fromJSON(object.add) }
        : isSet(object.clear)
        ? { $case: "clear", clear: MpdCommandQueueClearRequest.fromJSON(object.clear) }
        : isSet(object.delete)
        ? { $case: "delete", delete: MpdCommandQueueDeleteRequest.fromJSON(object.delete) }
        : isSet(object.move)
        ? { $case: "move", move: MpdCommandQueueMoveRequest.fromJSON(object.move) }
        : isSet(object.playlistinfo)
        ? { $case: "playlistinfo", playlistinfo: MpdCommandQueuePlaylistInfoRequest.fromJSON(object.playlistinfo) }
        : isSet(object.shuffle)
        ? { $case: "shuffle", shuffle: MpdCommandQueueShuffleRequest.fromJSON(object.shuffle) }
        : isSet(object.listplaylistinfo)
        ? {
          $case: "listplaylistinfo",
          listplaylistinfo: MpdCommandStoredPlaylistListPlaylistInfoRequest.fromJSON(object.listplaylistinfo),
        }
        : isSet(object.listplaylists)
        ? {
          $case: "listplaylists",
          listplaylists: MpdCommandStoredPlaylistListPlaylistsRequest.fromJSON(object.listplaylists),
        }
        : isSet(object.playlistadd)
        ? { $case: "playlistadd", playlistadd: MpdCommandStoredPlaylistPlaylistAddRequest.fromJSON(object.playlistadd) }
        : isSet(object.playlistclear)
        ? {
          $case: "playlistclear",
          playlistclear: MpdCommandStoredPlaylistPlaylistClearRequest.fromJSON(object.playlistclear),
        }
        : isSet(object.playlistdelete)
        ? {
          $case: "playlistdelete",
          playlistdelete: MpdCommandStoredPlaylistPlaylistDeleteRequest.fromJSON(object.playlistdelete),
        }
        : isSet(object.playlistmove)
        ? {
          $case: "playlistmove",
          playlistmove: MpdCommandStoredPlaylistPlaylistMoveRequest.fromJSON(object.playlistmove),
        }
        : isSet(object.rename)
        ? { $case: "rename", rename: MpdCommandStoredPlaylistRenameRequest.fromJSON(object.rename) }
        : isSet(object.rm)
        ? { $case: "rm", rm: MpdCommandStoredPlaylistRemoveRequest.fromJSON(object.rm) }
        : isSet(object.save)
        ? { $case: "save", save: MpdCommandStoredPlaylistSaveRequest.fromJSON(object.save) }
        : isSet(object.list)
        ? { $case: "list", list: MpdCommandDatabaseListRequest.fromJSON(object.list) }
        : isSet(object.search)
        ? { $case: "search", search: MpdCommandDatabaseSearchRequest.fromJSON(object.search) }
        : isSet(object.update)
        ? { $case: "update", update: MpdCommandDatabaseUpdateRequest.fromJSON(object.update) }
        : isSet(object.outputs)
        ? { $case: "outputs", outputs: MpdCommandAudioOutputsRequest.fromJSON(object.outputs) }
        : isSet(object.listAllSongs)
        ? { $case: "listAllSongs", listAllSongs: MpdCommandUtilityListAllSongsRequest.fromJSON(object.listAllSongs) }
        : isSet(object.listAllFolders)
        ? {
          $case: "listAllFolders",
          listAllFolders: MpdCommandUtilityListAllFoldersRequest.fromJSON(object.listAllFolders),
        }
        : isSet(object.listSongsInFolder)
        ? {
          $case: "listSongsInFolder",
          listSongsInFolder: MpdCommandUtilityListSongsInFolderRequest.fromJSON(object.listSongsInFolder),
        }
        : undefined,
    };
  },

  toJSON(message: MpdRequest): unknown {
    const obj: any = {};
    if (message.profile !== undefined) {
      obj.profile = MpdProfile.toJSON(message.profile);
    }
    if (message.command?.$case === "ping") {
      obj.ping = MpdCommandConnectionPingRequest.toJSON(message.command.ping);
    }
    if (message.command?.$case === "next") {
      obj.next = MpdCommandControlNextRequest.toJSON(message.command.next);
    }
    if (message.command?.$case === "pause") {
      obj.pause = MpdCommandControlPauseRequest.toJSON(message.command.pause);
    }
    if (message.command?.$case === "play") {
      obj.play = MpdCommandControlPlayRequest.toJSON(message.command.play);
    }
    if (message.command?.$case === "previous") {
      obj.previous = MpdCommandControlPreviousRequest.toJSON(message.command.previous);
    }
    if (message.command?.$case === "seek") {
      obj.seek = MpdCommandControlSeekRequest.toJSON(message.command.seek);
    }
    if (message.command?.$case === "stop") {
      obj.stop = MpdCommandControlStopRequest.toJSON(message.command.stop);
    }
    if (message.command?.$case === "consume") {
      obj.consume = MpdCommandPlaybackConsumeRequest.toJSON(message.command.consume);
    }
    if (message.command?.$case === "random") {
      obj.random = MpdCommandPlaybackRandomRequest.toJSON(message.command.random);
    }
    if (message.command?.$case === "repeat") {
      obj.repeat = MpdCommandPlaybackRepeatRequest.toJSON(message.command.repeat);
    }
    if (message.command?.$case === "setvol") {
      obj.setvol = MpdCommandPlaybackSetVolRequest.toJSON(message.command.setvol);
    }
    if (message.command?.$case === "getvol") {
      obj.getvol = MpdCommandPlaybackGetVolRequest.toJSON(message.command.getvol);
    }
    if (message.command?.$case === "single") {
      obj.single = MpdCommandPlaybackSingleRequest.toJSON(message.command.single);
    }
    if (message.command?.$case === "currentsong") {
      obj.currentsong = MpdCommandStatusCurrentSongRequest.toJSON(message.command.currentsong);
    }
    if (message.command?.$case === "status") {
      obj.status = MpdCommandStatusStatusRequest.toJSON(message.command.status);
    }
    if (message.command?.$case === "stats") {
      obj.stats = MpdCommandStatusStatsRequest.toJSON(message.command.stats);
    }
    if (message.command?.$case === "add") {
      obj.add = MpdCommandQueueAddRequest.toJSON(message.command.add);
    }
    if (message.command?.$case === "clear") {
      obj.clear = MpdCommandQueueClearRequest.toJSON(message.command.clear);
    }
    if (message.command?.$case === "delete") {
      obj.delete = MpdCommandQueueDeleteRequest.toJSON(message.command.delete);
    }
    if (message.command?.$case === "move") {
      obj.move = MpdCommandQueueMoveRequest.toJSON(message.command.move);
    }
    if (message.command?.$case === "playlistinfo") {
      obj.playlistinfo = MpdCommandQueuePlaylistInfoRequest.toJSON(message.command.playlistinfo);
    }
    if (message.command?.$case === "shuffle") {
      obj.shuffle = MpdCommandQueueShuffleRequest.toJSON(message.command.shuffle);
    }
    if (message.command?.$case === "listplaylistinfo") {
      obj.listplaylistinfo = MpdCommandStoredPlaylistListPlaylistInfoRequest.toJSON(message.command.listplaylistinfo);
    }
    if (message.command?.$case === "listplaylists") {
      obj.listplaylists = MpdCommandStoredPlaylistListPlaylistsRequest.toJSON(message.command.listplaylists);
    }
    if (message.command?.$case === "playlistadd") {
      obj.playlistadd = MpdCommandStoredPlaylistPlaylistAddRequest.toJSON(message.command.playlistadd);
    }
    if (message.command?.$case === "playlistclear") {
      obj.playlistclear = MpdCommandStoredPlaylistPlaylistClearRequest.toJSON(message.command.playlistclear);
    }
    if (message.command?.$case === "playlistdelete") {
      obj.playlistdelete = MpdCommandStoredPlaylistPlaylistDeleteRequest.toJSON(message.command.playlistdelete);
    }
    if (message.command?.$case === "playlistmove") {
      obj.playlistmove = MpdCommandStoredPlaylistPlaylistMoveRequest.toJSON(message.command.playlistmove);
    }
    if (message.command?.$case === "rename") {
      obj.rename = MpdCommandStoredPlaylistRenameRequest.toJSON(message.command.rename);
    }
    if (message.command?.$case === "rm") {
      obj.rm = MpdCommandStoredPlaylistRemoveRequest.toJSON(message.command.rm);
    }
    if (message.command?.$case === "save") {
      obj.save = MpdCommandStoredPlaylistSaveRequest.toJSON(message.command.save);
    }
    if (message.command?.$case === "list") {
      obj.list = MpdCommandDatabaseListRequest.toJSON(message.command.list);
    }
    if (message.command?.$case === "search") {
      obj.search = MpdCommandDatabaseSearchRequest.toJSON(message.command.search);
    }
    if (message.command?.$case === "update") {
      obj.update = MpdCommandDatabaseUpdateRequest.toJSON(message.command.update);
    }
    if (message.command?.$case === "outputs") {
      obj.outputs = MpdCommandAudioOutputsRequest.toJSON(message.command.outputs);
    }
    if (message.command?.$case === "listAllSongs") {
      obj.listAllSongs = MpdCommandUtilityListAllSongsRequest.toJSON(message.command.listAllSongs);
    }
    if (message.command?.$case === "listAllFolders") {
      obj.listAllFolders = MpdCommandUtilityListAllFoldersRequest.toJSON(message.command.listAllFolders);
    }
    if (message.command?.$case === "listSongsInFolder") {
      obj.listSongsInFolder = MpdCommandUtilityListSongsInFolderRequest.toJSON(message.command.listSongsInFolder);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdRequest>, I>>(base?: I): MpdRequest {
    return MpdRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdRequest>, I>>(object: I): MpdRequest {
    const message = createBaseMpdRequest();
    message.profile = (object.profile !== undefined && object.profile !== null)
      ? MpdProfile.fromPartial(object.profile)
      : undefined;
    if (object.command?.$case === "ping" && object.command?.ping !== undefined && object.command?.ping !== null) {
      message.command = { $case: "ping", ping: MpdCommandConnectionPingRequest.fromPartial(object.command.ping) };
    }
    if (object.command?.$case === "next" && object.command?.next !== undefined && object.command?.next !== null) {
      message.command = { $case: "next", next: MpdCommandControlNextRequest.fromPartial(object.command.next) };
    }
    if (object.command?.$case === "pause" && object.command?.pause !== undefined && object.command?.pause !== null) {
      message.command = { $case: "pause", pause: MpdCommandControlPauseRequest.fromPartial(object.command.pause) };
    }
    if (object.command?.$case === "play" && object.command?.play !== undefined && object.command?.play !== null) {
      message.command = { $case: "play", play: MpdCommandControlPlayRequest.fromPartial(object.command.play) };
    }
    if (
      object.command?.$case === "previous" &&
      object.command?.previous !== undefined &&
      object.command?.previous !== null
    ) {
      message.command = {
        $case: "previous",
        previous: MpdCommandControlPreviousRequest.fromPartial(object.command.previous),
      };
    }
    if (object.command?.$case === "seek" && object.command?.seek !== undefined && object.command?.seek !== null) {
      message.command = { $case: "seek", seek: MpdCommandControlSeekRequest.fromPartial(object.command.seek) };
    }
    if (object.command?.$case === "stop" && object.command?.stop !== undefined && object.command?.stop !== null) {
      message.command = { $case: "stop", stop: MpdCommandControlStopRequest.fromPartial(object.command.stop) };
    }
    if (
      object.command?.$case === "consume" && object.command?.consume !== undefined && object.command?.consume !== null
    ) {
      message.command = {
        $case: "consume",
        consume: MpdCommandPlaybackConsumeRequest.fromPartial(object.command.consume),
      };
    }
    if (object.command?.$case === "random" && object.command?.random !== undefined && object.command?.random !== null) {
      message.command = { $case: "random", random: MpdCommandPlaybackRandomRequest.fromPartial(object.command.random) };
    }
    if (object.command?.$case === "repeat" && object.command?.repeat !== undefined && object.command?.repeat !== null) {
      message.command = { $case: "repeat", repeat: MpdCommandPlaybackRepeatRequest.fromPartial(object.command.repeat) };
    }
    if (object.command?.$case === "setvol" && object.command?.setvol !== undefined && object.command?.setvol !== null) {
      message.command = { $case: "setvol", setvol: MpdCommandPlaybackSetVolRequest.fromPartial(object.command.setvol) };
    }
    if (object.command?.$case === "getvol" && object.command?.getvol !== undefined && object.command?.getvol !== null) {
      message.command = { $case: "getvol", getvol: MpdCommandPlaybackGetVolRequest.fromPartial(object.command.getvol) };
    }
    if (object.command?.$case === "single" && object.command?.single !== undefined && object.command?.single !== null) {
      message.command = { $case: "single", single: MpdCommandPlaybackSingleRequest.fromPartial(object.command.single) };
    }
    if (
      object.command?.$case === "currentsong" &&
      object.command?.currentsong !== undefined &&
      object.command?.currentsong !== null
    ) {
      message.command = {
        $case: "currentsong",
        currentsong: MpdCommandStatusCurrentSongRequest.fromPartial(object.command.currentsong),
      };
    }
    if (object.command?.$case === "status" && object.command?.status !== undefined && object.command?.status !== null) {
      message.command = { $case: "status", status: MpdCommandStatusStatusRequest.fromPartial(object.command.status) };
    }
    if (object.command?.$case === "stats" && object.command?.stats !== undefined && object.command?.stats !== null) {
      message.command = { $case: "stats", stats: MpdCommandStatusStatsRequest.fromPartial(object.command.stats) };
    }
    if (object.command?.$case === "add" && object.command?.add !== undefined && object.command?.add !== null) {
      message.command = { $case: "add", add: MpdCommandQueueAddRequest.fromPartial(object.command.add) };
    }
    if (object.command?.$case === "clear" && object.command?.clear !== undefined && object.command?.clear !== null) {
      message.command = { $case: "clear", clear: MpdCommandQueueClearRequest.fromPartial(object.command.clear) };
    }
    if (object.command?.$case === "delete" && object.command?.delete !== undefined && object.command?.delete !== null) {
      message.command = { $case: "delete", delete: MpdCommandQueueDeleteRequest.fromPartial(object.command.delete) };
    }
    if (object.command?.$case === "move" && object.command?.move !== undefined && object.command?.move !== null) {
      message.command = { $case: "move", move: MpdCommandQueueMoveRequest.fromPartial(object.command.move) };
    }
    if (
      object.command?.$case === "playlistinfo" &&
      object.command?.playlistinfo !== undefined &&
      object.command?.playlistinfo !== null
    ) {
      message.command = {
        $case: "playlistinfo",
        playlistinfo: MpdCommandQueuePlaylistInfoRequest.fromPartial(object.command.playlistinfo),
      };
    }
    if (
      object.command?.$case === "shuffle" && object.command?.shuffle !== undefined && object.command?.shuffle !== null
    ) {
      message.command = {
        $case: "shuffle",
        shuffle: MpdCommandQueueShuffleRequest.fromPartial(object.command.shuffle),
      };
    }
    if (
      object.command?.$case === "listplaylistinfo" &&
      object.command?.listplaylistinfo !== undefined &&
      object.command?.listplaylistinfo !== null
    ) {
      message.command = {
        $case: "listplaylistinfo",
        listplaylistinfo: MpdCommandStoredPlaylistListPlaylistInfoRequest.fromPartial(object.command.listplaylistinfo),
      };
    }
    if (
      object.command?.$case === "listplaylists" &&
      object.command?.listplaylists !== undefined &&
      object.command?.listplaylists !== null
    ) {
      message.command = {
        $case: "listplaylists",
        listplaylists: MpdCommandStoredPlaylistListPlaylistsRequest.fromPartial(object.command.listplaylists),
      };
    }
    if (
      object.command?.$case === "playlistadd" &&
      object.command?.playlistadd !== undefined &&
      object.command?.playlistadd !== null
    ) {
      message.command = {
        $case: "playlistadd",
        playlistadd: MpdCommandStoredPlaylistPlaylistAddRequest.fromPartial(object.command.playlistadd),
      };
    }
    if (
      object.command?.$case === "playlistclear" &&
      object.command?.playlistclear !== undefined &&
      object.command?.playlistclear !== null
    ) {
      message.command = {
        $case: "playlistclear",
        playlistclear: MpdCommandStoredPlaylistPlaylistClearRequest.fromPartial(object.command.playlistclear),
      };
    }
    if (
      object.command?.$case === "playlistdelete" &&
      object.command?.playlistdelete !== undefined &&
      object.command?.playlistdelete !== null
    ) {
      message.command = {
        $case: "playlistdelete",
        playlistdelete: MpdCommandStoredPlaylistPlaylistDeleteRequest.fromPartial(object.command.playlistdelete),
      };
    }
    if (
      object.command?.$case === "playlistmove" &&
      object.command?.playlistmove !== undefined &&
      object.command?.playlistmove !== null
    ) {
      message.command = {
        $case: "playlistmove",
        playlistmove: MpdCommandStoredPlaylistPlaylistMoveRequest.fromPartial(object.command.playlistmove),
      };
    }
    if (object.command?.$case === "rename" && object.command?.rename !== undefined && object.command?.rename !== null) {
      message.command = {
        $case: "rename",
        rename: MpdCommandStoredPlaylistRenameRequest.fromPartial(object.command.rename),
      };
    }
    if (object.command?.$case === "rm" && object.command?.rm !== undefined && object.command?.rm !== null) {
      message.command = { $case: "rm", rm: MpdCommandStoredPlaylistRemoveRequest.fromPartial(object.command.rm) };
    }
    if (object.command?.$case === "save" && object.command?.save !== undefined && object.command?.save !== null) {
      message.command = { $case: "save", save: MpdCommandStoredPlaylistSaveRequest.fromPartial(object.command.save) };
    }
    if (object.command?.$case === "list" && object.command?.list !== undefined && object.command?.list !== null) {
      message.command = { $case: "list", list: MpdCommandDatabaseListRequest.fromPartial(object.command.list) };
    }
    if (object.command?.$case === "search" && object.command?.search !== undefined && object.command?.search !== null) {
      message.command = { $case: "search", search: MpdCommandDatabaseSearchRequest.fromPartial(object.command.search) };
    }
    if (object.command?.$case === "update" && object.command?.update !== undefined && object.command?.update !== null) {
      message.command = { $case: "update", update: MpdCommandDatabaseUpdateRequest.fromPartial(object.command.update) };
    }
    if (
      object.command?.$case === "outputs" && object.command?.outputs !== undefined && object.command?.outputs !== null
    ) {
      message.command = {
        $case: "outputs",
        outputs: MpdCommandAudioOutputsRequest.fromPartial(object.command.outputs),
      };
    }
    if (
      object.command?.$case === "listAllSongs" &&
      object.command?.listAllSongs !== undefined &&
      object.command?.listAllSongs !== null
    ) {
      message.command = {
        $case: "listAllSongs",
        listAllSongs: MpdCommandUtilityListAllSongsRequest.fromPartial(object.command.listAllSongs),
      };
    }
    if (
      object.command?.$case === "listAllFolders" &&
      object.command?.listAllFolders !== undefined &&
      object.command?.listAllFolders !== null
    ) {
      message.command = {
        $case: "listAllFolders",
        listAllFolders: MpdCommandUtilityListAllFoldersRequest.fromPartial(object.command.listAllFolders),
      };
    }
    if (
      object.command?.$case === "listSongsInFolder" &&
      object.command?.listSongsInFolder !== undefined &&
      object.command?.listSongsInFolder !== null
    ) {
      message.command = {
        $case: "listSongsInFolder",
        listSongsInFolder: MpdCommandUtilityListSongsInFolderRequest.fromPartial(object.command.listSongsInFolder),
      };
    }
    return message;
  },
};

function createBaseMpdRequestBulk(): MpdRequestBulk {
  return { requests: [] };
}

export const MpdRequestBulk = {
  encode(message: MpdRequestBulk, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.requests) {
      MpdRequest.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdRequestBulk {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdRequestBulk();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.requests.push(MpdRequest.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdRequestBulk {
    return { requests: Array.isArray(object?.requests) ? object.requests.map((e: any) => MpdRequest.fromJSON(e)) : [] };
  },

  toJSON(message: MpdRequestBulk): unknown {
    const obj: any = {};
    if (message.requests?.length) {
      obj.requests = message.requests.map((e) => MpdRequest.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdRequestBulk>, I>>(base?: I): MpdRequestBulk {
    return MpdRequestBulk.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdRequestBulk>, I>>(object: I): MpdRequestBulk {
    const message = createBaseMpdRequestBulk();
    message.requests = object.requests?.map((e) => MpdRequest.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMpdResponse(): MpdResponse {
  return { command: undefined };
}

export const MpdResponse = {
  encode(message: MpdResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    switch (message.command?.$case) {
      case "ping":
        MpdCommandConnectionPingResponse.encode(message.command.ping, writer.uint32(18).fork()).ldelim();
        break;
      case "next":
        MpdCommandControlNextResponse.encode(message.command.next, writer.uint32(26).fork()).ldelim();
        break;
      case "pause":
        MpdCommandControlPauseResponse.encode(message.command.pause, writer.uint32(34).fork()).ldelim();
        break;
      case "play":
        MpdCommandControlPlayResponse.encode(message.command.play, writer.uint32(42).fork()).ldelim();
        break;
      case "previous":
        MpdCommandControlPreviousResponse.encode(message.command.previous, writer.uint32(50).fork()).ldelim();
        break;
      case "seek":
        MpdCommandControlSeekResponse.encode(message.command.seek, writer.uint32(58).fork()).ldelim();
        break;
      case "stop":
        MpdCommandControlStopResponse.encode(message.command.stop, writer.uint32(66).fork()).ldelim();
        break;
      case "consume":
        MpdCommandPlaybackConsumeResponse.encode(message.command.consume, writer.uint32(74).fork()).ldelim();
        break;
      case "random":
        MpdCommandPlaybackRandomResponse.encode(message.command.random, writer.uint32(82).fork()).ldelim();
        break;
      case "repeat":
        MpdCommandPlaybackRepeatResponse.encode(message.command.repeat, writer.uint32(90).fork()).ldelim();
        break;
      case "setvol":
        MpdCommandPlaybackSetVolResponse.encode(message.command.setvol, writer.uint32(98).fork()).ldelim();
        break;
      case "getvol":
        MpdCommandPlaybackGetVolResponse.encode(message.command.getvol, writer.uint32(106).fork()).ldelim();
        break;
      case "single":
        MpdCommandPlaybackSingleResponse.encode(message.command.single, writer.uint32(114).fork()).ldelim();
        break;
      case "currentsong":
        MpdCommandStatusCurrentSongResponse.encode(message.command.currentsong, writer.uint32(122).fork()).ldelim();
        break;
      case "status":
        MpdCommandStatusStatusResponse.encode(message.command.status, writer.uint32(130).fork()).ldelim();
        break;
      case "stats":
        MpdCommandStatusStatsResponse.encode(message.command.stats, writer.uint32(138).fork()).ldelim();
        break;
      case "add":
        MpdCommandQueueAddResponse.encode(message.command.add, writer.uint32(146).fork()).ldelim();
        break;
      case "clear":
        MpdCommandQueueClearResponse.encode(message.command.clear, writer.uint32(154).fork()).ldelim();
        break;
      case "delete":
        MpdCommandQueueDeleteResponse.encode(message.command.delete, writer.uint32(162).fork()).ldelim();
        break;
      case "move":
        MpdCommandQueueMoveResponse.encode(message.command.move, writer.uint32(170).fork()).ldelim();
        break;
      case "playlistinfo":
        MpdCommandQueuePlaylistInfoResponse.encode(message.command.playlistinfo, writer.uint32(178).fork()).ldelim();
        break;
      case "shuffle":
        MpdCommandQueueShuffleResponse.encode(message.command.shuffle, writer.uint32(186).fork()).ldelim();
        break;
      case "listplaylistinfo":
        MpdCommandStoredPlaylistListPlaylistInfoResponse.encode(
          message.command.listplaylistinfo,
          writer.uint32(194).fork(),
        ).ldelim();
        break;
      case "listplaylists":
        MpdCommandStoredPlaylistListPlaylistsResponse.encode(message.command.listplaylists, writer.uint32(202).fork())
          .ldelim();
        break;
      case "playlistadd":
        MpdCommandStoredPlaylistPlaylistAddResponse.encode(message.command.playlistadd, writer.uint32(210).fork())
          .ldelim();
        break;
      case "playlistclear":
        MpdCommandStoredPlaylistPlaylistClearResponse.encode(message.command.playlistclear, writer.uint32(218).fork())
          .ldelim();
        break;
      case "playlistdelete":
        MpdCommandStoredPlaylistPlaylistDeleteResponse.encode(message.command.playlistdelete, writer.uint32(226).fork())
          .ldelim();
        break;
      case "playlistmove":
        MpdCommandStoredPlaylistPlaylistMoveResponse.encode(message.command.playlistmove, writer.uint32(234).fork())
          .ldelim();
        break;
      case "rename":
        MpdCommandStoredPlaylistRenameResponse.encode(message.command.rename, writer.uint32(242).fork()).ldelim();
        break;
      case "rm":
        MpdCommandStoredPlaylistRemoveResponse.encode(message.command.rm, writer.uint32(250).fork()).ldelim();
        break;
      case "save":
        MpdCommandStoredPlaylistSaveResponse.encode(message.command.save, writer.uint32(258).fork()).ldelim();
        break;
      case "list":
        MpdCommandDatabaseListResponse.encode(message.command.list, writer.uint32(266).fork()).ldelim();
        break;
      case "search":
        MpdCommandDatabaseSearchResponse.encode(message.command.search, writer.uint32(274).fork()).ldelim();
        break;
      case "update":
        MpdCommandDatabaseUpdateResponse.encode(message.command.update, writer.uint32(282).fork()).ldelim();
        break;
      case "outputs":
        MpdCommandAudioOutputsResponse.encode(message.command.outputs, writer.uint32(290).fork()).ldelim();
        break;
      case "listAllSongs":
        MpdCommandUtilityListAllSongsResponse.encode(message.command.listAllSongs, writer.uint32(298).fork()).ldelim();
        break;
      case "listAllFolders":
        MpdCommandUtilityListAllFoldersResponse.encode(message.command.listAllFolders, writer.uint32(306).fork())
          .ldelim();
        break;
      case "listSongsInFolder":
        MpdCommandUtilityListSongsInFolderResponse.encode(message.command.listSongsInFolder, writer.uint32(314).fork())
          .ldelim();
        break;
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MpdResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMpdResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }

          message.command = { $case: "ping", ping: MpdCommandConnectionPingResponse.decode(reader, reader.uint32()) };
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.command = { $case: "next", next: MpdCommandControlNextResponse.decode(reader, reader.uint32()) };
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.command = { $case: "pause", pause: MpdCommandControlPauseResponse.decode(reader, reader.uint32()) };
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.command = { $case: "play", play: MpdCommandControlPlayResponse.decode(reader, reader.uint32()) };
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.command = {
            $case: "previous",
            previous: MpdCommandControlPreviousResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.command = { $case: "seek", seek: MpdCommandControlSeekResponse.decode(reader, reader.uint32()) };
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.command = { $case: "stop", stop: MpdCommandControlStopResponse.decode(reader, reader.uint32()) };
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.command = {
            $case: "consume",
            consume: MpdCommandPlaybackConsumeResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.command = {
            $case: "random",
            random: MpdCommandPlaybackRandomResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.command = {
            $case: "repeat",
            repeat: MpdCommandPlaybackRepeatResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.command = {
            $case: "setvol",
            setvol: MpdCommandPlaybackSetVolResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.command = {
            $case: "getvol",
            getvol: MpdCommandPlaybackGetVolResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.command = {
            $case: "single",
            single: MpdCommandPlaybackSingleResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.command = {
            $case: "currentsong",
            currentsong: MpdCommandStatusCurrentSongResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.command = { $case: "status", status: MpdCommandStatusStatusResponse.decode(reader, reader.uint32()) };
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.command = { $case: "stats", stats: MpdCommandStatusStatsResponse.decode(reader, reader.uint32()) };
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.command = { $case: "add", add: MpdCommandQueueAddResponse.decode(reader, reader.uint32()) };
          continue;
        case 19:
          if (tag !== 154) {
            break;
          }

          message.command = { $case: "clear", clear: MpdCommandQueueClearResponse.decode(reader, reader.uint32()) };
          continue;
        case 20:
          if (tag !== 162) {
            break;
          }

          message.command = { $case: "delete", delete: MpdCommandQueueDeleteResponse.decode(reader, reader.uint32()) };
          continue;
        case 21:
          if (tag !== 170) {
            break;
          }

          message.command = { $case: "move", move: MpdCommandQueueMoveResponse.decode(reader, reader.uint32()) };
          continue;
        case 22:
          if (tag !== 178) {
            break;
          }

          message.command = {
            $case: "playlistinfo",
            playlistinfo: MpdCommandQueuePlaylistInfoResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 23:
          if (tag !== 186) {
            break;
          }

          message.command = {
            $case: "shuffle",
            shuffle: MpdCommandQueueShuffleResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 24:
          if (tag !== 194) {
            break;
          }

          message.command = {
            $case: "listplaylistinfo",
            listplaylistinfo: MpdCommandStoredPlaylistListPlaylistInfoResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 25:
          if (tag !== 202) {
            break;
          }

          message.command = {
            $case: "listplaylists",
            listplaylists: MpdCommandStoredPlaylistListPlaylistsResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 26:
          if (tag !== 210) {
            break;
          }

          message.command = {
            $case: "playlistadd",
            playlistadd: MpdCommandStoredPlaylistPlaylistAddResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 27:
          if (tag !== 218) {
            break;
          }

          message.command = {
            $case: "playlistclear",
            playlistclear: MpdCommandStoredPlaylistPlaylistClearResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 28:
          if (tag !== 226) {
            break;
          }

          message.command = {
            $case: "playlistdelete",
            playlistdelete: MpdCommandStoredPlaylistPlaylistDeleteResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 29:
          if (tag !== 234) {
            break;
          }

          message.command = {
            $case: "playlistmove",
            playlistmove: MpdCommandStoredPlaylistPlaylistMoveResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 30:
          if (tag !== 242) {
            break;
          }

          message.command = {
            $case: "rename",
            rename: MpdCommandStoredPlaylistRenameResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 31:
          if (tag !== 250) {
            break;
          }

          message.command = { $case: "rm", rm: MpdCommandStoredPlaylistRemoveResponse.decode(reader, reader.uint32()) };
          continue;
        case 32:
          if (tag !== 258) {
            break;
          }

          message.command = {
            $case: "save",
            save: MpdCommandStoredPlaylistSaveResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 33:
          if (tag !== 266) {
            break;
          }

          message.command = { $case: "list", list: MpdCommandDatabaseListResponse.decode(reader, reader.uint32()) };
          continue;
        case 34:
          if (tag !== 274) {
            break;
          }

          message.command = {
            $case: "search",
            search: MpdCommandDatabaseSearchResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 35:
          if (tag !== 282) {
            break;
          }

          message.command = {
            $case: "update",
            update: MpdCommandDatabaseUpdateResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 36:
          if (tag !== 290) {
            break;
          }

          message.command = {
            $case: "outputs",
            outputs: MpdCommandAudioOutputsResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 37:
          if (tag !== 298) {
            break;
          }

          message.command = {
            $case: "listAllSongs",
            listAllSongs: MpdCommandUtilityListAllSongsResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 38:
          if (tag !== 306) {
            break;
          }

          message.command = {
            $case: "listAllFolders",
            listAllFolders: MpdCommandUtilityListAllFoldersResponse.decode(reader, reader.uint32()),
          };
          continue;
        case 39:
          if (tag !== 314) {
            break;
          }

          message.command = {
            $case: "listSongsInFolder",
            listSongsInFolder: MpdCommandUtilityListSongsInFolderResponse.decode(reader, reader.uint32()),
          };
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MpdResponse {
    return {
      command: isSet(object.ping)
        ? { $case: "ping", ping: MpdCommandConnectionPingResponse.fromJSON(object.ping) }
        : isSet(object.next)
        ? { $case: "next", next: MpdCommandControlNextResponse.fromJSON(object.next) }
        : isSet(object.pause)
        ? { $case: "pause", pause: MpdCommandControlPauseResponse.fromJSON(object.pause) }
        : isSet(object.play)
        ? { $case: "play", play: MpdCommandControlPlayResponse.fromJSON(object.play) }
        : isSet(object.previous)
        ? { $case: "previous", previous: MpdCommandControlPreviousResponse.fromJSON(object.previous) }
        : isSet(object.seek)
        ? { $case: "seek", seek: MpdCommandControlSeekResponse.fromJSON(object.seek) }
        : isSet(object.stop)
        ? { $case: "stop", stop: MpdCommandControlStopResponse.fromJSON(object.stop) }
        : isSet(object.consume)
        ? { $case: "consume", consume: MpdCommandPlaybackConsumeResponse.fromJSON(object.consume) }
        : isSet(object.random)
        ? { $case: "random", random: MpdCommandPlaybackRandomResponse.fromJSON(object.random) }
        : isSet(object.repeat)
        ? { $case: "repeat", repeat: MpdCommandPlaybackRepeatResponse.fromJSON(object.repeat) }
        : isSet(object.setvol)
        ? { $case: "setvol", setvol: MpdCommandPlaybackSetVolResponse.fromJSON(object.setvol) }
        : isSet(object.getvol)
        ? { $case: "getvol", getvol: MpdCommandPlaybackGetVolResponse.fromJSON(object.getvol) }
        : isSet(object.single)
        ? { $case: "single", single: MpdCommandPlaybackSingleResponse.fromJSON(object.single) }
        : isSet(object.currentsong)
        ? { $case: "currentsong", currentsong: MpdCommandStatusCurrentSongResponse.fromJSON(object.currentsong) }
        : isSet(object.status)
        ? { $case: "status", status: MpdCommandStatusStatusResponse.fromJSON(object.status) }
        : isSet(object.stats)
        ? { $case: "stats", stats: MpdCommandStatusStatsResponse.fromJSON(object.stats) }
        : isSet(object.add)
        ? { $case: "add", add: MpdCommandQueueAddResponse.fromJSON(object.add) }
        : isSet(object.clear)
        ? { $case: "clear", clear: MpdCommandQueueClearResponse.fromJSON(object.clear) }
        : isSet(object.delete)
        ? { $case: "delete", delete: MpdCommandQueueDeleteResponse.fromJSON(object.delete) }
        : isSet(object.move)
        ? { $case: "move", move: MpdCommandQueueMoveResponse.fromJSON(object.move) }
        : isSet(object.playlistinfo)
        ? { $case: "playlistinfo", playlistinfo: MpdCommandQueuePlaylistInfoResponse.fromJSON(object.playlistinfo) }
        : isSet(object.shuffle)
        ? { $case: "shuffle", shuffle: MpdCommandQueueShuffleResponse.fromJSON(object.shuffle) }
        : isSet(object.listplaylistinfo)
        ? {
          $case: "listplaylistinfo",
          listplaylistinfo: MpdCommandStoredPlaylistListPlaylistInfoResponse.fromJSON(object.listplaylistinfo),
        }
        : isSet(object.listplaylists)
        ? {
          $case: "listplaylists",
          listplaylists: MpdCommandStoredPlaylistListPlaylistsResponse.fromJSON(object.listplaylists),
        }
        : isSet(object.playlistadd)
        ? {
          $case: "playlistadd",
          playlistadd: MpdCommandStoredPlaylistPlaylistAddResponse.fromJSON(object.playlistadd),
        }
        : isSet(object.playlistclear)
        ? {
          $case: "playlistclear",
          playlistclear: MpdCommandStoredPlaylistPlaylistClearResponse.fromJSON(object.playlistclear),
        }
        : isSet(object.playlistdelete)
        ? {
          $case: "playlistdelete",
          playlistdelete: MpdCommandStoredPlaylistPlaylistDeleteResponse.fromJSON(object.playlistdelete),
        }
        : isSet(object.playlistmove)
        ? {
          $case: "playlistmove",
          playlistmove: MpdCommandStoredPlaylistPlaylistMoveResponse.fromJSON(object.playlistmove),
        }
        : isSet(object.rename)
        ? { $case: "rename", rename: MpdCommandStoredPlaylistRenameResponse.fromJSON(object.rename) }
        : isSet(object.rm)
        ? { $case: "rm", rm: MpdCommandStoredPlaylistRemoveResponse.fromJSON(object.rm) }
        : isSet(object.save)
        ? { $case: "save", save: MpdCommandStoredPlaylistSaveResponse.fromJSON(object.save) }
        : isSet(object.list)
        ? { $case: "list", list: MpdCommandDatabaseListResponse.fromJSON(object.list) }
        : isSet(object.search)
        ? { $case: "search", search: MpdCommandDatabaseSearchResponse.fromJSON(object.search) }
        : isSet(object.update)
        ? { $case: "update", update: MpdCommandDatabaseUpdateResponse.fromJSON(object.update) }
        : isSet(object.outputs)
        ? { $case: "outputs", outputs: MpdCommandAudioOutputsResponse.fromJSON(object.outputs) }
        : isSet(object.listAllSongs)
        ? { $case: "listAllSongs", listAllSongs: MpdCommandUtilityListAllSongsResponse.fromJSON(object.listAllSongs) }
        : isSet(object.listAllFolders)
        ? {
          $case: "listAllFolders",
          listAllFolders: MpdCommandUtilityListAllFoldersResponse.fromJSON(object.listAllFolders),
        }
        : isSet(object.listSongsInFolder)
        ? {
          $case: "listSongsInFolder",
          listSongsInFolder: MpdCommandUtilityListSongsInFolderResponse.fromJSON(object.listSongsInFolder),
        }
        : undefined,
    };
  },

  toJSON(message: MpdResponse): unknown {
    const obj: any = {};
    if (message.command?.$case === "ping") {
      obj.ping = MpdCommandConnectionPingResponse.toJSON(message.command.ping);
    }
    if (message.command?.$case === "next") {
      obj.next = MpdCommandControlNextResponse.toJSON(message.command.next);
    }
    if (message.command?.$case === "pause") {
      obj.pause = MpdCommandControlPauseResponse.toJSON(message.command.pause);
    }
    if (message.command?.$case === "play") {
      obj.play = MpdCommandControlPlayResponse.toJSON(message.command.play);
    }
    if (message.command?.$case === "previous") {
      obj.previous = MpdCommandControlPreviousResponse.toJSON(message.command.previous);
    }
    if (message.command?.$case === "seek") {
      obj.seek = MpdCommandControlSeekResponse.toJSON(message.command.seek);
    }
    if (message.command?.$case === "stop") {
      obj.stop = MpdCommandControlStopResponse.toJSON(message.command.stop);
    }
    if (message.command?.$case === "consume") {
      obj.consume = MpdCommandPlaybackConsumeResponse.toJSON(message.command.consume);
    }
    if (message.command?.$case === "random") {
      obj.random = MpdCommandPlaybackRandomResponse.toJSON(message.command.random);
    }
    if (message.command?.$case === "repeat") {
      obj.repeat = MpdCommandPlaybackRepeatResponse.toJSON(message.command.repeat);
    }
    if (message.command?.$case === "setvol") {
      obj.setvol = MpdCommandPlaybackSetVolResponse.toJSON(message.command.setvol);
    }
    if (message.command?.$case === "getvol") {
      obj.getvol = MpdCommandPlaybackGetVolResponse.toJSON(message.command.getvol);
    }
    if (message.command?.$case === "single") {
      obj.single = MpdCommandPlaybackSingleResponse.toJSON(message.command.single);
    }
    if (message.command?.$case === "currentsong") {
      obj.currentsong = MpdCommandStatusCurrentSongResponse.toJSON(message.command.currentsong);
    }
    if (message.command?.$case === "status") {
      obj.status = MpdCommandStatusStatusResponse.toJSON(message.command.status);
    }
    if (message.command?.$case === "stats") {
      obj.stats = MpdCommandStatusStatsResponse.toJSON(message.command.stats);
    }
    if (message.command?.$case === "add") {
      obj.add = MpdCommandQueueAddResponse.toJSON(message.command.add);
    }
    if (message.command?.$case === "clear") {
      obj.clear = MpdCommandQueueClearResponse.toJSON(message.command.clear);
    }
    if (message.command?.$case === "delete") {
      obj.delete = MpdCommandQueueDeleteResponse.toJSON(message.command.delete);
    }
    if (message.command?.$case === "move") {
      obj.move = MpdCommandQueueMoveResponse.toJSON(message.command.move);
    }
    if (message.command?.$case === "playlistinfo") {
      obj.playlistinfo = MpdCommandQueuePlaylistInfoResponse.toJSON(message.command.playlistinfo);
    }
    if (message.command?.$case === "shuffle") {
      obj.shuffle = MpdCommandQueueShuffleResponse.toJSON(message.command.shuffle);
    }
    if (message.command?.$case === "listplaylistinfo") {
      obj.listplaylistinfo = MpdCommandStoredPlaylistListPlaylistInfoResponse.toJSON(message.command.listplaylistinfo);
    }
    if (message.command?.$case === "listplaylists") {
      obj.listplaylists = MpdCommandStoredPlaylistListPlaylistsResponse.toJSON(message.command.listplaylists);
    }
    if (message.command?.$case === "playlistadd") {
      obj.playlistadd = MpdCommandStoredPlaylistPlaylistAddResponse.toJSON(message.command.playlistadd);
    }
    if (message.command?.$case === "playlistclear") {
      obj.playlistclear = MpdCommandStoredPlaylistPlaylistClearResponse.toJSON(message.command.playlistclear);
    }
    if (message.command?.$case === "playlistdelete") {
      obj.playlistdelete = MpdCommandStoredPlaylistPlaylistDeleteResponse.toJSON(message.command.playlistdelete);
    }
    if (message.command?.$case === "playlistmove") {
      obj.playlistmove = MpdCommandStoredPlaylistPlaylistMoveResponse.toJSON(message.command.playlistmove);
    }
    if (message.command?.$case === "rename") {
      obj.rename = MpdCommandStoredPlaylistRenameResponse.toJSON(message.command.rename);
    }
    if (message.command?.$case === "rm") {
      obj.rm = MpdCommandStoredPlaylistRemoveResponse.toJSON(message.command.rm);
    }
    if (message.command?.$case === "save") {
      obj.save = MpdCommandStoredPlaylistSaveResponse.toJSON(message.command.save);
    }
    if (message.command?.$case === "list") {
      obj.list = MpdCommandDatabaseListResponse.toJSON(message.command.list);
    }
    if (message.command?.$case === "search") {
      obj.search = MpdCommandDatabaseSearchResponse.toJSON(message.command.search);
    }
    if (message.command?.$case === "update") {
      obj.update = MpdCommandDatabaseUpdateResponse.toJSON(message.command.update);
    }
    if (message.command?.$case === "outputs") {
      obj.outputs = MpdCommandAudioOutputsResponse.toJSON(message.command.outputs);
    }
    if (message.command?.$case === "listAllSongs") {
      obj.listAllSongs = MpdCommandUtilityListAllSongsResponse.toJSON(message.command.listAllSongs);
    }
    if (message.command?.$case === "listAllFolders") {
      obj.listAllFolders = MpdCommandUtilityListAllFoldersResponse.toJSON(message.command.listAllFolders);
    }
    if (message.command?.$case === "listSongsInFolder") {
      obj.listSongsInFolder = MpdCommandUtilityListSongsInFolderResponse.toJSON(message.command.listSongsInFolder);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MpdResponse>, I>>(base?: I): MpdResponse {
    return MpdResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MpdResponse>, I>>(object: I): MpdResponse {
    const message = createBaseMpdResponse();
    if (object.command?.$case === "ping" && object.command?.ping !== undefined && object.command?.ping !== null) {
      message.command = { $case: "ping", ping: MpdCommandConnectionPingResponse.fromPartial(object.command.ping) };
    }
    if (object.command?.$case === "next" && object.command?.next !== undefined && object.command?.next !== null) {
      message.command = { $case: "next", next: MpdCommandControlNextResponse.fromPartial(object.command.next) };
    }
    if (object.command?.$case === "pause" && object.command?.pause !== undefined && object.command?.pause !== null) {
      message.command = { $case: "pause", pause: MpdCommandControlPauseResponse.fromPartial(object.command.pause) };
    }
    if (object.command?.$case === "play" && object.command?.play !== undefined && object.command?.play !== null) {
      message.command = { $case: "play", play: MpdCommandControlPlayResponse.fromPartial(object.command.play) };
    }
    if (
      object.command?.$case === "previous" &&
      object.command?.previous !== undefined &&
      object.command?.previous !== null
    ) {
      message.command = {
        $case: "previous",
        previous: MpdCommandControlPreviousResponse.fromPartial(object.command.previous),
      };
    }
    if (object.command?.$case === "seek" && object.command?.seek !== undefined && object.command?.seek !== null) {
      message.command = { $case: "seek", seek: MpdCommandControlSeekResponse.fromPartial(object.command.seek) };
    }
    if (object.command?.$case === "stop" && object.command?.stop !== undefined && object.command?.stop !== null) {
      message.command = { $case: "stop", stop: MpdCommandControlStopResponse.fromPartial(object.command.stop) };
    }
    if (
      object.command?.$case === "consume" && object.command?.consume !== undefined && object.command?.consume !== null
    ) {
      message.command = {
        $case: "consume",
        consume: MpdCommandPlaybackConsumeResponse.fromPartial(object.command.consume),
      };
    }
    if (object.command?.$case === "random" && object.command?.random !== undefined && object.command?.random !== null) {
      message.command = {
        $case: "random",
        random: MpdCommandPlaybackRandomResponse.fromPartial(object.command.random),
      };
    }
    if (object.command?.$case === "repeat" && object.command?.repeat !== undefined && object.command?.repeat !== null) {
      message.command = {
        $case: "repeat",
        repeat: MpdCommandPlaybackRepeatResponse.fromPartial(object.command.repeat),
      };
    }
    if (object.command?.$case === "setvol" && object.command?.setvol !== undefined && object.command?.setvol !== null) {
      message.command = {
        $case: "setvol",
        setvol: MpdCommandPlaybackSetVolResponse.fromPartial(object.command.setvol),
      };
    }
    if (object.command?.$case === "getvol" && object.command?.getvol !== undefined && object.command?.getvol !== null) {
      message.command = {
        $case: "getvol",
        getvol: MpdCommandPlaybackGetVolResponse.fromPartial(object.command.getvol),
      };
    }
    if (object.command?.$case === "single" && object.command?.single !== undefined && object.command?.single !== null) {
      message.command = {
        $case: "single",
        single: MpdCommandPlaybackSingleResponse.fromPartial(object.command.single),
      };
    }
    if (
      object.command?.$case === "currentsong" &&
      object.command?.currentsong !== undefined &&
      object.command?.currentsong !== null
    ) {
      message.command = {
        $case: "currentsong",
        currentsong: MpdCommandStatusCurrentSongResponse.fromPartial(object.command.currentsong),
      };
    }
    if (object.command?.$case === "status" && object.command?.status !== undefined && object.command?.status !== null) {
      message.command = { $case: "status", status: MpdCommandStatusStatusResponse.fromPartial(object.command.status) };
    }
    if (object.command?.$case === "stats" && object.command?.stats !== undefined && object.command?.stats !== null) {
      message.command = { $case: "stats", stats: MpdCommandStatusStatsResponse.fromPartial(object.command.stats) };
    }
    if (object.command?.$case === "add" && object.command?.add !== undefined && object.command?.add !== null) {
      message.command = { $case: "add", add: MpdCommandQueueAddResponse.fromPartial(object.command.add) };
    }
    if (object.command?.$case === "clear" && object.command?.clear !== undefined && object.command?.clear !== null) {
      message.command = { $case: "clear", clear: MpdCommandQueueClearResponse.fromPartial(object.command.clear) };
    }
    if (object.command?.$case === "delete" && object.command?.delete !== undefined && object.command?.delete !== null) {
      message.command = { $case: "delete", delete: MpdCommandQueueDeleteResponse.fromPartial(object.command.delete) };
    }
    if (object.command?.$case === "move" && object.command?.move !== undefined && object.command?.move !== null) {
      message.command = { $case: "move", move: MpdCommandQueueMoveResponse.fromPartial(object.command.move) };
    }
    if (
      object.command?.$case === "playlistinfo" &&
      object.command?.playlistinfo !== undefined &&
      object.command?.playlistinfo !== null
    ) {
      message.command = {
        $case: "playlistinfo",
        playlistinfo: MpdCommandQueuePlaylistInfoResponse.fromPartial(object.command.playlistinfo),
      };
    }
    if (
      object.command?.$case === "shuffle" && object.command?.shuffle !== undefined && object.command?.shuffle !== null
    ) {
      message.command = {
        $case: "shuffle",
        shuffle: MpdCommandQueueShuffleResponse.fromPartial(object.command.shuffle),
      };
    }
    if (
      object.command?.$case === "listplaylistinfo" &&
      object.command?.listplaylistinfo !== undefined &&
      object.command?.listplaylistinfo !== null
    ) {
      message.command = {
        $case: "listplaylistinfo",
        listplaylistinfo: MpdCommandStoredPlaylistListPlaylistInfoResponse.fromPartial(object.command.listplaylistinfo),
      };
    }
    if (
      object.command?.$case === "listplaylists" &&
      object.command?.listplaylists !== undefined &&
      object.command?.listplaylists !== null
    ) {
      message.command = {
        $case: "listplaylists",
        listplaylists: MpdCommandStoredPlaylistListPlaylistsResponse.fromPartial(object.command.listplaylists),
      };
    }
    if (
      object.command?.$case === "playlistadd" &&
      object.command?.playlistadd !== undefined &&
      object.command?.playlistadd !== null
    ) {
      message.command = {
        $case: "playlistadd",
        playlistadd: MpdCommandStoredPlaylistPlaylistAddResponse.fromPartial(object.command.playlistadd),
      };
    }
    if (
      object.command?.$case === "playlistclear" &&
      object.command?.playlistclear !== undefined &&
      object.command?.playlistclear !== null
    ) {
      message.command = {
        $case: "playlistclear",
        playlistclear: MpdCommandStoredPlaylistPlaylistClearResponse.fromPartial(object.command.playlistclear),
      };
    }
    if (
      object.command?.$case === "playlistdelete" &&
      object.command?.playlistdelete !== undefined &&
      object.command?.playlistdelete !== null
    ) {
      message.command = {
        $case: "playlistdelete",
        playlistdelete: MpdCommandStoredPlaylistPlaylistDeleteResponse.fromPartial(object.command.playlistdelete),
      };
    }
    if (
      object.command?.$case === "playlistmove" &&
      object.command?.playlistmove !== undefined &&
      object.command?.playlistmove !== null
    ) {
      message.command = {
        $case: "playlistmove",
        playlistmove: MpdCommandStoredPlaylistPlaylistMoveResponse.fromPartial(object.command.playlistmove),
      };
    }
    if (object.command?.$case === "rename" && object.command?.rename !== undefined && object.command?.rename !== null) {
      message.command = {
        $case: "rename",
        rename: MpdCommandStoredPlaylistRenameResponse.fromPartial(object.command.rename),
      };
    }
    if (object.command?.$case === "rm" && object.command?.rm !== undefined && object.command?.rm !== null) {
      message.command = { $case: "rm", rm: MpdCommandStoredPlaylistRemoveResponse.fromPartial(object.command.rm) };
    }
    if (object.command?.$case === "save" && object.command?.save !== undefined && object.command?.save !== null) {
      message.command = { $case: "save", save: MpdCommandStoredPlaylistSaveResponse.fromPartial(object.command.save) };
    }
    if (object.command?.$case === "list" && object.command?.list !== undefined && object.command?.list !== null) {
      message.command = { $case: "list", list: MpdCommandDatabaseListResponse.fromPartial(object.command.list) };
    }
    if (object.command?.$case === "search" && object.command?.search !== undefined && object.command?.search !== null) {
      message.command = {
        $case: "search",
        search: MpdCommandDatabaseSearchResponse.fromPartial(object.command.search),
      };
    }
    if (object.command?.$case === "update" && object.command?.update !== undefined && object.command?.update !== null) {
      message.command = {
        $case: "update",
        update: MpdCommandDatabaseUpdateResponse.fromPartial(object.command.update),
      };
    }
    if (
      object.command?.$case === "outputs" && object.command?.outputs !== undefined && object.command?.outputs !== null
    ) {
      message.command = {
        $case: "outputs",
        outputs: MpdCommandAudioOutputsResponse.fromPartial(object.command.outputs),
      };
    }
    if (
      object.command?.$case === "listAllSongs" &&
      object.command?.listAllSongs !== undefined &&
      object.command?.listAllSongs !== null
    ) {
      message.command = {
        $case: "listAllSongs",
        listAllSongs: MpdCommandUtilityListAllSongsResponse.fromPartial(object.command.listAllSongs),
      };
    }
    if (
      object.command?.$case === "listAllFolders" &&
      object.command?.listAllFolders !== undefined &&
      object.command?.listAllFolders !== null
    ) {
      message.command = {
        $case: "listAllFolders",
        listAllFolders: MpdCommandUtilityListAllFoldersResponse.fromPartial(object.command.listAllFolders),
      };
    }
    if (
      object.command?.$case === "listSongsInFolder" &&
      object.command?.listSongsInFolder !== undefined &&
      object.command?.listSongsInFolder !== null
    ) {
      message.command = {
        $case: "listSongsInFolder",
        listSongsInFolder: MpdCommandUtilityListSongsInFolderResponse.fromPartial(object.command.listSongsInFolder),
      };
    }
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
