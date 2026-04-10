import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { validateMpdProfile } from "../../functions/profileValidation";
import type { ProfileInput } from "../../types/profileTypes";
import type { ValidationResult } from "../../types/validationTypes";
import { mpdProfileStateAtom } from "../atoms/mpdProfileAtom";

export const validateMpdProfileActionAtom = atom(
	null,
	async (get, _set, input: ProfileInput): Promise<ValidationResult> => {
		const mpdClient = get(mpdClientAtom);
		const mpdProfileState = get(mpdProfileStateAtom);
		const existingNames =
			mpdProfileState?.profiles.map((profile) => profile.name) ?? [];
		return validateMpdProfile(mpdClient, existingNames, input);
	},
);
