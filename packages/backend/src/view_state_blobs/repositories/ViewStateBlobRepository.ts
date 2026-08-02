export interface ViewStateBlobEntry {
	data: string;
	createdAt: number;
	lastAccessedAt: number;
}

export interface ViewStateBlobRepository {
	// Refreshes lastAccessedAt as a side effect; that timestamp is what sweep()
	// uses to decide what is stale.
	get: (token: string) => ViewStateBlobEntry | undefined;
	// Idempotent upsert: a token that already exists is left untouched.
	put: (token: string, data: string) => void;
	// Deletes entries whose lastAccessedAt is older than (now - maxAgeMs) and
	// returns how many were removed.
	sweep: (maxAgeMs: number) => number;
}
