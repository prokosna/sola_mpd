export interface ViewStateBlobRepository {
	// Returns the content-derived token. Saving is idempotent: the same data
	// always yields the same token.
	save: (data: string) => Promise<string>;
	// undefined when the token is unknown.
	fetch: (token: string) => Promise<string | undefined>;
}
