import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { toolError, toolResultText } from "../functions/toolResult.js";
import { resolveCurrentMpdProfile } from "../utils/currentMpdProfile.js";
import {
	errorToToolResult,
	executeMpdCommand,
	type RegisterMcpToolsDeps,
} from "./mcpToolHelpers.js";

export function registerPlaybackTools(
	server: McpServer,
	deps: RegisterMcpToolsDeps,
): void {
	const { mpdClient } = deps;

	server.registerTool(
		"playback_control",
		{
			title: "Playback control",
			description:
				"Controls playback transport. action=play optionally takes queue_position. action=seek requires seek_seconds.",
			inputSchema: {
				action: z.enum([
					"play",
					"pause",
					"resume",
					"stop",
					"next",
					"previous",
					"seek",
				]),
				queue_position: z
					.number()
					.int()
					.nonnegative()
					.optional()
					.describe(
						"Queue position to play (0-indexed). Used only when action=play.",
					),
				seek_seconds: z
					.number()
					.optional()
					.describe(
						"Time offset for seek (within the currently playing song). Used only when action=seek.",
					),
			},
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile();
				switch (args.action) {
					case "play":
						if (args.queue_position !== undefined) {
							await executeMpdCommand(mpdClient, profile, {
								case: "play",
								value: {
									target: { case: "pos", value: String(args.queue_position) },
								},
							});
						} else {
							await executeMpdCommand(mpdClient, profile, {
								case: "play",
								value: { target: { case: "pos", value: "0" } },
							});
						}
						break;
					case "pause":
						await executeMpdCommand(mpdClient, profile, {
							case: "pause",
							value: { pause: true },
						});
						break;
					case "resume":
						await executeMpdCommand(mpdClient, profile, {
							case: "pause",
							value: { pause: false },
						});
						break;
					case "stop":
						await executeMpdCommand(mpdClient, profile, {
							case: "stop",
							value: {},
						});
						break;
					case "next":
						await executeMpdCommand(mpdClient, profile, {
							case: "next",
							value: {},
						});
						break;
					case "previous":
						await executeMpdCommand(mpdClient, profile, {
							case: "previous",
							value: {},
						});
						break;
					case "seek": {
						if (args.seek_seconds === undefined) {
							return toolError("action=seek requires seek_seconds.");
						}
						await executeMpdCommand(mpdClient, profile, {
							case: "seek",
							value: {
								time: args.seek_seconds,
								target: { case: "current", value: true },
							},
						});
						break;
					}
				}
				return toolResultText(`ok: ${args.action}`);
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"playback_set_volume",
		{
			title: "Set playback volume",
			description: "Sets MPD output volume in the range 0-100.",
			inputSchema: {
				volume: z.number().int().min(0).max(100),
			},
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile();
				await executeMpdCommand(mpdClient, profile, {
					case: "setvol",
					value: { vol: args.volume },
				});
				return toolResultText(`volume set to ${args.volume}`);
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"playback_set_mode",
		{
			title: "Set playback modes",
			description:
				"Sets playback modes. Only the keys you pass are changed; omitted keys are left alone.",
			inputSchema: {
				repeat: z.boolean().optional(),
				random: z.boolean().optional(),
				single: z.boolean().optional(),
				consume: z.boolean().optional(),
			},
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile();
				const changed: string[] = [];
				if (args.repeat !== undefined) {
					await executeMpdCommand(mpdClient, profile, {
						case: "repeat",
						value: { enable: args.repeat },
					});
					changed.push(`repeat=${args.repeat}`);
				}
				if (args.random !== undefined) {
					await executeMpdCommand(mpdClient, profile, {
						case: "random",
						value: { enable: args.random },
					});
					changed.push(`random=${args.random}`);
				}
				if (args.single !== undefined) {
					await executeMpdCommand(mpdClient, profile, {
						case: "single",
						value: { enable: args.single },
					});
					changed.push(`single=${args.single}`);
				}
				if (args.consume !== undefined) {
					await executeMpdCommand(mpdClient, profile, {
						case: "consume",
						value: { enable: args.consume },
					});
					changed.push(`consume=${args.consume}`);
				}
				return toolResultText(
					changed.length === 0 ? "no modes changed" : changed.join(", "),
				);
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);
}
