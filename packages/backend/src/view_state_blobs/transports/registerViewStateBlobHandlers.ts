import {
	SOCKETIO_VIEW_STATE_BLOB_FETCH,
	SOCKETIO_VIEW_STATE_BLOB_SAVE,
} from "@sola_mpd/shared/src/const/socketio.js";
import type { MessagingServer } from "../../lib/messaging/MessagingServer.js";
import {
	readViewStateBlobUseCase,
	saveViewStateBlobUseCase,
} from "../application/viewStateBlobUseCases.js";
import type { ViewStateBlobRepository } from "../repositories/ViewStateBlobRepository.js";

export function registerViewStateBlobHandlers(
	server: MessagingServer,
	deps: { viewStateBlobRepository: ViewStateBlobRepository },
): void {
	const { viewStateBlobRepository } = deps;

	// Payload is the blob text, response is the token text.
	server.handle(SOCKETIO_VIEW_STATE_BLOB_SAVE, (msg) => {
		const data = Buffer.from(msg).toString("utf-8");
		const token = saveViewStateBlobUseCase(viewStateBlobRepository, data);
		return Buffer.from(token, "utf-8");
	});

	// Payload is the token text, response is the blob text, or an empty buffer
	// when the token is unknown (blob tokens always resolve to non-empty text,
	// so this is unambiguous).
	server.handle(SOCKETIO_VIEW_STATE_BLOB_FETCH, (msg) => {
		const token = Buffer.from(msg).toString("utf-8");
		const data = readViewStateBlobUseCase(viewStateBlobRepository, token);
		return data === undefined ? new Uint8Array(0) : Buffer.from(data, "utf-8");
	});
}
