import { useAtomValue } from "jotai";
import { useCallback } from "react";

import { mpdClientAtom } from "../../mpd";
import { validateMpdProfile } from "../functions/profileValidation";
import { mpdProfileStateAtom } from "../states/atoms/mpdProfileAtom";
import type { ProfileInput } from "../types/profileTypes";
import type { ValidationResult } from "../types/validationTypes";

export function useValidateMpdProfile() {
	const mpdClient = useAtomValue(mpdClientAtom);
	const mpdProfileState = useAtomValue(mpdProfileStateAtom);

	return useCallback(
		async (input: ProfileInput): Promise<ValidationResult> => {
			const existingNames =
				mpdProfileState?.profiles.map((profile) => profile.name) ?? [];
			return validateMpdProfile(mpdClient, existingNames, input);
		},
		[mpdClient, mpdProfileState?.profiles],
	);
}
