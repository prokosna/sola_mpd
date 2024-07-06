import {
  FloatValue,
  Int32Value,
  StringValue,
  Timestamp,
} from "@bufbuild/protobuf";
import { Folder } from "@sola_mpd/domain/src/models/file_explore_pb.js";
import {
  MpdRequest,
  MpdResponse,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import {
  MpdEvent,
  MpdEvent_EventType,
} from "@sola_mpd/domain/src/models/mpd/mpd_event_pb.js";
import { MpdOutputDevice } from "@sola_mpd/domain/src/models/mpd/mpd_output_pb.js";
import {
  MpdPlayerStatus,
  MpdPlayerStatus_PlaybackState,
  MpdPlayerVolume,
} from "@sola_mpd/domain/src/models/mpd/mpd_player_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { MpdStats } from "@sola_mpd/domain/src/models/mpd/mpd_stats_pb.js";
import { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import {
  AudioFormat,
  AudioFormat_Encoding,
  Song,
  Song_MetadataTag,
  Song_MetadataValue,
} from "@sola_mpd/domain/src/models/song_pb.js";
import { DeepMap } from "@sola_mpd/domain/src/utils/DeepMap.js";
import { MpdUtils } from "@sola_mpd/domain/src/utils/MpdUtils.js";
import dayjs from "dayjs";
import mpd, { MPD } from "mpd2";

mpd.autoparseValues(false);

class MpdClient {
  private clients: DeepMap<MpdProfile, MPD.Client> = new DeepMap(new Map());
  private listParser = mpd.parseList;
  private objectParser = mpd.parseObject;
  private listParserBy = mpd.parseList.by;

  private async connect(profile: MpdProfile): Promise<MPD.Client> {
    if (this.clients.has(profile)) {
      const client = this.clients.get(profile)!;
      return client;
    }
    const config = {
      host: profile.host,
      port: profile.port,
    };
    const client = await mpd.connect(config);
    client.once("close", () => {
      this.clients.delete(profile);
      console.info("Removed closed client");
    });
    this.clients.set(profile, client);
    return client;
  }

  async subscribe(
    profile: MpdProfile,
    callback: (event: MpdEvent) => void,
  ): Promise<(name?: string) => void> {
    const client = await this.connect(profile);
    const handle = (name?: string) => {
      if (name == null) {
        callback(new MpdEvent({ eventType: MpdEvent_EventType.DISCONNECTED }));
        return;
      }
      console.info(`MPD event: ${name}`);
      switch (name) {
        case "database":
          callback(new MpdEvent({ eventType: MpdEvent_EventType.DATABASE }));
          break;
        case "update":
          callback(new MpdEvent({ eventType: MpdEvent_EventType.UPDATE }));
          break;
        case "mixier":
          callback(new MpdEvent({ eventType: MpdEvent_EventType.MIXER }));
          break;
        case "options":
          callback(new MpdEvent({ eventType: MpdEvent_EventType.OPTIONS }));
          break;
        case "player":
          callback(new MpdEvent({ eventType: MpdEvent_EventType.PLAYER }));
          break;
        case "playlist":
          callback(new MpdEvent({ eventType: MpdEvent_EventType.PLAY_QUEUE }));
          break;
        case "stored_playlist":
          callback(new MpdEvent({ eventType: MpdEvent_EventType.PLAYLIST }));
          break;
        default:
          callback(new MpdEvent({ eventType: MpdEvent_EventType.UNKNOWN }));
      }
    };
    client.on("system", handle);
    client.on("close", handle);
    return handle;
  }

  async unsubscribe(
    profile: MpdProfile,
    handle: (name?: string) => void,
  ): Promise<boolean> {
    try {
      const client = await this.connect(profile);
      client.off("system", handle);
      client.off("close", handle);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async executeBulk(reqs: MpdRequest[]): Promise<void> {
    const commandGroup: DeepMap<MpdProfile, MpdRequest[]> = new DeepMap();
    for (const req of reqs) {
      if (!commandGroup.has(req.profile!)) {
        commandGroup.set(req.profile!, []);
      }
      commandGroup.get(req.profile!)?.push(req);
    }

    for (const [profile, reqs] of commandGroup) {
      const client = await this.connect(profile);
      const cmds = reqs.map(this.convertCommand);
      await client.sendCommands(cmds);
    }
  }

  async execute(req: MpdRequest): Promise<MpdResponse> {
    const profile = req.profile;
    if (profile === undefined) {
      throw new Error("Profile is undefined");
    }
    const client = await this.connect(profile);
    const cmd = this.convertCommand(req);

    switch (req.command?.case) {
      // Connection
      case "ping": {
        await this.sendCommand(client, cmd);
        const version = this.getVersion(client);
        return new MpdResponse({
          command: {
            case: "ping",
            value: { version },
          },
        });
      }
      // Control
      case "next":
        await this.sendCommand(client, cmd);
        return new MpdResponse({ command: { case: "next", value: {} } });
      case "pause":
        await this.sendCommand(client, cmd);
        return new MpdResponse({ command: { case: "pause", value: {} } });
      case "play":
        await this.sendCommand(client, cmd);
        return new MpdResponse({ command: { case: "play", value: {} } });
      case "previous":
        await this.sendCommand(client, cmd);
        return new MpdResponse({
          command: { case: "previous", value: {} },
        });
      case "seek":
        await this.sendCommand(client, cmd);
        return new MpdResponse({ command: { case: "seek", value: {} } });
      case "stop":
        await this.sendCommand(client, cmd);
        return new MpdResponse({ command: { case: "stop", value: {} } });

      // Playback
      case "consume":
        await this.sendCommand(client, cmd);
        return new MpdResponse({
          command: { case: "consume", value: {} },
        });
      case "random":
        await this.sendCommand(client, cmd);
        return new MpdResponse({ command: { case: "random", value: {} } });
      case "repeat":
        await this.sendCommand(client, cmd);
        return new MpdResponse({ command: { case: "repeat", value: {} } });
      case "setvol":
        await this.sendCommand(client, cmd);
        return new MpdResponse({ command: { case: "setvol", value: {} } });
      case "getvol": {
        const ret = await this.sendCommand(client, cmd).then(this.objectParser);
        const vol = MpdClient.parseMpdPlayerVolume(ret);
        if (vol !== undefined) {
          return new MpdResponse({
            command: {
              case: "getvol",
              value: { vol },
            },
          });
        }
        throw new Error(`Invalid volume: ${ret}`);
      }
      case "single":
        await this.sendCommand(client, cmd);
        return new MpdResponse({ command: { case: "single", value: {} } });

      // Status
      case "currentsong": {
        const ret = await this.sendCommand(client, cmd).then(this.objectParser);
        const song = MpdClient.parseSong(ret);
        return new MpdResponse({
          command: {
            case: "currentsong",
            value: { song },
          },
        });
      }
      case "status": {
        const ret = await this.sendCommand(client, cmd).then(this.objectParser);
        const status = MpdClient.parseMpdPlayerStatus(ret);
        return new MpdResponse({
          command: {
            case: "status",
            value: { status },
          },
        });
      }
      case "stats": {
        const version = this.getVersion(client);
        const ret = await this.sendCommand(client, cmd).then(this.objectParser);
        const stats = MpdClient.parseMpdStats(version, ret);
        return new MpdResponse({
          command: {
            case: "stats",
            value: { stats },
          },
        });
      }

      // Queue
      case "add":
        await this.sendCommand(client, cmd);
        return new MpdResponse({ command: { case: "add", value: {} } });
      case "clear":
        await this.sendCommand(client, cmd);
        return new MpdResponse({ command: { case: "clear", value: {} } });
      case "delete":
        await this.sendCommand(client, cmd);
        return new MpdResponse({ command: { case: "delete", value: {} } });
      case "move":
        await this.sendCommand(client, cmd);
        return new MpdResponse({ command: { case: "move", value: {} } });
      case "playlistinfo": {
        const ret = await this.sendCommand(client, cmd).then(this.listParser);
        const songs = ret
          .map((v) => MpdClient.parseSong(v))
          .filter((v) => v !== undefined) as Song[];
        return new MpdResponse({
          command: {
            case: "playlistinfo",
            value: { songs },
          },
        });
      }
      case "shuffle":
        await this.sendCommand(client, cmd);
        return new MpdResponse({
          command: { case: "shuffle", value: {} },
        });

      // StoredPlaylist
      case "listplaylistinfo": {
        const ret = await this.sendCommand(client, cmd).then(this.listParser);
        const songs = ret
          .map((v) => MpdClient.parseSong(v))
          .filter((v) => v !== undefined) as Song[];
        return new MpdResponse({
          command: {
            case: "listplaylistinfo",
            value: {
              songs,
            },
          },
        });
      }
      case "listplaylists": {
        const ret = await this.sendCommand(client, cmd).then(this.listParser);
        const playlists = ret
          .map((v) => MpdClient.parsePlaylist(v))
          .filter((v) => v !== undefined) as Playlist[];
        return new MpdResponse({
          command: {
            case: "listplaylists",
            value: {
              playlists,
            },
          },
        });
      }
      case "playlistadd":
        await this.sendCommand(client, cmd);
        return new MpdResponse({
          command: { case: "playlistadd", value: {} },
        });
      case "playlistclear":
        await this.sendCommand(client, cmd);
        return new MpdResponse({
          command: { case: "playlistclear", value: {} },
        });
      case "playlistdelete":
        await this.sendCommand(client, cmd);
        return new MpdResponse({
          command: { case: "playlistdelete", value: {} },
        });
      case "playlistmove":
        await this.sendCommand(client, cmd);
        return new MpdResponse({
          command: { case: "playlistmove", value: {} },
        });
      case "rename":
        await this.sendCommand(client, cmd);
        return new MpdResponse({
          command: { case: "rename", value: {} },
        });
      case "rm":
        await this.sendCommand(client, cmd);
        return new MpdResponse({
          command: { case: "rm", value: {} },
        });
      case "save":
        await this.sendCommand(client, cmd);
        return new MpdResponse({
          command: { case: "save", value: {} },
        });

      // Database
      case "list": {
        const ret = await this.sendCommand(client, cmd).then(this.listParser);
        const values = ret
          .flatMap((v) => Object.values(v))
          .map((v) => String(v))
          .filter((v) => !!v) as string[];
        return new MpdResponse({
          command: {
            case: "list",
            value: { values },
          },
        });
      }
      case "search": {
        const ret = await this.sendCommand(client, cmd).then(this.listParser);
        const songs = ret
          .map((v) => MpdClient.parseSong(v))
          .filter((v) => v !== undefined) as Song[];
        return new MpdResponse({
          command: {
            case: "search",
            value: { songs },
          },
        });
      }
      case "update":
        await this.sendCommand(client, cmd);
        return new MpdResponse({
          command: { case: "update", value: {} },
        });

      // Audio
      case "outputs": {
        const ret = await this.sendCommand(client, cmd).then(this.listParser);
        const devices = MpdClient.parseMpdOutputDevices(ret);
        return new MpdResponse({
          command: {
            case: "outputs",
            value: { devices },
          },
        });
      }

      // Utility
      case "listAllSongs": {
        const ret = await this.sendCommand(client, cmd).then(
          this.listParserBy("file"),
        );
        const songs = ret
          .map((v) => MpdClient.parseSong(v))
          .filter((v) => v !== undefined) as Song[];
        return new MpdResponse({
          command: {
            case: "listAllSongs",
            value: { songs },
          },
        });
      }
      case "listAllFolders": {
        const ret = await this.sendCommand(client, cmd).then(
          this.listParserBy("directory"),
        );
        const folders = ret
          .map((v) => MpdClient.parseFolder(v))
          .filter((v) => v !== undefined) as Folder[];
        return new MpdResponse({
          command: {
            case: "listAllFolders",
            value: { folders },
          },
        });
      }
      case "listSongsInFolder": {
        const ret = await this.sendCommand(client, cmd).then(
          this.listParserBy("file"),
        );
        const songs = ret
          .map((v) => MpdClient.parseSong(v))
          .filter((v) => v !== undefined) as Song[];
        return new MpdResponse({
          command: {
            case: "listSongsInFolder",
            value: { songs },
          },
        });
      }
      default: {
        throw new Error(`Unsupported command: ${req.toJsonString()}`);
      }
    }
  }

  private getVersion(client: MPD.Client): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((client as any).PROTOCOL_VERSION as string).trim();
  }

  private async sendCommand(
    client: MPD.Client,
    command: MPD.Command,
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return client.sendCommand(command as any);
  }

  private convertCommand(req: MpdRequest): MPD.Command {
    switch (req.command?.case) {
      // Connection
      case "ping":
        return mpd.cmd("ping");

      // Control
      case "next":
        return mpd.cmd("next");
      case "pause":
        if (req.command.value.pause) {
          return mpd.cmd("pause", "1");
        } else {
          return mpd.cmd("pause", "0");
        }
      case "play":
        switch (req.command.value.target.case) {
          case "id":
            return mpd.cmd("playid", req.command.value.target.value);
          case "pos":
            return mpd.cmd("play", req.command.value.target.value);
          default:
            throw new Error(`Unsupported command: ${req.toJsonString()}`);
        }
      case "previous":
        return mpd.cmd("previous");
      case "seek": {
        const time = req.command.value.time;
        switch (req.command.value.target.case) {
          case "id":
            return mpd.cmd(
              "seekid",
              req.command.value.target.value,
              String(time),
            );
          case "pos":
            return mpd.cmd(
              "seek",
              req.command.value.target.value,
              String(time),
            );
          case "current":
            return mpd.cmd("seekcur", String(time));
          default:
            throw new Error(`Unsupported command: ${req.toJsonString()}`);
        }
      }
      case "stop":
        return mpd.cmd("stop");

      // Playback
      case "consume":
        return mpd.cmd("consume", req.command.value.enable ? "1" : "0");
      case "random":
        return mpd.cmd("random", req.command.value.enable ? "1" : "0");
      case "repeat":
        return mpd.cmd("repeat", req.command.value.enable ? "1" : "0");
      case "setvol":
        return mpd.cmd("setvol", String(req.command.value.vol));
      case "getvol":
        return mpd.cmd("getvol");
      case "single":
        return mpd.cmd("single", req.command.value.enable ? "1" : "0");

      // Status
      case "currentsong":
        return mpd.cmd("currentsong");
      case "status":
        return mpd.cmd("status");
      case "stats":
        return mpd.cmd("stats");

      // Queue
      case "add":
        return mpd.cmd("add", req.command.value.uri);
      case "clear":
        return mpd.cmd("clear");
      case "delete":
        switch (req.command.value.target.case) {
          case "id":
            return mpd.cmd("deleteid", req.command.value.target.value);
          case "pos":
            return mpd.cmd("delete", req.command.value.target.value);
          default:
            throw new Error(`Unsupported command: ${req.toJsonString()}`);
        }
      case "move": {
        const to = req.command.value.to;
        switch (req.command.value.from.case) {
          case "fromId": {
            const fromId = req.command.value.from.value;
            return mpd.cmd("moveid", fromId, to);
          }
          case "fromPos": {
            const fromPos = req.command.value.from.value;
            return mpd.cmd("move", fromPos, to);
          }
          default:
            throw new Error(`Unsupported command: ${req.toJsonString()}`);
        }
      }
      case "playlistinfo":
        return mpd.cmd("playlistinfo");
      case "shuffle":
        return mpd.cmd("shuffle");

      // StoredPlaylist
      case "listplaylistinfo":
        return mpd.cmd("listplaylistinfo", req.command.value.name);
      case "listplaylists":
        return mpd.cmd("listplaylists");
      case "playlistadd":
        return mpd.cmd(
          "playlistadd",
          req.command.value.name,
          req.command.value.uri,
        );
      case "playlistclear":
        return mpd.cmd("playlistclear", req.command.value.name);
      case "playlistdelete":
        return mpd.cmd(
          "playlistdelete",
          req.command.value.name,
          req.command.value.pos,
        );
      case "playlistmove":
        return mpd.cmd(
          "playlistmove",
          req.command.value.name,
          req.command.value.from,
          req.command.value.to,
        );
      case "rename":
        return mpd.cmd(
          "rename",
          req.command.value.name,
          req.command.value.newName,
        );
      case "rm":
        return mpd.cmd("rm", req.command.value.name);
      case "save":
        return mpd.cmd("save", req.command.value.name);

      // Database
      case "list": {
        const tag = MpdUtils.convertSongMetadataTagToMpdTag(
          req.command.value.tag,
        );
        const conditions = req.command.value.conditions;
        const expression = MpdUtils.convertConditionsToString(conditions);
        return expression === ""
          ? mpd.cmd("list", tag)
          : mpd.cmd("list", tag, expression);
      }
      case "search": {
        const conditions = req.command.value.conditions;
        const expression = MpdUtils.convertConditionsToString(conditions);
        return mpd.cmd("search", expression);
      }
      case "update":
        return mpd.cmd("update");

      // Audio
      case "outputs":
        return mpd.cmd("outputs");

      // Utility
      case "listAllSongs":
        return mpd.cmd("listallinfo");
      case "listAllFolders":
        return mpd.cmd("listall");
      case "listSongsInFolder": {
        const folder = req.command.value.folder;
        if (folder === undefined) {
          throw Error("Folder is undefined for listSongsInFolder");
        }
        return mpd.cmd("lsinfo", folder.path);
      }

      default: {
        throw new Error(`Unsupported command: ${req.toJsonString()}`);
      }
    }
  }

  private static parseSong(v: unknown): Song | undefined {
    type MpdSongRaw = {
      file: string;
      title: string;
      artist: string;
      albumartist: string;
      album: string;
      genre: string;
      composer: string;
      track: string;
      disc: string;
      date: string;
      duration: string;
      format: string;
      lastmodified: string;
      id: string;
      pos: string;
      comment: string;
      label: string;
    };

    const song = new Song();

    if (typeof v !== "object" || !v) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mpdSongWithLowerCaseKeys: { [key: string]: any } = {};
    Object.entries(v).forEach(([key, value]) => {
      mpdSongWithLowerCaseKeys[
        key.toLowerCase().replaceAll("-", "").replaceAll("_", "")
      ] = String(value);
    });

    const mpdSong = mpdSongWithLowerCaseKeys as Record<
      keyof MpdSongRaw,
      unknown
    >;

    if (mpdSong.file && typeof mpdSong.file === "string") {
      song.path = mpdSong.file;
    } else {
      return undefined;
    }

    const title =
      mpdSong.title && typeof mpdSong.title === "string" ? mpdSong.title : "";
    song.metadata[Song_MetadataTag.TITLE] = new Song_MetadataValue({
      value: {
        case: "stringValue",
        value: new StringValue({ value: title }),
      },
    });

    const artist =
      mpdSong.artist && typeof mpdSong.artist === "string"
        ? mpdSong.artist
        : "";
    song.metadata[Song_MetadataTag.ARTIST] = new Song_MetadataValue({
      value: {
        case: "stringValue",
        value: new StringValue({ value: artist }),
      },
    });

    const albumArtist =
      mpdSong.albumartist && typeof mpdSong.albumartist === "string"
        ? mpdSong.albumartist
        : "";
    song.metadata[Song_MetadataTag.ALBUM_ARTIST] = new Song_MetadataValue({
      value: {
        case: "stringValue",
        value: new StringValue({ value: albumArtist }),
      },
    });

    const album =
      mpdSong.album && typeof mpdSong.album === "string" ? mpdSong.album : "";
    song.metadata[Song_MetadataTag.ALBUM] = new Song_MetadataValue({
      value: {
        case: "stringValue",
        value: new StringValue({ value: album }),
      },
    });

    const genre =
      mpdSong.genre && typeof mpdSong.genre === "string" ? mpdSong.genre : "";
    song.metadata[Song_MetadataTag.GENRE] = new Song_MetadataValue({
      value: {
        case: "stringValue",
        value: new StringValue({ value: genre }),
      },
    });

    const composer =
      mpdSong.composer && typeof mpdSong.composer === "string"
        ? mpdSong.composer
        : "";
    song.metadata[Song_MetadataTag.COMPOSER] = new Song_MetadataValue({
      value: {
        case: "stringValue",
        value: new StringValue({ value: composer }),
      },
    });

    const track =
      mpdSong.track &&
      typeof mpdSong.track === "string" &&
      !isNaN(+mpdSong.track)
        ? +mpdSong.track
        : undefined;
    song.metadata[Song_MetadataTag.TRACK] = new Song_MetadataValue({
      value: {
        case: "intValue",
        value: new Int32Value({ value: track }),
      },
    });

    const disc =
      mpdSong.disc && typeof mpdSong.disc === "string" && !isNaN(+mpdSong.disc)
        ? +mpdSong.disc
        : undefined;
    song.metadata[Song_MetadataTag.DISC] = new Song_MetadataValue({
      value: {
        case: "intValue",
        value: new Int32Value({ value: disc }),
      },
    });

    const date =
      mpdSong.date && typeof mpdSong.date === "string" ? mpdSong.date : "";
    song.metadata[Song_MetadataTag.DATE] = new Song_MetadataValue({
      value: {
        case: "stringValue",
        value: new StringValue({ value: date }),
      },
    });

    const duration =
      mpdSong.duration &&
      typeof mpdSong.duration === "string" &&
      !isNaN(+mpdSong.duration)
        ? +mpdSong.duration
        : undefined;
    song.metadata[Song_MetadataTag.DURATION] = new Song_MetadataValue({
      value: {
        case: "floatValue",
        value: new FloatValue({ value: duration }),
      },
    });

    const format =
      mpdSong.format && typeof mpdSong.format === "string"
        ? this.parseAudioFormat(mpdSong.format)
        : undefined;
    song.metadata[Song_MetadataTag.FORMAT] = new Song_MetadataValue({
      value: {
        case: "format",
        value: format !== undefined ? format : new AudioFormat(),
      },
    });

    const lastModified =
      mpdSong.lastmodified && typeof mpdSong.lastmodified === "string"
        ? mpdSong.lastmodified
        : undefined;
    try {
      const updatedAt = dayjs(lastModified);
      song.metadata[Song_MetadataTag.UPDATED_AT] = new Song_MetadataValue({
        value: {
          case: "timestamp",
          value: Timestamp.fromDate(updatedAt.toDate()),
        },
      });
    } catch (_) {
      song.metadata[Song_MetadataTag.UPDATED_AT] = new Song_MetadataValue({
        value: {
          case: "timestamp",
          value: new Timestamp(undefined),
        },
      });
    }

    const id =
      mpdSong.id && typeof mpdSong.id === "string" && !isNaN(+mpdSong.id)
        ? +mpdSong.id
        : undefined;
    song.metadata[Song_MetadataTag.ID] = new Song_MetadataValue({
      value: {
        case: "intValue",
        value: new Int32Value({ value: id }),
      },
    });

    const position =
      mpdSong.pos && typeof mpdSong.pos === "string" && !isNaN(+mpdSong.pos)
        ? +mpdSong.pos
        : undefined;
    song.metadata[Song_MetadataTag.POSITION] = new Song_MetadataValue({
      value: {
        case: "intValue",
        value: new Int32Value({ value: position }),
      },
    });

    const comment =
      mpdSong.comment && typeof mpdSong.comment === "string"
        ? mpdSong.comment
        : "";
    song.metadata[Song_MetadataTag.COMMENT] = new Song_MetadataValue({
      value: {
        case: "stringValue",
        value: new StringValue({ value: comment }),
      },
    });

    const label =
      mpdSong.label && typeof mpdSong.label === "string" ? mpdSong.label : "";
    song.metadata[Song_MetadataTag.LABEL] = new Song_MetadataValue({
      value: {
        case: "stringValue",
        value: new StringValue({ value: label }),
      },
    });

    return song;
  }

  private static parseAudioFormat(v: string): AudioFormat | undefined {
    const elems = v.split(":");
    if (elems.length === 0) {
      return undefined;
    }
    const format = new AudioFormat();
    if (elems[0].includes("dsd")) {
      format.encoding = AudioFormat_Encoding.DSD;
      const sr = elems[0].replace("dsd", "");
      if (!isNaN(+sr)) {
        format.samplingRate = +sr;
      }
      if (elems.length > 1) {
        if (!isNaN(+elems[1])) {
          format.channels = +elems[1];
        }
      }
    } else {
      format.encoding = AudioFormat_Encoding.PCM;
      if (!isNaN(+elems[0])) {
        format.samplingRate = +elems[0];
      }
      if (elems.length > 1 && !isNaN(+elems[1])) {
        format.bits = +elems[1];
      }
      if (elems.length > 2 && !isNaN(+elems[2])) {
        format.channels = +elems[2];
      }
    }

    return format;
  }

  private static parseMpdStats(
    version: string,
    stats: unknown,
  ): MpdStats | undefined {
    type MpdStatsRaw = {
      uptime: string;
      playtime: string;
      artists: string;
      albums: string;
      songs: string;
      db_playtime: string;
      db_update: string;
    };

    const mpdStats = new MpdStats();

    if (typeof stats !== "object" || !stats) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statsRawWithLowerCaseKeys: { [key: string]: any } = {};
    Object.entries(stats).forEach(([key, value]) => {
      statsRawWithLowerCaseKeys[key.toLowerCase().replace("-", "")] =
        String(value);
    });
    const statsRaw = statsRawWithLowerCaseKeys as Record<
      keyof MpdStatsRaw,
      unknown
    >;

    mpdStats.version = version;

    const artistsCount =
      statsRaw.artists &&
      typeof statsRaw.artists === "string" &&
      !isNaN(+statsRaw.artists)
        ? +statsRaw.artists
        : 0;
    mpdStats.artistsCount = artistsCount;

    const albumsCount =
      statsRaw.albums &&
      typeof statsRaw.albums === "string" &&
      !isNaN(+statsRaw.albums)
        ? +statsRaw.albums
        : 0;
    mpdStats.albumsCount = albumsCount;

    const songsCount =
      statsRaw.songs &&
      typeof statsRaw.songs === "string" &&
      !isNaN(+statsRaw.songs)
        ? +statsRaw.songs
        : 0;
    mpdStats.songsCount = songsCount;

    const uptime =
      statsRaw.uptime &&
      typeof statsRaw.uptime === "string" &&
      !isNaN(+statsRaw.uptime)
        ? +statsRaw.uptime
        : 0;
    mpdStats.uptime = uptime;

    const playtime =
      statsRaw.playtime &&
      typeof statsRaw.playtime === "string" &&
      !isNaN(+statsRaw.playtime)
        ? +statsRaw.playtime
        : 0;
    mpdStats.playtime = playtime;

    const totalPlaytime =
      statsRaw.db_playtime &&
      typeof statsRaw.db_playtime === "string" &&
      !isNaN(+statsRaw.db_playtime)
        ? +statsRaw.db_playtime
        : 0;
    mpdStats.totalPlaytime = totalPlaytime;

    const lastUpdated =
      statsRaw.db_update &&
      typeof statsRaw.db_update === "string" &&
      !isNaN(+statsRaw.db_update)
        ? +statsRaw.db_update
        : 0;
    mpdStats.lastUpdated = Timestamp.fromDate(new Date(lastUpdated * 1000));

    return mpdStats;
  }

  private static parseMpdOutputDevices(
    outputs: unknown[],
  ): MpdOutputDevice[] | undefined {
    type MpdOutputRaw = {
      outputid: string;
      outputname: string;
      plugin: string;
      outputenabled: string;
    };

    const mpdOutputDevices = [];

    for (const output of outputs) {
      const mpdOutput = new MpdOutputDevice();

      if (typeof output !== "object" || !output) {
        return undefined;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const outputRawWithLowerCaseKeys: { [key: string]: any } = {};
      Object.entries(output).forEach(([key, value]) => {
        outputRawWithLowerCaseKeys[key.toLowerCase().replace("-", "")] =
          String(value);
      });
      const outputRaw = outputRawWithLowerCaseKeys as Record<
        keyof MpdOutputRaw,
        unknown
      >;

      const outputId =
        outputRaw.outputid &&
        typeof outputRaw.outputid === "string" &&
        !isNaN(+outputRaw.outputid)
          ? +outputRaw.outputid
          : -1;
      mpdOutput.id = outputId;

      const outputName =
        outputRaw.outputname && typeof outputRaw.outputname === "string"
          ? outputRaw.outputname
          : "";
      mpdOutput.name = outputName;

      const plugin =
        outputRaw.plugin && typeof outputRaw.plugin === "string"
          ? outputRaw.plugin
          : "";
      mpdOutput.plugin = plugin;

      const isEnabled =
        outputRaw.outputenabled &&
        typeof outputRaw.outputenabled === "string" &&
        !isNaN(+outputRaw.outputenabled)
          ? +outputRaw.outputenabled
          : 0;
      mpdOutput.isEnabled = isEnabled === 1;

      mpdOutputDevices.push(mpdOutput);
    }

    return mpdOutputDevices;
  }

  private static parsePlaylist(v: unknown): Playlist | undefined {
    type MpdPlaylistRaw = {
      playlist: string;
      lastmodified: string;
    };

    const playlist = new Playlist();

    if (typeof v !== "object" || !v) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playlistRawWithLowerCaseKeys: { [key: string]: any } = {};
    Object.entries(v).forEach(([key, value]) => {
      playlistRawWithLowerCaseKeys[key.toLowerCase().replace("-", "")] =
        String(value);
    });
    const playlistRaw = playlistRawWithLowerCaseKeys as Record<
      keyof MpdPlaylistRaw,
      unknown
    >;

    const name =
      playlistRaw.playlist && typeof playlistRaw.playlist === "string"
        ? playlistRaw.playlist
        : "";
    if (name === "") {
      return undefined;
    }
    playlist.name = name;

    const lastModified =
      playlistRaw.lastmodified && typeof playlistRaw.lastmodified === "string"
        ? playlistRaw.lastmodified
        : undefined;
    try {
      const updatedAt = dayjs(lastModified);
      playlist.updatedAt = Timestamp.fromDate(updatedAt.toDate());
    } catch (e) {
      console.error(`Failed to parse last-modified: ${e}`);
    }

    return playlist;
  }

  private static parseFolder(v: unknown): Folder | undefined {
    type MpdFolderRaw = {
      directory: string;
    };
    const folder = new Folder();

    if (typeof v !== "object" || !v) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const folderRawWithLowerCaseKeys: { [key: string]: any } = {};
    Object.entries(v).forEach(([key, value]) => {
      folderRawWithLowerCaseKeys[key.toLowerCase().replace("-", "")] =
        String(value);
    });
    const folderRaw = folderRawWithLowerCaseKeys as Record<
      keyof MpdFolderRaw,
      unknown
    >;

    const path =
      folderRaw.directory && typeof folderRaw.directory === "string"
        ? folderRaw.directory
        : "";
    if (path === "") {
      return undefined;
    }
    folder.path = path;
    return folder;
  }

  private static parseMpdPlayerVolume(v: unknown): MpdPlayerVolume | undefined {
    type MpdVolumeRaw = {
      volume: string | undefined;
    };

    const mpdVolume = new MpdPlayerVolume();

    if (v === undefined) {
      mpdVolume.volume = -1;
    } else {
      if (typeof v !== "object" || !v) {
        return undefined;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const volumeRawWithLowerCaseKeys: { [key: string]: any } = {};
      Object.entries(v).forEach(([key, value]) => {
        volumeRawWithLowerCaseKeys[key.toLowerCase().replace("-", "")] =
          String(value);
      });
      const volumeRaw = volumeRawWithLowerCaseKeys as Record<
        keyof MpdVolumeRaw,
        unknown
      >;

      const vol =
        volumeRaw.volume &&
        typeof volumeRaw.volume === "string" &&
        !isNaN(+volumeRaw.volume)
          ? +volumeRaw.volume
          : -1;
      mpdVolume.volume = vol;
    }

    return mpdVolume;
  }

  private static parseMpdPlayerStatus(v: unknown): MpdPlayerStatus | undefined {
    type MpdPlayerRaw = {
      repeat: string;
      random: string;
      single: string;
      consume: string;
      partition: string;
      playlist: string;
      playlistlength: string;
      state: string;
      song: string;
      songid: string;
      elapsed: string;
      bitrate: string;
      duration: string;
      audio: string;
      nextsong: string;
      nextsongid: string;
      updating_db: string;
    };

    const mpdStatus = new MpdPlayerStatus();

    if (typeof v !== "object" || !v) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statusRawWithLowerCaseKeys: { [key: string]: any } = {};
    Object.entries(v).forEach(([key, value]) => {
      statusRawWithLowerCaseKeys[key.toLowerCase().replace("-", "")] =
        String(value);
    });
    const statusRaw = statusRawWithLowerCaseKeys as Record<
      keyof MpdPlayerRaw,
      unknown
    >;

    const isRepeat =
      statusRaw.repeat &&
      typeof statusRaw.repeat === "string" &&
      !isNaN(+statusRaw.repeat)
        ? +statusRaw.repeat
        : 0;
    mpdStatus.isRepeat = isRepeat === 1;

    const isRandom =
      statusRaw.random &&
      typeof statusRaw.random === "string" &&
      !isNaN(+statusRaw.random)
        ? +statusRaw.random
        : 0;
    mpdStatus.isRandom = isRandom === 1;

    const isSingle =
      statusRaw.single &&
      typeof statusRaw.single === "string" &&
      !isNaN(+statusRaw.single)
        ? +statusRaw.single
        : 0;
    mpdStatus.isSingle = isSingle === 1;

    const isConsume =
      statusRaw.consume &&
      typeof statusRaw.consume === "string" &&
      !isNaN(+statusRaw.consume)
        ? +statusRaw.consume
        : 0;
    mpdStatus.isConsume = isConsume === 1;

    const playQueueLength =
      statusRaw.playlistlength &&
      typeof statusRaw.playlistlength === "string" &&
      !isNaN(+statusRaw.playlistlength)
        ? +statusRaw.playlistlength
        : -1;
    mpdStatus.playQueueLength = playQueueLength;

    const state =
      statusRaw.state && typeof statusRaw.state === "string"
        ? statusRaw.state
        : "";
    switch (state) {
      case "play":
        mpdStatus.playbackState = MpdPlayerStatus_PlaybackState.PLAY;
        break;
      case "pause":
        mpdStatus.playbackState = MpdPlayerStatus_PlaybackState.PAUSE;
        break;
      case "stop":
        mpdStatus.playbackState = MpdPlayerStatus_PlaybackState.STOP;
        break;
      default:
        mpdStatus.playbackState = MpdPlayerStatus_PlaybackState.UNKNOWN;
    }

    const song =
      statusRaw.song &&
      typeof statusRaw.song === "string" &&
      !isNaN(+statusRaw.song)
        ? +statusRaw.song
        : -1;
    mpdStatus.song = song;

    const songId =
      statusRaw.songid &&
      typeof statusRaw.songid === "string" &&
      !isNaN(+statusRaw.songid)
        ? +statusRaw.songid
        : -1;
    mpdStatus.songId = songId;

    const nextSong =
      statusRaw.nextsong &&
      typeof statusRaw.nextsong === "string" &&
      !isNaN(+statusRaw.nextsong)
        ? +statusRaw.nextsong
        : -1;
    mpdStatus.nextSong = nextSong;

    const nextSongId =
      statusRaw.nextsongid &&
      typeof statusRaw.nextsongid === "string" &&
      !isNaN(+statusRaw.nextsongid)
        ? +statusRaw.nextsongid
        : -1;
    mpdStatus.nextSongId = nextSongId;

    const elapsed =
      statusRaw.elapsed &&
      typeof statusRaw.elapsed === "string" &&
      !isNaN(+statusRaw.elapsed)
        ? +statusRaw.elapsed
        : 0;
    mpdStatus.elapsed = elapsed;

    const duration =
      statusRaw.duration &&
      typeof statusRaw.duration === "string" &&
      !isNaN(+statusRaw.duration)
        ? +statusRaw.duration
        : 0;
    mpdStatus.duration = duration;

    const bitrate =
      statusRaw.bitrate &&
      typeof statusRaw.bitrate === "string" &&
      !isNaN(+statusRaw.bitrate)
        ? +statusRaw.bitrate
        : 0;
    mpdStatus.bitrate = bitrate;

    const format =
      statusRaw.audio && typeof statusRaw.audio === "string"
        ? statusRaw.audio
        : "";
    mpdStatus.audioFormat = this.parseAudioFormat(format);

    const isUpdating =
      statusRaw.updating_db &&
      typeof statusRaw.updating_db === "string" &&
      !isNaN(+statusRaw.updating_db)
        ? +statusRaw.updating_db
        : -1;
    mpdStatus.isDatabaseUpdating = isUpdating >= 0;

    return mpdStatus;
  }
}

export const mpdClient = new MpdClient();
