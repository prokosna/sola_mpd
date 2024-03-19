import dayjs from "dayjs";
import mpd, { MPD } from "mpd2";

import { Folder } from "@/models/file_explore";
import { MpdRequest, MpdResponse } from "@/models/mpd/mpd_command";
import { MpdEvent, MpdEventEventType } from "@/models/mpd/mpd_event";
import { MpdOutputDevice } from "@/models/mpd/mpd_output";
import {
  MpdPlayerStatus,
  MpdPlayerStatusPlaybackState,
  MpdPlayerVolume,
} from "@/models/mpd/mpd_player";
import { MpdProfile } from "@/models/mpd/mpd_profile";
import { MpdStats } from "@/models/mpd/mpd_stats";
import { Playlist } from "@/models/playlist";
import {
  AudioFormat,
  AudioFormatEncoding,
  Song,
  SongMetadataTag,
  SongMetadataValue,
} from "@/models/song";
import { DeepMap } from "@/utils/DeepMap";
import { MpdUtils } from "@/utils/MpdUtils";

mpd.autoparseValues(false);

class MpdClient {
  private clients: DeepMap<MpdProfile, MPD.Client> = new DeepMap(new Map());
  private listParser = mpd.parseList;
  private objectParser = mpd.parseObject;
  private listParserBy = mpd.parseList.by;

  private async connect(profile: MpdProfile): Promise<MPD.Client> {
    if (this.clients.has(profile)) {
      return this.clients.get(profile)!;
    }
    const config = {
      host: profile.host,
      port: profile.port,
    };
    const client = await mpd.connect(config);
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
        callback(
          MpdEvent.create({ eventType: MpdEventEventType.DISCONNECTED }),
        );
        return;
      }
      console.info(`MPD event: ${name}`);
      switch (name) {
        case "database":
          callback(MpdEvent.create({ eventType: MpdEventEventType.DATABASE }));
          break;
        case "update":
          callback(MpdEvent.create({ eventType: MpdEventEventType.UPDATE }));
          break;
        case "mixier":
          callback(MpdEvent.create({ eventType: MpdEventEventType.MIXER }));
          break;
        case "options":
          callback(MpdEvent.create({ eventType: MpdEventEventType.OPTIONS }));
          break;
        case "player":
          callback(MpdEvent.create({ eventType: MpdEventEventType.PLAYER }));
          break;
        case "playlist":
          callback(
            MpdEvent.create({ eventType: MpdEventEventType.PLAY_QUEUE }),
          );
          break;
        case "stored_playlist":
          callback(MpdEvent.create({ eventType: MpdEventEventType.PLAYLIST }));
          break;
        default:
          callback(MpdEvent.create({ eventType: MpdEventEventType.UNKNOWN }));
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

  private convertCommand(req: MpdRequest): MPD.Command {
    switch (req.command?.$case) {
      // Connection
      case "ping":
        return mpd.cmd("ping");

      // Control
      case "next":
        return mpd.cmd("next");
      case "pause":
        if (req.command.pause.pause) {
          return mpd.cmd("pause", "1");
        } else {
          return mpd.cmd("pause", "0");
        }
      case "play":
        switch (req.command.play.target?.$case) {
          case "id":
            return mpd.cmd("playid", req.command.play.target.id);
          case "pos":
            return mpd.cmd("play", req.command.play.target.pos);
          default:
            throw new Error(`Unsupported command: ${req.command.play.target}`);
        }
      case "previous":
        return mpd.cmd("previous");
      case "seek": {
        const time = req.command.seek.time;
        switch (req.command.seek.target?.$case) {
          case "id":
            return mpd.cmd("seekid", req.command.seek.target.id, String(time));
          case "pos":
            return mpd.cmd("seek", req.command.seek.target.pos, String(time));
          case "current":
            return mpd.cmd("seekcur", String(time));
          default:
            throw new Error(`Unsupported command: ${req.command.seek.target}`);
        }
      }
      case "stop":
        return mpd.cmd("stop");

      // Playback
      case "consume":
        return mpd.cmd("consume", req.command.consume.enable ? "1" : "0");
      case "random":
        return mpd.cmd("random", req.command.random.enable ? "1" : "0");
      case "repeat":
        return mpd.cmd("repeat", req.command.repeat.enable ? "1" : "0");
      case "setvol":
        return mpd.cmd("setvol", String(req.command.setvol.vol));
      case "getvol":
        return mpd.cmd("getvol");
      case "single":
        return mpd.cmd("single", req.command.single.enable ? "1" : "0");

      // Status
      case "currentsong":
        return mpd.cmd("currentsong");
      case "status":
        return mpd.cmd("status");
      case "stats":
        return mpd.cmd("stats");

      // Queue
      case "add":
        return mpd.cmd("add", req.command.add.uri);
      case "clear":
        return mpd.cmd("clear");
      case "delete":
        switch (req.command.delete.target?.$case) {
          case "id":
            return mpd.cmd("deleteid", req.command.delete.target.id);
          case "pos":
            return mpd.cmd("delete", req.command.delete.target.pos);
          default:
            throw new Error(
              `Unsupported command: ${req.command.delete.target}`,
            );
        }
      case "move": {
        const to = req.command.move.to;
        switch (req.command.move.from?.$case) {
          case "fromId":
            const fromId = req.command.move.from.fromId;
            return mpd.cmd("moveid", fromId, to);
          case "fromPos":
            const fromPos = req.command.move.from.fromPos;
            return mpd.cmd("move", fromPos, to);
          default:
            throw new Error(`Unsupported command: ${req.command.move.from}`);
        }
      }
      case "playlistinfo":
        return mpd.cmd("playlistinfo");
      case "shuffle":
        return mpd.cmd("shuffle");

      // StoredPlaylist
      case "listplaylistinfo":
        return mpd.cmd("listplaylistinfo", req.command.listplaylistinfo.name);
      case "listplaylists":
        return mpd.cmd("listplaylists");
      case "playlistadd":
        return mpd.cmd(
          "playlistadd",
          req.command.playlistadd.name,
          req.command.playlistadd.uri,
        );
      case "playlistclear":
        return mpd.cmd("playlistclear", req.command.playlistclear.name);
      case "playlistdelete":
        return mpd.cmd(
          "playlistdelete",
          req.command.playlistdelete.name,
          req.command.playlistdelete.pos,
        );
      case "playlistmove":
        return mpd.cmd(
          "playlistmove",
          req.command.playlistmove.name,
          req.command.playlistmove.from,
          req.command.playlistmove.to,
        );
      case "rename":
        return mpd.cmd(
          "rename",
          req.command.rename.name,
          req.command.rename.newName,
        );
      case "rm":
        return mpd.cmd("rm", req.command.rm.name);
      case "save":
        return mpd.cmd("save", req.command.save.name);

      // Database
      case "list": {
        const tag = MpdUtils.convertSongMetadataTagToMpdTag(
          req.command.list.tag,
        );
        const conditions = req.command.list.conditions;
        const expression = MpdUtils.convertConditionsToString(conditions);
        return expression === ""
          ? mpd.cmd("list", tag)
          : mpd.cmd("list", tag, expression);
      }
      case "search": {
        const conditions = req.command.search.conditions;
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
        const folder = req.command.listSongsInFolder.folder;
        if (folder === undefined) {
          throw Error("Folder is undefined for listSongsInFolder");
        }
        return mpd.cmd("lsinfo", folder.path);
      }

      default: {
        throw new Error(`Unsupported command: ${req.command}`);
      }
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
    const cmd = this.convertCommand(req) as any;

    switch (req.command?.$case) {
      // Connection
      case "ping":
        await client.sendCommand(cmd);
        const version = ((client as any).PROTOCOL_VERSION as string).trim();
        return MpdResponse.create({
          command: { $case: "ping", ping: { version } },
        });

      // Control
      case "next":
        await client.sendCommand(cmd);
        return MpdResponse.create({ command: { $case: "next", next: {} } });
      case "pause":
        await client.sendCommand(cmd);
        return MpdResponse.create({ command: { $case: "pause", pause: {} } });
      case "play":
        await client.sendCommand(cmd);
        return MpdResponse.create({ command: { $case: "play", play: {} } });
      case "previous":
        await client.sendCommand(cmd);
        return MpdResponse.create({
          command: { $case: "previous", previous: {} },
        });
      case "seek":
        await client.sendCommand(cmd);
        return MpdResponse.create({ command: { $case: "seek", seek: {} } });
      case "stop":
        await client.sendCommand(cmd);
        return MpdResponse.create({ command: { $case: "stop", stop: {} } });

      // Playback
      case "consume":
        await client.sendCommand(cmd);
        return MpdResponse.create({
          command: { $case: "consume", consume: {} },
        });
      case "random":
        await client.sendCommand(cmd);
        return MpdResponse.create({ command: { $case: "random", random: {} } });
      case "repeat":
        await client.sendCommand(cmd);
        return MpdResponse.create({ command: { $case: "repeat", repeat: {} } });
      case "setvol":
        await client.sendCommand(cmd);
        return MpdResponse.create({ command: { $case: "setvol", setvol: {} } });
      case "getvol": {
        const ret = await client.sendCommand(cmd).then(this.objectParser);
        const vol = MpdClient.castMpdPlayerVolume(ret);
        if (vol !== undefined) {
          return MpdResponse.create({
            command: { $case: "getvol", getvol: { vol } },
          });
        }
        throw new Error(`Invalid volume: ${ret}`);
      }
      case "single":
        await client.sendCommand(cmd);
        return MpdResponse.create({ command: { $case: "single", single: {} } });

      // Status
      case "currentsong": {
        const ret = await client.sendCommand(cmd).then(this.objectParser);
        const song = MpdClient.castSong(ret);
        return MpdResponse.create({
          command: { $case: "currentsong", currentsong: { song } },
        });
      }
      case "status": {
        const ret = await client.sendCommand(cmd).then(this.objectParser);
        const status = MpdClient.castMpdPlayerStatus(ret);
        return MpdResponse.create({
          command: { $case: "status", status: { status } },
        });
      }
      case "stats": {
        const version = ((client as any).PROTOCOL_VERSION as string).trim();
        const ret = await client.sendCommand(cmd).then(this.objectParser);
        const stats = MpdClient.castMpdStats(version, ret);
        return MpdResponse.create({
          command: { $case: "stats", stats: { stats } },
        });
      }

      // Queue
      case "add":
        await client.sendCommand(cmd);
        return MpdResponse.create({ command: { $case: "add", add: {} } });
      case "clear":
        await client.sendCommand(cmd);
        return MpdResponse.create({ command: { $case: "clear", clear: {} } });
      case "delete":
        await client.sendCommand(cmd);
        return MpdResponse.create({ command: { $case: "delete", delete: {} } });
      case "move":
        await client.sendCommand(cmd);
        return MpdResponse.create({ command: { $case: "move", move: {} } });
      case "playlistinfo": {
        const ret = await client.sendCommand(cmd).then(this.listParser);
        const songs = ret
          .map((v) => MpdClient.castSong(v))
          .filter((v) => v !== undefined) as Song[];
        return MpdResponse.create({
          command: { $case: "playlistinfo", playlistinfo: { songs } },
        });
      }
      case "shuffle":
        await client.sendCommand(cmd);
        return MpdResponse.create({
          command: { $case: "shuffle", shuffle: {} },
        });

      // StoredPlaylist
      case "listplaylistinfo": {
        const ret = await client.sendCommand(cmd).then(this.listParser);
        const songs = ret
          .map((v) => MpdClient.castSong(v))
          .filter((v) => v !== undefined) as Song[];
        return MpdResponse.create({
          command: {
            $case: "listplaylistinfo",
            listplaylistinfo: {
              songs,
            },
          },
        });
      }
      case "listplaylists": {
        const ret = await client.sendCommand(cmd).then(this.listParser);
        const playlists = ret
          .map((v) => MpdClient.castPlaylist(v))
          .filter((v) => v !== undefined) as Playlist[];
        return MpdResponse.create({
          command: {
            $case: "listplaylists",
            listplaylists: {
              playlists,
            },
          },
        });
      }
      case "playlistadd":
        await client.sendCommand(cmd);
        return MpdResponse.create({
          command: { $case: "playlistadd", playlistadd: {} },
        });
      case "playlistclear":
        await client.sendCommand(cmd);
        return MpdResponse.create({
          command: { $case: "playlistclear", playlistclear: {} },
        });
      case "playlistdelete":
        await client.sendCommand(cmd);
        return MpdResponse.create({
          command: { $case: "playlistdelete", playlistdelete: {} },
        });
      case "playlistmove":
        await client.sendCommand(cmd);
        return MpdResponse.create({
          command: { $case: "playlistmove", playlistmove: {} },
        });
      case "rename":
        await client.sendCommand(cmd);
        return MpdResponse.create({
          command: { $case: "rename", rename: {} },
        });
      case "rm":
        await client.sendCommand(cmd);
        return MpdResponse.create({
          command: { $case: "rm", rm: {} },
        });
      case "save":
        await client.sendCommand(cmd);
        return MpdResponse.create({
          command: { $case: "save", save: {} },
        });

      // Database
      case "list": {
        const ret = await client.sendCommand(cmd).then(this.listParser);
        const values = ret
          .flatMap((v) => Object.values(v))
          .map((v) => String(v))
          .filter((v) => !!v) as string[];
        return MpdResponse.create({
          command: { $case: "list", list: { values } },
        });
      }
      case "search": {
        const ret = await client.sendCommand(cmd).then(this.listParser);
        const songs = ret
          .map((v) => MpdClient.castSong(v))
          .filter((v) => v !== undefined) as Song[];
        return MpdResponse.create({
          command: { $case: "search", search: { songs } },
        });
      }
      case "update":
        await client.sendCommand(cmd);
        return MpdResponse.create({
          command: { $case: "update", update: {} },
        });

      // Audio
      case "outputs": {
        const ret = await client.sendCommand(cmd).then(this.listParser);
        const devices = MpdClient.castMpdOutputDevices(ret);
        return MpdResponse.create({
          command: { $case: "outputs", outputs: { devices } },
        });
      }

      // Utility
      case "listAllSongs": {
        const ret = await client
          .sendCommand(cmd)
          .then(this.listParserBy("file"));
        const songs = ret
          .map((v) => MpdClient.castSong(v))
          .filter((v) => v !== undefined) as Song[];
        return MpdResponse.create({
          command: { $case: "listAllSongs", listAllSongs: { songs } },
        });
      }
      case "listAllFolders": {
        const ret = await client
          .sendCommand(cmd)
          .then(this.listParserBy("directory"));
        const folders = ret
          .map((v) => MpdClient.castFolder(v))
          .filter((v) => v !== undefined) as Folder[];
        return MpdResponse.create({
          command: { $case: "listAllFolders", listAllFolders: { folders } },
        });
      }
      case "listSongsInFolder": {
        const ret = await client
          .sendCommand(cmd)
          .then(this.listParserBy("file"));
        const songs = ret
          .map((v) => MpdClient.castSong(v))
          .filter((v) => v !== undefined) as Song[];
        return MpdResponse.create({
          command: { $case: "listSongsInFolder", listSongsInFolder: { songs } },
        });
      }
      default: {
        throw new Error(`Unsupported command: ${req.command}`);
      }
    }
  }

  private static castSong(v: unknown): Song | undefined {
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

    const song = Song.create();

    if (typeof v !== "object" || !v) {
      return undefined;
    }

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
    song.metadata[SongMetadataTag.TITLE] = SongMetadataValue.create({
      value: {
        $case: "stringValue",
        stringValue: title,
      },
    });

    const artist =
      mpdSong.artist && typeof mpdSong.artist === "string"
        ? mpdSong.artist
        : "";
    song.metadata[SongMetadataTag.ARTIST] = SongMetadataValue.create({
      value: {
        $case: "stringValue",
        stringValue: artist,
      },
    });

    const albumArtist =
      mpdSong.albumartist && typeof mpdSong.albumartist === "string"
        ? mpdSong.albumartist
        : "";
    song.metadata[SongMetadataTag.ALBUM_ARTIST] = SongMetadataValue.create({
      value: {
        $case: "stringValue",
        stringValue: albumArtist,
      },
    });

    const album =
      mpdSong.album && typeof mpdSong.album === "string" ? mpdSong.album : "";
    song.metadata[SongMetadataTag.ALBUM] = SongMetadataValue.create({
      value: {
        $case: "stringValue",
        stringValue: album,
      },
    });

    const genre =
      mpdSong.genre && typeof mpdSong.genre === "string" ? mpdSong.genre : "";
    song.metadata[SongMetadataTag.GENRE] = SongMetadataValue.create({
      value: {
        $case: "stringValue",
        stringValue: genre,
      },
    });

    const composer =
      mpdSong.composer && typeof mpdSong.composer === "string"
        ? mpdSong.composer
        : "";
    song.metadata[SongMetadataTag.COMPOSER] = SongMetadataValue.create({
      value: {
        $case: "stringValue",
        stringValue: composer,
      },
    });

    const track =
      mpdSong.track &&
      typeof mpdSong.track === "string" &&
      !isNaN(+mpdSong.track)
        ? +mpdSong.track
        : undefined;
    song.metadata[SongMetadataTag.TRACK] = SongMetadataValue.create({
      value: {
        $case: "intValue",
        intValue: track,
      },
    });

    const disc =
      mpdSong.disc && typeof mpdSong.disc === "string" && !isNaN(+mpdSong.disc)
        ? +mpdSong.disc
        : undefined;
    song.metadata[SongMetadataTag.DISC] = SongMetadataValue.create({
      value: {
        $case: "intValue",
        intValue: disc,
      },
    });

    const date =
      mpdSong.date && typeof mpdSong.date === "string" ? mpdSong.date : "";
    song.metadata[SongMetadataTag.DATE] = SongMetadataValue.create({
      value: {
        $case: "stringValue",
        stringValue: date,
      },
    });

    const duration =
      mpdSong.duration &&
      typeof mpdSong.duration === "string" &&
      !isNaN(+mpdSong.duration)
        ? +mpdSong.duration
        : undefined;
    song.metadata[SongMetadataTag.DURATION] = SongMetadataValue.create({
      value: {
        $case: "floatValue",
        floatValue: duration,
      },
    });

    const format =
      mpdSong.format && typeof mpdSong.format === "string"
        ? this.parseAudioFormat(mpdSong.format)
        : undefined;
    song.metadata[SongMetadataTag.FORMAT] = SongMetadataValue.create({
      value: {
        $case: "format",
        format: format,
      },
    });

    const lastModified =
      mpdSong.lastmodified && typeof mpdSong.lastmodified === "string"
        ? mpdSong.lastmodified
        : undefined;
    try {
      const updatedAt = dayjs(lastModified);
      song.metadata[SongMetadataTag.UPDATED_AT] = SongMetadataValue.create({
        value: {
          $case: "timestamp",
          timestamp: updatedAt.toDate(),
        },
      });
    } catch (_) {
      song.metadata[SongMetadataTag.UPDATED_AT] = SongMetadataValue.create({
        value: {
          $case: "timestamp",
          timestamp: undefined,
        },
      });
    }

    const id =
      mpdSong.id && typeof mpdSong.id === "string" && !isNaN(+mpdSong.id)
        ? +mpdSong.id
        : undefined;
    song.metadata[SongMetadataTag.ID] = SongMetadataValue.create({
      value: {
        $case: "intValue",
        intValue: id,
      },
    });

    const position =
      mpdSong.pos && typeof mpdSong.pos === "string" && !isNaN(+mpdSong.pos)
        ? +mpdSong.pos
        : undefined;
    song.metadata[SongMetadataTag.POSITION] = SongMetadataValue.create({
      value: {
        $case: "intValue",
        intValue: position,
      },
    });

    const comment =
      mpdSong.comment && typeof mpdSong.comment === "string"
        ? mpdSong.comment
        : "";
    song.metadata[SongMetadataTag.COMMENT] = SongMetadataValue.create({
      value: {
        $case: "stringValue",
        stringValue: comment,
      },
    });

    const label =
      mpdSong.label && typeof mpdSong.label === "string" ? mpdSong.label : "";
    song.metadata[SongMetadataTag.LABEL] = SongMetadataValue.create({
      value: {
        $case: "stringValue",
        stringValue: label,
      },
    });

    return song;
  }

  private static parseAudioFormat(v: string): AudioFormat | undefined {
    const elems = v.split(":");
    if (elems.length === 0) {
      return undefined;
    }
    const format = AudioFormat.create();
    if (elems[0].includes("dsd")) {
      format.encoding = AudioFormatEncoding.DSD;
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
      format.encoding = AudioFormatEncoding.PCM;
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

  private static castMpdStats(
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

    const mpdStats = MpdStats.create();

    if (typeof stats !== "object" || !stats) {
      return undefined;
    }

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
    mpdStats.lastUpdated = new Date(lastUpdated * 1000);

    return mpdStats;
  }

  private static castMpdOutputDevices(
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
      const mpdOutput = MpdOutputDevice.create();

      if (typeof output !== "object" || !output) {
        return undefined;
      }

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

  private static castPlaylist(v: unknown): Playlist | undefined {
    type MpdPlaylistRaw = {
      playlist: string;
      lastmodified: string;
    };

    const playlist = Playlist.create();

    if (typeof v !== "object" || !v) {
      return undefined;
    }

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
      playlist.updatedAt = updatedAt.toDate();
    } catch (_) {}

    return playlist;
  }

  private static castFolder(v: unknown): Folder | undefined {
    type MpdFolderRaw = {
      directory: string;
    };
    const folder = Folder.create();

    if (typeof v !== "object" || !v) {
      return undefined;
    }

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

  private static castMpdPlayerVolume(v: unknown): MpdPlayerVolume | undefined {
    type MpdVolumeRaw = {
      volume: string | undefined;
    };

    const mpdVolume = MpdPlayerVolume.create();

    if (v === undefined) {
      mpdVolume.volume = -1;
    } else {
      if (typeof v !== "object" || !v) {
        return undefined;
      }

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

  private static castMpdPlayerStatus(v: unknown): MpdPlayerStatus | undefined {
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

    const mpdStatus = MpdPlayerStatus.create();

    if (typeof v !== "object" || !v) {
      return undefined;
    }

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
        mpdStatus.playbackState = MpdPlayerStatusPlaybackState.PLAY;
        break;
      case "pause":
        mpdStatus.playbackState = MpdPlayerStatusPlaybackState.PAUSE;
        break;
      case "stop":
        mpdStatus.playbackState = MpdPlayerStatusPlaybackState.STOP;
        break;
      default:
        mpdStatus.playbackState = MpdPlayerStatusPlaybackState.UNKNOWN;
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
