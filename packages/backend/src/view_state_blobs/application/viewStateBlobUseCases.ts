import { computeViewStateBlobToken } from "../functions/computeViewStateBlobToken.js";
import type { ViewStateBlobRepository } from "../repositories/ViewStateBlobRepository.js";
import { viewStateBlobRepository } from "../repositories/ViewStateBlobRepositoryFile.js";

// Operational parameter, not a design decision (docs/design/state-scoping.md
// §6.2): blobs unused for this long are swept away on startup.
export const VIEW_STATE_BLOB_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

export const createSaveViewStateBlobUseCase = (
	repository: ViewStateBlobRepository,
) => {
	return (data: string): string => {
		const token = computeViewStateBlobToken(data);
		repository.put(token, data);
		return token;
	};
};

export const createReadViewStateBlobUseCase = (
	repository: ViewStateBlobRepository,
) => {
	return (token: string): string | undefined => {
		return repository.get(token)?.data;
	};
};

export const createSweepViewStateBlobsUseCase = (
	repository: ViewStateBlobRepository,
) => {
	return (maxAgeMs: number = VIEW_STATE_BLOB_MAX_AGE_MS): number => {
		return repository.sweep(maxAgeMs);
	};
};

export const saveViewStateBlobUseCase = createSaveViewStateBlobUseCase(
	viewStateBlobRepository,
);
export const readViewStateBlobUseCase = createReadViewStateBlobUseCase(
	viewStateBlobRepository,
);
export const sweepViewStateBlobsUseCase = createSweepViewStateBlobsUseCase(
	viewStateBlobRepository,
);
