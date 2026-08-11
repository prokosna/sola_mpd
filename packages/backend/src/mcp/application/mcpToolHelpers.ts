import { create, type MessageInitShape } from "@bufbuild/protobuf";
import {
	MpdRequestSchema,
	type MpdResponse,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { z } from "zod";

import type { MpdClient } from "../../mpd/services/MpdClient.js";
import { toolError } from "../functions/toolResult.js";
import type { LibraryIndex } from "../services/LibraryIndex.js";
import {
	MpdProfileNotFoundError,
	NoCurrentMpdProfileError,
} from "./currentMpdProfile.js";

export const mcpProfileNameSchema = z
	.string()
	.optional()
	.describe(
		"Name of the configured MPD profile this call targets. Omit to use the workspace default profile. Call the mpd_profiles tool to list available profile names.",
	);

export type MpdRequestCommand = MessageInitShape<
	typeof MpdRequestSchema
>["command"];

export type RegisterMcpToolsDeps = {
	mpdClient: MpdClient;
	libraryIndex: LibraryIndex;
};

export async function executeMpdCommand(
	mpdClient: MpdClient,
	profile: MpdProfile,
	command: MpdRequestCommand,
): Promise<MpdResponse> {
	const request = create(MpdRequestSchema, { profile, command });
	return mpdClient.execute(request);
}

export function errorToToolResult(err: unknown) {
	if (
		err instanceof NoCurrentMpdProfileError ||
		err instanceof MpdProfileNotFoundError
	) {
		return toolError(err.message);
	}
	const message = err instanceof Error ? err.message : String(err);
	return toolError(message);
}
