import { API_VIEW_STATE_BLOBS } from "@sola_mpd/shared/src/const/api.js";
import type { HttpClient } from "../../../../lib/http/HttpClient";
import type { ViewStateBlobRepository } from "./ViewStateBlobRepository";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Not wired into DI: messagingClient already absorbs the Socket.IO vs.
// Electron IPC difference, so only ViewStateBlobRepositorySocketIo is injected.
export class ViewStateBlobRepositoryHttp implements ViewStateBlobRepository {
	constructor(private readonly client: HttpClient) {}

	save = async (data: string): Promise<string> => {
		return this.client.put<string>(
			API_VIEW_STATE_BLOBS,
			textEncoder.encode(data),
			(bytes) => textDecoder.decode(bytes),
		);
	};

	// HttpClient.get() throws on any non-2xx response rather than exposing the
	// status code, so this can't distinguish a 404 from a network failure; it
	// always resolves or always throws, never resolves to undefined. Fine here
	// since this adapter isn't wired.
	fetch = async (token: string): Promise<string | undefined> => {
		const body = await this.client.get<{ data: string }>(
			`${API_VIEW_STATE_BLOBS}/${token}`,
			(bytes) => JSON.parse(textDecoder.decode(bytes)) as { data: string },
		);
		return body.data;
	};
}
