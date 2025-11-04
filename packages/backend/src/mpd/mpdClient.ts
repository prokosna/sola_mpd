import { type ReadableStream, TransformStream } from "node:stream/web";
import { create, toJsonString } from "@bufbuild/protobuf";
import {
	type MpdRequest,
	MpdRequestSchema,
	type MpdResponse,
	MpdResponseSchema,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import {
	type MpdEvent,
	MpdEvent_EventType,
	MpdEventSchema,
} from "@sola_mpd/domain/src/models/mpd/mpd_event_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { DeepMap } from "@sola_mpd/domain/src/utils/DeepMap.js";
import {
	convertConditionsToString,
	convertSongMetadataTagToMpdTag,
} from "@sola_mpd/domain/src/utils/mpdUtils.js";
import { Client, Command, Parsers } from "mpd3";
import {
	parseFolder,
	parseMpdOutputDevice,
	parseMpdPlayerStatus,
	parseMpdPlayerVolume,
	parseMpdStats,
	parsePlaylist,
	parseSong,
} from "./mpdParsers.js";

class MpdClient {
	private clients: DeepMap<MpdProfile, Promise<Client>> = new DeepMap(
		new Map(),
	);
	private allSongsCache: DeepMap<MpdProfile, Song[]> = new DeepMap(new Map());

	private async connect(profile: MpdProfile): Promise<Client> {
		console.info(`[MpdClient] connect() called for profile: ${profile.name}`);

		if (this.clients.has(profile)) {
			console.info(`[MpdClient] Using cached client for ${profile.name}`);
			const client = this.clients.get(profile);
			if (client === undefined) {
				throw new Error("This shouldn't happen.");
			}
			return client;
		}

		console.info(`[MpdClient] Creating new client for ${profile.name}`);
		const config = {
			host: profile.host,
			port: profile.port,
			reconnectDelay: 3000,
			maxRetries: 5,
		};

		const clientPromise = Client.connect(config)
			.then((client) => {
				console.info(`[MpdClient] Successfully connected to ${profile.name}`);

				client.on("close", (error) => {
					console.info(
						`[MpdClient] Connection closed for ${profile.name}: ${error?.message || "normal disconnect"}`,
					);
					this.clients.delete(profile);
					this.allSongsCache.delete(profile);
				});

				client.on("error", (error) => {
					console.warn(
						`[MpdClient] Connection error for ${profile.name}: ${error.message}`,
					);
				});

				return client;
			})
			.catch((error) => {
				console.error(
					`[MpdClient] Failed to connect to ${profile.name}: ${error.message}`,
				);
				this.clients.delete(profile);
				throw error;
			});

		this.clients.set(profile, clientPromise);
		return clientPromise;
	}

	async subscribe(
		profile: MpdProfile,
		callback: (event: MpdEvent) => void,
	): Promise<(name?: string) => void> {
		console.info(`[MpdClient] subscribe() called for profile: ${profile.name}`);
		const client = await this.connect(profile);
		const handle = (name?: string) => {
			if (name == null) {
				callback(
					create(MpdEventSchema, {
						eventType: MpdEvent_EventType.DISCONNECTED,
					}),
				);
				return;
			}
			console.info(`MPD event: ${name}`);
			switch (name) {
				case "database":
					callback(
						create(MpdEventSchema, { eventType: MpdEvent_EventType.DATABASE }),
					);
					this.allSongsCache.delete(profile);
					break;
				case "update":
					callback(
						create(MpdEventSchema, { eventType: MpdEvent_EventType.UPDATE }),
					);
					break;
				case "mixier":
					callback(
						create(MpdEventSchema, { eventType: MpdEvent_EventType.MIXER }),
					);
					break;
				case "options":
					callback(
						create(MpdEventSchema, { eventType: MpdEvent_EventType.OPTIONS }),
					);
					break;
				case "player":
					callback(
						create(MpdEventSchema, { eventType: MpdEvent_EventType.PLAYER }),
					);
					break;
				case "playlist":
					callback(
						create(MpdEventSchema, {
							eventType: MpdEvent_EventType.PLAY_QUEUE,
						}),
					);
					break;
				case "stored_playlist":
					callback(
						create(MpdEventSchema, { eventType: MpdEvent_EventType.PLAYLIST }),
					);
					break;
				default:
					callback(
						create(MpdEventSchema, { eventType: MpdEvent_EventType.UNKNOWN }),
					);
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
		console.info(
			`[MpdClient] executeBulk() called with ${reqs.length} requests`,
		);
		const commandGroup: DeepMap<MpdProfile, MpdRequest[]> = new DeepMap();
		for (const req of reqs) {
			if (req.profile === undefined) {
				continue;
			}
			if (!commandGroup.has(req.profile)) {
				commandGroup.set(req.profile, []);
			}
			commandGroup.get(req.profile)?.push(req);
		}

		for (const [profile, reqs] of commandGroup) {
			console.info(
				`[MpdClient] executeBulk() connecting to ${profile.name} for ${reqs.length} commands`,
			);
			const client = await this.connect(profile);
			const cmds = reqs.map(this.convertCommand);
			await client.sendCommands(cmds);
		}
	}

	private getVersion(client: Client): string {
		return client.PROTOCOL_VERSION.trim();
	}

	private async sendCommand(client: Client, command: Command): Promise<string> {
		return client.sendCommand(command);
	}

	private async streamCommandToObject(
		client: Client,
		command: Command,
	): Promise<Record<string, unknown> | undefined> {
		return client
			.streamCommand(command)
			.then((stream) =>
				stream.pipeThrough(Parsers.transformToObject({ normalizeKeys: false })),
			)
			.then(Parsers.takeFirstObject);
	}

	private async streamCommandToStream(
		client: Client,
		command: Command,
		delimiterKeys: string[] = [],
	): Promise<ReadableStream<Record<string, unknown>>> {
		return client.streamCommand(command).then((stream) =>
			stream.pipeThrough(
				Parsers.transformToList({
					delimiterKeys,
					normalizeKeys: false,
				}),
			),
		);
	}

	private transformToSong(): TransformStream<Record<string, unknown>, Song> {
		return new TransformStream({
			transform(v, controller) {
				const song = parseSong(v);
				if (song !== undefined) controller.enqueue(song);
			},
		});
	}

	async execute(req: MpdRequest): Promise<MpdResponse> {
		const profile = req.profile;
		if (profile === undefined) {
			throw new Error("Profile is undefined");
		}
		console.info(
			`[MpdClient] execute() called for profile: ${profile.name}, command: ${req.command?.case}`,
		);
		const client = await this.connect(profile);
		const cmd = this.convertCommand(req);

		switch (req.command?.case) {
			// Connection
			case "ping": {
				await this.sendCommand(client, cmd);
				const version = this.getVersion(client);
				return create(MpdResponseSchema, {
					command: {
						case: "ping",
						value: { version },
					},
				});
			}
			// Control
			case "next":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "next", value: {} },
				});
			case "pause":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "pause", value: {} },
				});
			case "play":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "play", value: {} },
				});
			case "previous":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "previous", value: {} },
				});
			case "seek":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "seek", value: {} },
				});
			case "stop":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "stop", value: {} },
				});

			// Playback
			case "consume":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "consume", value: {} },
				});
			case "random":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "random", value: {} },
				});
			case "repeat":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "repeat", value: {} },
				});
			case "setvol":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "setvol", value: {} },
				});
			case "getvol": {
				const ret = await this.streamCommandToObject(client, cmd);
				const vol = parseMpdPlayerVolume(ret);
				if (vol !== undefined) {
					return create(MpdResponseSchema, {
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
				return create(MpdResponseSchema, {
					command: { case: "single", value: {} },
				});

			// Status
			case "currentsong": {
				const ret = await this.streamCommandToObject(client, cmd);
				const song = parseSong(ret);
				return create(MpdResponseSchema, {
					command: {
						case: "currentsong",
						value: { song },
					},
				});
			}
			case "status": {
				const ret = await this.streamCommandToObject(client, cmd);
				const status = parseMpdPlayerStatus(ret);
				return create(MpdResponseSchema, {
					command: {
						case: "status",
						value: { status },
					},
				});
			}
			case "stats": {
				const version = this.getVersion(client);
				const ret = await this.streamCommandToObject(client, cmd);
				const stats = parseMpdStats(version, ret);
				return create(MpdResponseSchema, {
					command: {
						case: "stats",
						value: { stats },
					},
				});
			}

			// Queue
			case "add":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "add", value: {} },
				});
			case "clear":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "clear", value: {} },
				});
			case "delete":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "delete", value: {} },
				});
			case "move":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "move", value: {} },
				});
			case "playlistinfo": {
				const songs = await this.streamCommandToStream(client, cmd, ["file"])
					.then((stream) => stream.pipeThrough(this.transformToSong()))
					.then(Parsers.aggregateToList);
				return create(MpdResponseSchema, {
					command: {
						case: "playlistinfo",
						value: { songs },
					},
				});
			}
			case "shuffle":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "shuffle", value: {} },
				});

			// StoredPlaylist
			case "listplaylistinfo": {
				const songs = await this.streamCommandToStream(client, cmd, ["file"])
					.then((stream) => stream.pipeThrough(this.transformToSong()))
					.then(Parsers.aggregateToList);
				return create(MpdResponseSchema, {
					command: {
						case: "listplaylistinfo",
						value: {
							songs,
						},
					},
				});
			}
			case "listplaylists": {
				const playlists = await this.streamCommandToStream(client, cmd, [
					"playlist",
				])
					.then((stream) =>
						stream.pipeThrough(
							new TransformStream({
								transform(v, controller) {
									const playlist = parsePlaylist(v);
									if (playlist !== undefined) controller.enqueue(playlist);
								},
							}),
						),
					)
					.then(Parsers.aggregateToList);
				return create(MpdResponseSchema, {
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
				return create(MpdResponseSchema, {
					command: { case: "playlistadd", value: {} },
				});
			case "playlistclear":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "playlistclear", value: {} },
				});
			case "playlistdelete":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "playlistdelete", value: {} },
				});
			case "playlistmove":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "playlistmove", value: {} },
				});
			case "rename":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "rename", value: {} },
				});
			case "rm":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "rm", value: {} },
				});
			case "save":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: "save", value: {} },
				});

			// Database
			case "list": {
				const values = await this.streamCommandToStream(client, cmd)
					.then((stream) =>
						stream.pipeThrough(
							new TransformStream({
								transform(v, controller) {
									const values = Object.values(v);
									for (const value of values) {
										const str = String(value);
										if (str) controller.enqueue(str);
									}
								},
							}),
						),
					)
					.then(Parsers.aggregateToList);
				return create(MpdResponseSchema, {
					command: {
						case: "list",
						value: { values },
					},
				});
			}
			case "search": {
				const songs = await this.streamCommandToStream(client, cmd, ["file"])
					.then((stream) => stream.pipeThrough(this.transformToSong()))
					.then(Parsers.aggregateToList);
				return create(MpdResponseSchema, {
					command: {
						case: "search",
						value: { songs },
					},
				});
			}
			case "update":
				await this.sendCommand(client, cmd);
				this.allSongsCache.delete(profile);
				return create(MpdResponseSchema, {
					command: { case: "update", value: {} },
				});

			// Audio
			case "outputs": {
				const devices = await this.streamCommandToStream(client, cmd)
					.then((stream) =>
						stream.pipeThrough(
							new TransformStream({
								transform(v, controller) {
									const device = parseMpdOutputDevice(v);
									if (device !== undefined) controller.enqueue(device);
								},
							}),
						),
					)
					.then(Parsers.aggregateToList);
				return create(MpdResponseSchema, {
					command: {
						case: "outputs",
						value: { devices },
					},
				});
			}

			// Utility
			case "listAllSongs": {
				let songs = this.allSongsCache.get(profile);
				if (songs === undefined) {
					songs = await this.streamCommandToStream(client, cmd, [
						"directory",
						"file",
					])
						.then((stream) => stream.pipeThrough(this.transformToSong()))
						.then(Parsers.aggregateToList);
					this.allSongsCache.set(profile, songs ?? []);
				}
				return create(MpdResponseSchema, {
					command: {
						case: "listAllSongs",
						value: { songs },
					},
				});
			}
			case "listAllFolders": {
				const folders = await this.streamCommandToStream(client, cmd, [
					"directory",
				])
					.then((stream) =>
						stream.pipeThrough(
							new TransformStream({
								transform(v, controller) {
									const folder = parseFolder(v);
									if (folder !== undefined) controller.enqueue(folder);
								},
							}),
						),
					)
					.then(Parsers.aggregateToList);
				return create(MpdResponseSchema, {
					command: {
						case: "listAllFolders",
						value: { folders },
					},
				});
			}
			case "listSongsInFolder": {
				const songs = await this.streamCommandToStream(client, cmd, [
					"directory",
					"file",
					"playlist",
				])
					.then((stream) => stream.pipeThrough(this.transformToSong()))
					.then(Parsers.aggregateToList);
				return create(MpdResponseSchema, {
					command: {
						case: "listSongsInFolder",
						value: { songs },
					},
				});
			}
			default: {
				throw new Error(
					`Unsupported command: ${toJsonString(MpdRequestSchema, req)}`,
				);
			}
		}
	}

	private convertCommand(req: MpdRequest): Command {
		switch (req.command?.case) {
			// Connection
			case "ping":
				return Command.cmd("ping");

			// Control
			case "next":
				return Command.cmd("next");
			case "pause":
				if (req.command.value.pause) {
					return Command.cmd("pause", "1");
				}
				return Command.cmd("pause", "0");
			case "play":
				switch (req.command.value.target.case) {
					case "id":
						return Command.cmd("playid", req.command.value.target.value);
					case "pos":
						return Command.cmd("play", req.command.value.target.value);
					default:
						throw new Error(
							`Unsupported command: ${toJsonString(MpdRequestSchema, req)}`,
						);
				}
			case "previous":
				return Command.cmd("previous");
			case "seek": {
				const time = req.command.value.time;
				switch (req.command.value.target.case) {
					case "id":
						return Command.cmd(
							"seekid",
							req.command.value.target.value,
							String(time),
						);
					case "pos":
						return Command.cmd(
							"seek",
							req.command.value.target.value,
							String(time),
						);
					case "current":
						return Command.cmd("seekcur", String(time));
					default:
						throw new Error(
							`Unsupported command: ${toJsonString(MpdRequestSchema, req)}`,
						);
				}
			}
			case "stop":
				return Command.cmd("stop");

			// Playback
			case "consume":
				return Command.cmd("consume", req.command.value.enable ? "1" : "0");
			case "random":
				return Command.cmd("random", req.command.value.enable ? "1" : "0");
			case "repeat":
				return Command.cmd("repeat", req.command.value.enable ? "1" : "0");
			case "setvol":
				return Command.cmd("setvol", String(req.command.value.vol));
			case "getvol":
				return Command.cmd("getvol");
			case "single":
				return Command.cmd("single", req.command.value.enable ? "1" : "0");

			// Status
			case "currentsong":
				return Command.cmd("currentsong");
			case "status":
				return Command.cmd("status");
			case "stats":
				return Command.cmd("stats");

			// Queue
			case "add":
				return Command.cmd("add", req.command.value.uri);
			case "clear":
				return Command.cmd("clear");
			case "delete":
				switch (req.command.value.target.case) {
					case "id":
						return Command.cmd("deleteid", req.command.value.target.value);
					case "pos":
						return Command.cmd("delete", req.command.value.target.value);
					default:
						throw new Error(
							`Unsupported command: ${toJsonString(MpdRequestSchema, req)}`,
						);
				}
			case "move": {
				const to = req.command.value.to;
				switch (req.command.value.from.case) {
					case "fromId": {
						const fromId = req.command.value.from.value;
						return Command.cmd("moveid", fromId, to);
					}
					case "fromPos": {
						const fromPos = req.command.value.from.value;
						return Command.cmd("move", fromPos, to);
					}
					default:
						throw new Error(
							`Unsupported command: ${toJsonString(MpdRequestSchema, req)}`,
						);
				}
			}
			case "playlistinfo":
				return Command.cmd("playlistinfo");
			case "shuffle":
				return Command.cmd("shuffle");

			// StoredPlaylist
			case "listplaylistinfo":
				return Command.cmd("listplaylistinfo", req.command.value.name);
			case "listplaylists":
				return Command.cmd("listplaylists");
			case "playlistadd":
				return Command.cmd(
					"playlistadd",
					req.command.value.name,
					req.command.value.uri,
				);
			case "playlistclear":
				return Command.cmd("playlistclear", req.command.value.name);
			case "playlistdelete":
				return Command.cmd(
					"playlistdelete",
					req.command.value.name,
					req.command.value.pos,
				);
			case "playlistmove":
				return Command.cmd(
					"playlistmove",
					req.command.value.name,
					req.command.value.from,
					req.command.value.to,
				);
			case "rename":
				return Command.cmd(
					"rename",
					req.command.value.name,
					req.command.value.newName,
				);
			case "rm":
				return Command.cmd("rm", req.command.value.name);
			case "save":
				return Command.cmd("save", req.command.value.name);

			// Database
			case "list": {
				const tag = convertSongMetadataTagToMpdTag(req.command.value.tag);
				const conditions = req.command.value.conditions;
				const expression = convertConditionsToString(conditions);
				return expression === ""
					? Command.cmd("list", tag)
					: Command.cmd("list", tag, expression);
			}
			case "search": {
				const conditions = req.command.value.conditions;
				const expression = convertConditionsToString(conditions);
				return Command.cmd("search", expression);
			}
			case "update":
				return Command.cmd("update");

			// Audio
			case "outputs":
				return Command.cmd("outputs");

			// Utility
			case "listAllSongs":
				return Command.cmd("listallinfo");
			case "listAllFolders":
				return Command.cmd("listall");
			case "listSongsInFolder": {
				const folder = req.command.value.folder;
				if (folder === undefined) {
					throw Error("Folder is undefined for listSongsInFolder");
				}
				return Command.cmd("lsinfo", folder.path);
			}

			default: {
				throw new Error(
					`Unsupported command: ${toJsonString(MpdRequestSchema, req)}`,
				);
			}
		}
	}
}

export type { MpdClient };
export const mpdClient = new MpdClient();
