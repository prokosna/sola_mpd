import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import {
	controlPlaybackUseCase,
	setPlaybackModesUseCase,
	setVolumeUseCase,
} from "../application/playbackUseCases.js";
import { toolResultText } from "../functions/toolResult.js";
import {
	errorToToolResult,
	mcpProfileNameSchema,
	type RegisterMcpToolsDeps,
} from "./mcpToolHelpers.js";

export function registerPlaybackTools(
	server: McpServer,
	deps: RegisterMcpToolsDeps,
): void {
	const { mpdClient, mpdProfileStateRepository } = deps;

	server.registerTool(
		"playback_control",
		{
			title: "Playback control",
			description:
				"Controls playback transport. action=play with queue_position plays that song; without it, play and resume both start the current song from the beginning when stopped (the first queued song if there is none) and resume it when paused. action=seek requires seek_seconds. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({
				action: z.enum([
					"play",
					"pause",
					"resume",
					"stop",
					"next",
					"previous",
					"seek",
				]),
				profile: mcpProfileNameSchema,
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
			}),
		},
		async (args) => {
			try {
				await controlPlaybackUseCase({
					action: args.action,
					queuePosition: args.queue_position,
					seekSeconds: args.seek_seconds,
					profileName: args.profile,
					mpdClient,
					mpdProfileStateRepository,
				});
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
			description:
				"Sets MPD output volume in the range 0-100. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({
				volume: z.number().int().min(0).max(100),
				profile: mcpProfileNameSchema,
			}),
		},
		async (args) => {
			try {
				await setVolumeUseCase({
					volume: args.volume,
					profileName: args.profile,
					mpdClient,
					mpdProfileStateRepository,
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
				"Sets playback modes. Only the keys you pass are changed; omitted keys are left alone. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({
				repeat: z.boolean().optional(),
				random: z.boolean().optional(),
				single: z.boolean().optional(),
				consume: z.boolean().optional(),
				profile: mcpProfileNameSchema,
			}),
		},
		async (args) => {
			try {
				const changed = await setPlaybackModesUseCase({
					modes: {
						repeat: args.repeat,
						random: args.random,
						single: args.single,
						consume: args.consume,
					},
					profileName: args.profile,
					mpdClient,
					mpdProfileStateRepository,
				});
				return toolResultText(
					changed.length === 0
						? "no modes changed"
						: changed.map((c) => `${c.mode}=${c.enabled}`).join(", "),
				);
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);
}
