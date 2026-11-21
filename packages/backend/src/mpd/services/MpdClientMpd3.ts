import { type ReadableStream, TransformStream } from "node:stream/web";
import { create, toJsonString } from "@bufbuild/protobuf";
import { Client, Command, Parsers } from "@prokosna/mpd3";
import {
	type MpdRequest,
	MpdRequestSchema,
	type MpdResponse,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import {
	type MpdEvent,
	MpdEvent_EventType,
	MpdEventSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { DeepMap } from "@sola_mpd/shared/src/utils/DeepMap.js";
import { buildMpdCommand } from "../functions/mpdCommandBuilder.js";
import {
	parseFolder,
	parseMpdEventType,
	parseMpdOutputDevice,
	parseMpdPlayerStatus,
	parseMpdPlayerVolume,
	parseMpdStats,
	parsePlaylist,
	parseSong,
} from "../functions/mpdParsers.js";
import type { MpdClient, MpdSubscriptionHandler } from "./MpdClient.js";

// Must stay below the frontend's 30s ACK timeout so a request stuck on a dead
// connection fails and frees its slot before the UI gives up.
const MPD_COMMAND_TIMEOUT_MS = 10_000;

type MpdConnectOptions = {
	cache?: boolean;
	timeout?: number;
	maxRetries?: number;
	reconnectDelay?: number;
};

function toMpd3Command(req: MpdRequest): Command {
	const spec = buildMpdCommand(req);
	return Command.cmd(spec.name, spec.args);
}

class MpdClientMpd3 implements MpdClient {
	private clients: DeepMap<MpdProfile, Promise<Client>> = new DeepMap(
		new Map(),
	);
	private allSongsCache: DeepMap<MpdProfile, Promise<Song[]>> = new DeepMap(
		new Map(),
	);
	private subscriptions: Map<
		MpdSubscriptionHandler,
		{ client: Client; handleClose: () => void }
	> = new Map();

	private async connect(
		profile: MpdProfile,
		options?: MpdConnectOptions,
	): Promise<Client> {
		const useCache = options?.cache !== false;

		if (useCache && this.clients.has(profile)) {
			const client = this.clients.get(profile);
			if (client === undefined) {
				throw new Error("This shouldn't happen.");
			}
			return client;
		}

		const config: {
			host: string;
			port: number;
			reconnectDelay: number;
			maxRetries: number;
			commandTimeout: number;
			timeout?: number;
			password?: string;
		} = {
			host: profile.host,
			port: profile.port,
			reconnectDelay: options?.reconnectDelay ?? 3000,
			maxRetries: options?.maxRetries ?? 5,
			commandTimeout: MPD_COMMAND_TIMEOUT_MS,
		};
		if (options?.timeout !== undefined) {
			config.timeout = options.timeout;
		}
		if (profile.password !== "") {
			config.password = profile.password;
		}

		const clientPromise = Client.connect(config)
			.then((client) => {
				client.on("close", (error) => {
					console.info(
						`MPD connection closed for ${profile.name}: ${error?.message || "normal disconnect"}`,
					);
					// An uncached client (ping) shares the profile key but must not
					// evict the cached one.
					if (this.clients.get(profile) === clientPromise) {
						this.clients.delete(profile);
						this.allSongsCache.delete(profile);
					}
				});

				client.on("error", (error) => {
					console.warn(
						`MPD connection error for ${profile.name}: ${error.message}`,
					);
				});

				return client;
			})
			.catch((error) => {
				console.error(
					`Failed to connect to MPD server ${profile.name}: ${error.message}`,
				);
				if (this.clients.get(profile) === clientPromise) {
					this.clients.delete(profile);
				}
				throw error;
			});

		if (useCache) {
			this.clients.set(profile, clientPromise);
		}
		return clientPromise;
	}

	async subscribe(
		profile: MpdProfile,
		callback: (event: MpdEvent) => void,
	): Promise<MpdSubscriptionHandler> {
		const client = await this.connect(profile);
		const handle = (name?: string) => {
			console.info(`MPD event: ${name}`);
			const eventType = parseMpdEventType(name);
			callback(create(MpdEventSchema, { eventType }));
			if (eventType === MpdEvent_EventType.DATABASE) {
				this.allSongsCache.delete(profile);
			}
		};
		// mpd3 emits "close" only once idle monitoring is over for good: after its
		// own reconnect attempts give up, or on an explicit disconnect.
		const handleClose = () => {
			this.detachSubscription(handle);
			callback(
				create(MpdEventSchema, { eventType: MpdEvent_EventType.DISCONNECTED }),
			);
		};
		client.on("system", handle);
		client.on("close", handleClose);
		this.subscriptions.set(handle, { client, handleClose });
		return handle;
	}

	async unsubscribe(
		_profile: MpdProfile,
		handle: MpdSubscriptionHandler,
	): Promise<boolean> {
		this.detachSubscription(handle);
		return true;
	}

	private detachSubscription(handle: MpdSubscriptionHandler): void {
		const subscription = this.subscriptions.get(handle);
		if (subscription === undefined) {
			return;
		}
		subscription.client.off("system", handle);
		subscription.client.off("close", subscription.handleClose);
		this.subscriptions.delete(handle);
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

		for (const [profile, groupReqs] of commandGroup) {
			const client = await this.connect(profile);
			const cmds = groupReqs.map(toMpd3Command);
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

	private async streamCommandToList<T>(
		client: Client,
		command: Command,
		delimiterKeys: string[],
		parse: (record: Record<string, unknown>) => T | undefined,
	): Promise<T[]> {
		return this.streamCommandToStream(client, command, delimiterKeys)
			.then((stream) =>
				stream.pipeThrough(
					new TransformStream<Record<string, unknown>, T>({
						transform(v, controller) {
							const item = parse(v);
							if (item !== undefined) controller.enqueue(item);
						},
					}),
				),
			)
			.then(Parsers.aggregateToList);
	}

	async execute(req: MpdRequest): Promise<MpdResponse> {
		const profile = req.profile;
		if (profile === undefined) {
			throw new Error("Profile is undefined");
		}

		// No retry for ping to respond immediately for failure cases.
		const noRetry = req.command?.case === "ping";
		const connectOptions = noRetry
			? {
					cache: false,
					maxRetries: 0,
					reconnectDelay: 0,
					timeout: 2000,
				}
			: undefined;
		const client = await this.connect(profile, connectOptions);
		const cmd = toMpd3Command(req);

		switch (req.command?.case) {
			case "ping": {
				try {
					await this.sendCommand(client, cmd);
					const version = this.getVersion(client);
					return create(MpdResponseSchema, {
						command: {
							case: "ping",
							value: { version },
						},
					});
				} finally {
					if (noRetry) {
						await client.disconnect();
					}
				}
			}

			case "next":
			case "pause":
			case "play":
			case "previous":
			case "seek":
			case "stop":
			case "consume":
			case "random":
			case "repeat":
			case "setvol":
			case "single":
			case "add":
			case "clear":
			case "delete":
			case "move":
			case "shuffle":
			case "playlistadd":
			case "playlistclear":
			case "playlistdelete":
			case "playlistmove":
			case "rename":
			case "rm":
			case "save":
			case "load":
				await this.sendCommand(client, cmd);
				return create(MpdResponseSchema, {
					command: { case: req.command.case, value: {} },
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
				throw new Error(`Invalid volume: ${JSON.stringify(ret)}`);
			}

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

			case "playlistinfo": {
				const songs = await this.streamCommandToList(
					client,
					cmd,
					["file"],
					parseSong,
				);
				return create(MpdResponseSchema, {
					command: {
						case: "playlistinfo",
						value: { songs },
					},
				});
			}
			case "listplaylistinfo": {
				const songs = await this.streamCommandToList(
					client,
					cmd,
					["file"],
					parseSong,
				);
				return create(MpdResponseSchema, {
					command: {
						case: "listplaylistinfo",
						value: { songs },
					},
				});
			}
			case "listplaylists": {
				const playlists = await this.streamCommandToList(
					client,
					cmd,
					["playlist"],
					parsePlaylist,
				);
				return create(MpdResponseSchema, {
					command: {
						case: "listplaylists",
						value: { playlists },
					},
				});
			}

			case "list": {
				const values = await this.streamCommandToStream(client, cmd)
					.then((stream) =>
						stream.pipeThrough(
							new TransformStream({
								transform(v, controller) {
									for (const value of Object.values(v)) {
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
				const songs = await this.streamCommandToList(
					client,
					cmd,
					["file"],
					parseSong,
				);
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

			case "outputs": {
				const devices = await this.streamCommandToList(
					client,
					cmd,
					[],
					parseMpdOutputDevice,
				);
				return create(MpdResponseSchema, {
					command: {
						case: "outputs",
						value: { devices },
					},
				});
			}

			case "listAllSongs": {
				let songsPromise = this.allSongsCache.get(profile);
				if (songsPromise === undefined) {
					songsPromise = this.streamCommandToList(
						client,
						cmd,
						["directory", "file"],
						parseSong,
					).then((list) => list ?? []);
					const pending = songsPromise;
					this.allSongsCache.set(profile, pending);
					pending.catch(() => {
						if (this.allSongsCache.get(profile) === pending) {
							this.allSongsCache.delete(profile);
						}
					});
				}
				const songs = await songsPromise;
				return create(MpdResponseSchema, {
					command: {
						case: "listAllSongs",
						value: { songs },
					},
				});
			}
			case "listAllFolders": {
				const folders = await this.streamCommandToList(
					client,
					cmd,
					["directory"],
					parseFolder,
				);
				return create(MpdResponseSchema, {
					command: {
						case: "listAllFolders",
						value: { folders },
					},
				});
			}
			case "listSongsInFolder": {
				const songs = await this.streamCommandToList(
					client,
					cmd,
					["directory", "file", "playlist"],
					parseSong,
				);
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
}

export const mpdClientMpd3: MpdClient = new MpdClientMpd3();
