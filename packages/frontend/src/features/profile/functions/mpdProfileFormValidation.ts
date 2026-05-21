import type { ProfileInput } from "../types/profileTypes";

const DEFAULT_MPD_PORT = 6600;

export type MpdProfileFormValues = {
	name: string;
	host: string;
	port: number | undefined;
	password: string;
};

export function validateProfileName(
	name: string,
	existingProfileNames: readonly string[],
): string | undefined {
	if (name === "") {
		return "Name is required";
	}
	if (existingProfileNames.includes(name)) {
		return "Name already exists";
	}
	return undefined;
}

export function buildProfileInputFromForm(
	values: MpdProfileFormValues,
): ProfileInput {
	return {
		name: values.name,
		host: values.host,
		port: values.port ?? DEFAULT_MPD_PORT,
		password: values.password === "" ? undefined : values.password,
	};
}
