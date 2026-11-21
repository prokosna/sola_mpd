import { create, type MessageInitShape } from "@bufbuild/protobuf";
import {
	MpdRequestSchema,
	type MpdResponse,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import type { MpdClient } from "../../mpd/services/MpdClient.js";

export type MpdRequestCommand = MessageInitShape<
	typeof MpdRequestSchema
>["command"];

export class UnexpectedMpdResponseError extends Error {
	constructor(commandName: string) {
		super(`Unexpected response from MPD ${commandName}.`);
		this.name = "UnexpectedMpdResponseError";
	}
}

export async function executeMpdCommand(
	mpdClient: MpdClient,
	profile: MpdProfile,
	command: MpdRequestCommand,
): Promise<MpdResponse> {
	const request = create(MpdRequestSchema, { profile, command });
	return mpdClient.execute(request);
}

export type SequentialMpdCommandsResult = {
	completed: number;
	failure?: { index: number; error: unknown };
};

// Not batchable via executeBulk: callers must report how many commands MPD
// already applied before a failure.
export async function executeMpdCommandsSequentially(
	mpdClient: MpdClient,
	profile: MpdProfile,
	commands: MpdRequestCommand[],
): Promise<SequentialMpdCommandsResult> {
	let completed = 0;
	for (const [index, command] of commands.entries()) {
		try {
			await executeMpdCommand(mpdClient, profile, command);
			completed++;
		} catch (error) {
			return { completed, failure: { index, error } };
		}
	}
	return { completed };
}
