import { computeViewStateBlobToken } from "../functions/computeViewStateBlobToken.js";
import type { ViewStateBlobRepository } from "../repositories/ViewStateBlobRepository.js";

// Operational parameter, not a design decision: blobs unused for this long
// are swept away on startup.
export const VIEW_STATE_BLOB_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

export const saveViewStateBlobUseCase = (
	repository: ViewStateBlobRepository,
	data: string,
): string => {
	const token = computeViewStateBlobToken(data);
	repository.put(token, data);
	return token;
};

export const readViewStateBlobUseCase = (
	repository: ViewStateBlobRepository,
	token: string,
): string | undefined => {
	return repository.get(token)?.data;
};

export const sweepViewStateBlobsUseCase = (
	repository: ViewStateBlobRepository,
	maxAgeMs: number = VIEW_STATE_BLOB_MAX_AGE_MS,
): number => {
	return repository.sweep(maxAgeMs);
};
