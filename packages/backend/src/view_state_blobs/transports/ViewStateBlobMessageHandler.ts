export interface ViewStateBlobMessageHandler {
	save: (data: string) => string;
	// undefined when the token is unknown.
	fetch: (token: string) => string | undefined;
}
