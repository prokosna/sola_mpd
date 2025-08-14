import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { compareVersions } from "compare-versions";
import { useCallback } from "react";

import { useMpdClientState } from "../../mpd";
import { useMpdProfileState } from "../states/mpdProfileState";
import type { ProfileInput } from "../types/profileTypes";
import type { ValidationResult } from "../types/validationTypes";
import { createValidationResult } from "../utils/validationUtils";

/**
 * Hook for validating MPD profile inputs.
 *
 * @returns Profile validation function
 */
export function useValidateMpdProfile() {
	const mpdClient = useMpdClientState();
	const mpdProfileState = useMpdProfileState();

	return useCallback(
		async (input: ProfileInput): Promise<ValidationResult> => {
			if (mpdClient === undefined) {
				return createValidationResult(
					false,
					"MpdClient is not ready. Please make sure the background app is running.",
				);
			}

			if (
				mpdProfileState?.profiles
					.map((profile) => profile.name)
					.includes(input.name)
			) {
				return createValidationResult(false, `${input.name} is already used.`);
			}

			if (input.host === "") {
				return createValidationResult(false, "Host is required.");
			}

			try {
				const res = await mpdClient.command(
					new MpdRequest({
						profile: new MpdProfile({
							name: input.name,
							host: input.host,
							port: input.port,
						}),
						command: {
							case: "ping",
							value: {},
						},
					}),
				);

				if (res.command.case !== "ping") {
					return createValidationResult(false, `Invalid MPD response: ${res}`);
				}

				const version = res.command.value.version;
				if (compareVersions(version, "0.21") < 0) {
					return createValidationResult(
						false,
						`MPD version is ${version}: Please use 0.21 or later.`,
					);
				}

				return createValidationResult(true);
			} catch (err) {
				return createValidationResult(false, String(err));
			}
		},
		[mpdClient, mpdProfileState?.profiles],
	);
}
