import {
	SOCKETIO_VIEW_STATE_BLOB_FETCH,
	SOCKETIO_VIEW_STATE_BLOB_SAVE,
} from "@sola_mpd/shared/src/const/socketio.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeMessagingServer } from "../../lib/messaging/fakeMessagingServer.js";
import type { ViewStateBlobRepository } from "../repositories/ViewStateBlobRepository.js";
import { registerViewStateBlobHandlers } from "./registerViewStateBlobHandlers.js";

const utf8 = (text: string) => new Uint8Array(Buffer.from(text, "utf-8"));
const text = (bytes: unknown) =>
	Buffer.from(bytes as Uint8Array).toString("utf-8");

describe("registerViewStateBlobHandlers", () => {
	const repository = { get: vi.fn(), put: vi.fn(), sweep: vi.fn() };
	let fake: ReturnType<typeof createFakeMessagingServer>;

	beforeEach(() => {
		vi.resetAllMocks();
		fake = createFakeMessagingServer();
		registerViewStateBlobHandlers(fake.server, {
			viewStateBlobRepository: repository as unknown as ViewStateBlobRepository,
		});
	});

	it("saves blob text and returns its token", async () => {
		const token = text(
			await fake.call(SOCKETIO_VIEW_STATE_BLOB_SAVE, utf8("body")),
		);

		expect(repository.put).toHaveBeenCalledWith(token, "body");
		expect(token).not.toBe("");
	});

	it("returns the blob text for a known token", async () => {
		repository.get.mockReturnValue({ data: "body" });

		const result = await fake.call(SOCKETIO_VIEW_STATE_BLOB_FETCH, utf8("tok"));

		expect(repository.get).toHaveBeenCalledWith("tok");
		expect(text(result)).toBe("body");
	});

	it("returns an empty payload for an unknown token", async () => {
		repository.get.mockReturnValue(undefined);

		const result = await fake.call(
			SOCKETIO_VIEW_STATE_BLOB_FETCH,
			utf8("nope"),
		);

		expect((result as Uint8Array).length).toBe(0);
	});

	it("lets repository failures reject", async () => {
		repository.put.mockImplementation(() => {
			throw new Error("disk full");
		});

		await expect(
			fake.call(SOCKETIO_VIEW_STATE_BLOB_SAVE, utf8("body")),
		).rejects.toThrow("disk full");
	});
});
