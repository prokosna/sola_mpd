import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { z } from "zod";

import type { ConfigRepository } from "../../configs/repositories/ConfigRepository.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import {
	MpdProfileNotFoundError,
	NoCurrentMpdProfileError,
} from "../application/currentMpdProfile.js";
import { toolError } from "../functions/toolResult.js";
import type { LibraryIndex } from "../services/LibraryIndex.js";

export const mcpProfileNameSchema = z
	.string()
	.optional()
	.describe(
		"Name of the configured MPD profile this call targets. Omit to use the workspace default profile. Call the mpd_profiles tool to list available profile names.",
	);

export type RegisterMcpToolsDeps = {
	mpdClient: MpdClient;
	libraryIndex: LibraryIndex;
	mpdProfileStateRepository: ConfigRepository<MpdProfileState>;
};

export function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}

export function errorToToolResult(err: unknown) {
	if (
		err instanceof NoCurrentMpdProfileError ||
		err instanceof MpdProfileNotFoundError
	) {
		return toolError(err.message);
	}
	return toolError(errorMessage(err));
}
