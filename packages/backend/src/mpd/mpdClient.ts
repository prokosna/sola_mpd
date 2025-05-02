import { type ReadableStream, TransformStream } from "node:stream/web";
import {
	type MpdRequest,
	MpdResponse,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import {
	MpdEvent,
	MpdEvent_EventType,
} from "@sola_mpd/domain/src/models/mpd/mpd_event_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { DeepMap } from "@sola_mpd/domain/src/utils/DeepMap.js";
import {
	convertConditionsToString,
	convertSongMetadataTagToMpdTag,
} from "@sola_mpd/domain/src/utils/mpdUtils.js";
import * as mpd from "mpd3";
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
	private clients: DeepMap<MpdProfile, Promise<mpd.MpdClient>> = new DeepMap(
		new Map(),
	);

	private async connect(profile: MpdProfile): Promise<mpd.MpdClient> {
		if (this.clients.has(profile)) {
			const client = this.clients.get(profile);
			if (client === undefined) {
				throw new Error("This shouldn't happen.");
			}
			return client;
		}

		// Create new client
		const config = {
			host: profile.host,
			port: profile.port,
		};
		const clientPromise = mpd.MpdClient.connect(config).then((client) => {
			client.once("close", () => {
				this.clients.delete(profile);
				console.info("Removed closed client");
			});
			return client;
		});
		this.clients.set(profile, clientPromise);
		return clientPromise;
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
			if (req.profile === undefined) {
				continue;
			}
			if (!commandGroup.has(req.profile)) {
				commandGroup.set(req.profile, []);
			}
			commandGroup.get(req.profile)?.push(req);
		}

		for (const [profile, reqs] of commandGroup) {
			const client = await this.connect(profile);
			const cmds = reqs.map(this.convertCommand);
			await client.sendCommands(cmds);
		}
	}

	private getVersion(client: mpd.MpdClient): string {
		return client.PROTOCOL_VERSION.trim();
	}

	private async sendCommand(
		client: mpd.MpdClient,
		command: mpd.Command,
	): Promise<string> {
		return client.sendCommand(command);
	}

	private async streamCommandToObject(
		client: mpd.MpdClient,
		command: mpd.Command,
	): Promise<Record<string, unknown> | undefined> {
		return client
			.streamCommand(command)
			.then((stream) =>
				stream.pipeThrough(
					mpd.MpdParsers.transformToObject({ normalizeKeys: false }),
				),
			)
			.then(mpd.MpdParsers.takeFirstObject);
	}

	private async streamCommandToStream(
		client: mpd.MpdClient,
		command: mpd.Command,
		delimiterKeys: string[] = [],
	): Promise<ReadableStream<Record<string, unknown>>> {
		return client.streamCommand(command).then((stream) =>
			stream.pipeThrough(
				mpd.MpdParsers.transformToList({
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
				const ret = await this.streamCommandToObject(client, cmd);
				const vol = parseMpdPlayerVolume(ret);
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
				const ret = await this.streamCommandToObject(client, cmd);
				const song = parseSong(ret);
				return new MpdResponse({
					command: {
						case: "currentsong",
						value: { song },
					},
				});
			}
			case "status": {
				const ret = await this.streamCommandToObject(client, cmd);
				const status = parseMpdPlayerStatus(ret);
				return new MpdResponse({
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
				const songs = await this.streamCommandToStream(client, cmd, ["file"])
					.then((stream) => stream.pipeThrough(this.transformToSong()))
					.then(mpd.MpdParsers.aggregateToList);
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
				const songs = await this.streamCommandToStream(client, cmd, ["file"])
					.then((stream) => stream.pipeThrough(this.transformToSong()))
					.then(mpd.MpdParsers.aggregateToList);
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
					.then(mpd.MpdParsers.aggregateToList);
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
					.then(mpd.MpdParsers.aggregateToList);
				return new MpdResponse({
					command: {
						case: "list",
						value: { values },
					},
				});
			}
			case "search": {
				const songs = await this.streamCommandToStream(client, cmd, ["file"])
					.then((stream) => stream.pipeThrough(this.transformToSong()))
					.then(mpd.MpdParsers.aggregateToList);
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
					.then(mpd.MpdParsers.aggregateToList);
				return new MpdResponse({
					command: {
						case: "outputs",
						value: { devices },
					},
				});
			}

			// Utility
			case "listAllSongs": {
				const songs = await this.streamCommandToStream(client, cmd, [
					"directory",
					"file",
				])
					.then((stream) => stream.pipeThrough(this.transformToSong()))
					.then(mpd.MpdParsers.aggregateToList);
				return new MpdResponse({
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
					.then(mpd.MpdParsers.aggregateToList);
				return new MpdResponse({
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
					.then(mpd.MpdParsers.aggregateToList);
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

	private convertCommand(req: MpdRequest): mpd.Command {
		switch (req.command?.case) {
			// Connection
			case "ping":
				return mpd.Command.cmd("ping");

			// Control
			case "next":
				return mpd.Command.cmd("next");
			case "pause":
				if (req.command.value.pause) {
					return mpd.Command.cmd("pause", "1");
				}
				return mpd.Command.cmd("pause", "0");
			case "play":
				switch (req.command.value.target.case) {
					case "id":
						return mpd.Command.cmd("playid", req.command.value.target.value);
					case "pos":
						return mpd.Command.cmd("play", req.command.value.target.value);
					default:
						throw new Error(`Unsupported command: ${req.toJsonString()}`);
				}
			case "previous":
				return mpd.Command.cmd("previous");
			case "seek": {
				const time = req.command.value.time;
				switch (req.command.value.target.case) {
					case "id":
						return mpd.Command.cmd(
							"seekid",
							req.command.value.target.value,
							String(time),
						);
					case "pos":
						return mpd.Command.cmd(
							"seek",
							req.command.value.target.value,
							String(time),
						);
					case "current":
						return mpd.Command.cmd("seekcur", String(time));
					default:
						throw new Error(`Unsupported command: ${req.toJsonString()}`);
				}
			}
			case "stop":
				return mpd.Command.cmd("stop");

			// Playback
			case "consume":
				return mpd.Command.cmd("consume", req.command.value.enable ? "1" : "0");
			case "random":
				return mpd.Command.cmd("random", req.command.value.enable ? "1" : "0");
			case "repeat":
				return mpd.Command.cmd("repeat", req.command.value.enable ? "1" : "0");
			case "setvol":
				return mpd.Command.cmd("setvol", String(req.command.value.vol));
			case "getvol":
				return mpd.Command.cmd("getvol");
			case "single":
				return mpd.Command.cmd("single", req.command.value.enable ? "1" : "0");

			// Status
			case "currentsong":
				return mpd.Command.cmd("currentsong");
			case "status":
				return mpd.Command.cmd("status");
			case "stats":
				return mpd.Command.cmd("stats");

			// Queue
			case "add":
				return mpd.Command.cmd("add", req.command.value.uri);
			case "clear":
				return mpd.Command.cmd("clear");
			case "delete":
				switch (req.command.value.target.case) {
					case "id":
						return mpd.Command.cmd("deleteid", req.command.value.target.value);
					case "pos":
						return mpd.Command.cmd("delete", req.command.value.target.value);
					default:
						throw new Error(`Unsupported command: ${req.toJsonString()}`);
				}
			case "move": {
				const to = req.command.value.to;
				switch (req.command.value.from.case) {
					case "fromId": {
						const fromId = req.command.value.from.value;
						return mpd.Command.cmd("moveid", fromId, to);
					}
					case "fromPos": {
						const fromPos = req.command.value.from.value;
						return mpd.Command.cmd("move", fromPos, to);
					}
					default:
						throw new Error(`Unsupported command: ${req.toJsonString()}`);
				}
			}
			case "playlistinfo":
				return mpd.Command.cmd("playlistinfo");
			case "shuffle":
				return mpd.Command.cmd("shuffle");

			// StoredPlaylist
			case "listplaylistinfo":
				return mpd.Command.cmd("listplaylistinfo", req.command.value.name);
			case "listplaylists":
				return mpd.Command.cmd("listplaylists");
			case "playlistadd":
				return mpd.Command.cmd(
					"playlistadd",
					req.command.value.name,
					req.command.value.uri,
				);
			case "playlistclear":
				return mpd.Command.cmd("playlistclear", req.command.value.name);
			case "playlistdelete":
				return mpd.Command.cmd(
					"playlistdelete",
					req.command.value.name,
					req.command.value.pos,
				);
			case "playlistmove":
				return mpd.Command.cmd(
					"playlistmove",
					req.command.value.name,
					req.command.value.from,
					req.command.value.to,
				);
			case "rename":
				return mpd.Command.cmd(
					"rename",
					req.command.value.name,
					req.command.value.newName,
				);
			case "rm":
				return mpd.Command.cmd("rm", req.command.value.name);
			case "save":
				return mpd.Command.cmd("save", req.command.value.name);

			// Database
			case "list": {
				const tag = convertSongMetadataTagToMpdTag(req.command.value.tag);
				const conditions = req.command.value.conditions;
				const expression = convertConditionsToString(conditions);
				return expression === ""
					? mpd.Command.cmd("list", tag)
					: mpd.Command.cmd("list", tag, expression);
			}
			case "search": {
				const conditions = req.command.value.conditions;
				const expression = convertConditionsToString(conditions);
				return mpd.Command.cmd("search", expression);
			}
			case "update":
				return mpd.Command.cmd("update");

			// Audio
			case "outputs":
				return mpd.Command.cmd("outputs");

			// Utility
			case "listAllSongs":
				return mpd.Command.cmd("listallinfo");
			case "listAllFolders":
				return mpd.Command.cmd("listall");
			case "listSongsInFolder": {
				const folder = req.command.value.folder;
				if (folder === undefined) {
					throw Error("Folder is undefined for listSongsInFolder");
				}
				return mpd.Command.cmd("lsinfo", folder.path);
			}

			default: {
				throw new Error(`Unsupported command: ${req.toJsonString()}`);
			}
		}
	}
}

export const mpdClient = new MpdClient();
