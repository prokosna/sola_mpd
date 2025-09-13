import { useAtomValue } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { useCallback } from "react";
import type { AdvancedSearchClient } from "../services/AdvancedSearchClient";
import {
	analyze,
	scanLibrary,
	vacuumLibrary,
} from "../utils/advancedSearchUtils";
import { advancedSearchEndpointAtom } from "./advancedSearchState";

/**
 * Provides access to the shared advanced search client instance.
 *
 * Must be initialized by a provider component with proper configuration.
 * Used across the application for consistent advanced search communication.
 *
 * @throws Error if accessed before initialization
 */
export const advancedSearchClientAtom = atomWithDefault<AdvancedSearchClient>(
	() => {
		throw new Error("Not initialized. Should be setup DI in the provider.");
	},
);

/**
 * Hook for accessing the advanced search client instance.
 *
 * @returns The current advanced search client instance
 * @throws Error if client not initialized
 */
export function useAdvancedSearchClientState() {
	return useAtomValue(advancedSearchClientAtom);
}

/**
 * Hook for scanning the library.
 *
 * @returns A function that scans the library
 */
export function useScanLibrary() {
	const client = useAtomValue(advancedSearchClientAtom);
	const endpoint = useAtomValue(advancedSearchEndpointAtom);
	return useCallback(() => {
		if (endpoint === undefined) {
			return;
		}
		scanLibrary(client, endpoint);
	}, [client, endpoint]);
}

/**
 * Hook for vacuuming the library.
 *
 * @returns A function that vacuums the library
 */
export function useVacuumLibrary() {
	const client = useAtomValue(advancedSearchClientAtom);
	const endpoint = useAtomValue(advancedSearchEndpointAtom);
	return useCallback(() => {
		if (endpoint === undefined) {
			return;
		}
		vacuumLibrary(client, endpoint);
	}, [client, endpoint]);
}

/**
 * Hook for analyzing the library.
 *
 * @returns A function that analyzes the library
 */
export function useAnalyze() {
	const client = useAtomValue(advancedSearchClientAtom);
	const endpoint = useAtomValue(advancedSearchEndpointAtom);
	return useCallback(() => {
		if (endpoint === undefined) {
			return;
		}
		analyze(client, endpoint);
	}, [client, endpoint]);
}
