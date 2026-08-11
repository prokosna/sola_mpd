import {
	SOCKETIO_VIEW_STATE_BLOB_FETCH,
	SOCKETIO_VIEW_STATE_BLOB_SAVE,
} from "@sola_mpd/shared/src/const/socketio.js";
import type { MessagingClient } from "../../../../lib/messaging/MessagingClient";
import type { ViewStateBlobRepository } from "./ViewStateBlobRepository";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// An empty response payload is the fetch-side sentinel for "token not found"
// (mirrors the backend's SocketIoManager/ipc convention). Blob tokens always
// resolve to non-empty text, so this is unambiguous in practice.
export class ViewStateBlobRepositorySocketIo
	implements ViewStateBlobRepository
{
	constructor(private readonly client: MessagingClient) {}

	save = async (data: string): Promise<string> => {
		return this.client.fetch<string>(
			SOCKETIO_VIEW_STATE_BLOB_SAVE,
			textEncoder.encode(data),
			(bytes) => textDecoder.decode(bytes),
		);
	};

	fetch = async (token: string): Promise<string | undefined> => {
		const data = await this.client.fetch<string>(
			SOCKETIO_VIEW_STATE_BLOB_FETCH,
			textEncoder.encode(token),
			(bytes) => textDecoder.decode(bytes),
		);
		return data.length === 0 ? undefined : data;
	};
}
