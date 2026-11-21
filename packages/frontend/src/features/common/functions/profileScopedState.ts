export type ProfileScopedState<T> = {
	profileName: string;
	state: T;
};

export function selectProfileScopedState<T>(
	stored: ProfileScopedState<T> | undefined,
	currentProfileName: string | undefined,
	initialState: T,
): T {
	if (
		stored === undefined ||
		currentProfileName === undefined ||
		stored.profileName !== currentProfileName
	) {
		return initialState;
	}
	return stored.state;
}
