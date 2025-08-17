import { clone, toJsonString } from "@bufbuild/protobuf";
import {
	type MpdProfile,
	MpdProfileSchema,
	type MpdProfileState,
	MpdProfileStateSchema,
} from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";
import { useCallback } from "react";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../types/stateTypes";
import { mpdProfileStateRepositoryAtom } from "./mpdProfileStateRepository";

/**
 * Base atom for MPD profile state.
 *
 * Manages multiple profiles and tracks active one.
 */
const mpdProfileStateAtom = atomWithDefault(async (get) => {
	const repository = get(mpdProfileStateRepositoryAtom);
	return repository.fetch();
});

/**
 * Synchronized atom for profile state.
 *
 * Ensures consistent updates across subscribers.
 */
const mpdProfileStateSyncAtom = atomWithSync(mpdProfileStateAtom);

/**
 * Derived atom for current MPD profile.
 *
 * Extracts active profile from state.
 */
export const currentMpdProfileSyncAtom = atom((get) => {
	const profileState = get(mpdProfileStateSyncAtom);
	return profileState?.currentProfile;
});

/**
 * Hook for accessing MPD profile state.
 *
 * Provides read-only access to complete profile state.
 *
 * @returns Current MPD profile state
 */
export function useMpdProfileState() {
	return useAtomValue(mpdProfileStateSyncAtom);
}

/**
 * Hook for accessing current MPD profile.
 *
 * Provides read-only access to active profile.
 *
 * @returns Active profile or undefined
 */
export function useCurrentMpdProfileState() {
	return useAtomValue(currentMpdProfileSyncAtom);
}

/**
 * Hook for refreshing profile state.
 *
 * Triggers fresh fetch from storage.
 *
 * @returns Refresh function
 */
export function useRefreshMpdProfileState() {
	return useResetAtom(mpdProfileStateAtom);
}

/**
 * Hook for updating profile state.
 *
 * Updates state locally and/or persistently.
 *
 * @returns Update function with persistence options
 */
export function useUpdateMpdProfileState() {
	const repository = useAtomValue(mpdProfileStateRepositoryAtom);
	const setMpdProfileState = useSetAtom(mpdProfileStateAtom);

	return useCallback(
		async (newMpdProfileState: MpdProfileState, mode: UpdateMode) => {
			await repository.save(newMpdProfileState);
			if (mode & UpdateMode.LOCAL_STATE) {
				setMpdProfileState(Promise.resolve(newMpdProfileState));
			}
			if (mode & UpdateMode.PERSIST) {
				await repository.save(newMpdProfileState);
			}
		},
		[repository, setMpdProfileState],
	);
}

/**
 * Hook for updating current profile.
 *
 * Changes active profile and persists change.
 *
 * @returns Profile update function
 * @throws When profile not found
 */
export function useUpdateCurrentMpdProfile() {
	const mpdProfileState = useAtomValue(mpdProfileStateAtom);
	const repository = useAtomValue(mpdProfileStateRepositoryAtom);
	const setMpdProfileState = useSetAtom(mpdProfileStateAtom);

	return useCallback(
		async (mpdProfile: MpdProfile, mode: UpdateMode) => {
			if (!mpdProfileState.profiles.includes(mpdProfile)) {
				throw Error(
					`Invalid profile state: ${toJsonString(MpdProfileSchema, mpdProfile)} is not in profiles`,
				);
			}
			const newMpdProfileState = clone(MpdProfileStateSchema, mpdProfileState);
			newMpdProfileState.currentProfile = mpdProfile;
			if (mode & UpdateMode.LOCAL_STATE) {
				setMpdProfileState(Promise.resolve(newMpdProfileState));
			}
			if (mode & UpdateMode.PERSIST) {
				await repository.save(newMpdProfileState);
			}
		},
		[mpdProfileState, repository, setMpdProfileState],
	);
}
