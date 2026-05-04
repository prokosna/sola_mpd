import { create } from "@bufbuild/protobuf";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import { isMpdVersionAtLeast, type MpdClient } from "../../mpd";
import type { ProfileInput } from "../types/profileTypes";
import type { ValidationResult } from "../types/validationTypes";

export function createValidationResult(
	isValid: boolean,
	message?: string,
): ValidationResult {
	return { isValid, message };
}

export async function validateMpdProfile(
	mpdClient: MpdClient | undefined,
	existingProfileNames: string[],
	input: ProfileInput,
): Promise<ValidationResult> {
	if (mpdClient === undefined) {
		return createValidationResult(
			false,
			"MpdClient is not ready. Please make sure the background app is running.",
		);
	}

	if (existingProfileNames.includes(input.name)) {
		return createValidationResult(false, `${input.name} is already used.`);
	}

	if (input.host === "") {
		return createValidationResult(false, "Host is required.");
	}

	try {
		const res = await mpdClient.command(
			create(MpdRequestSchema, {
				profile: create(MpdProfileSchema, {
					name: input.name,
					host: input.host,
					port: input.port,
					password: input.password ?? "",
				}),
				command: {
					case: "ping",
					value: {},
				},
			}),
		);

		if (res.command.case !== "ping") {
			return createValidationResult(
				false,
				`Invalid MPD response: expected ping, got ${res.command.case ?? "undefined"}`,
			);
		}

		const version = res.command.value.version;
		if (!isMpdVersionAtLeast(version, "0.21")) {
			return createValidationResult(
				false,
				`MPD version is ${version}: Please use 0.21 or later.`,
			);
		}

		return createValidationResult(true);
	} catch (err) {
		return createValidationResult(false, String(err));
	}
}
