import { create } from "@bufbuild/protobuf";
import {
	PluginSchema,
	PluginStateSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { act, renderHook } from "@testing-library/react";
import { getDefaultStore } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { showNotification } from "../../../lib/mantine/showNotification";
import type { PluginStateRepository } from "../repositories/PluginStateRepository";
import { pluginAsyncAtom } from "../states/atoms/pluginAtom";
import { pluginStateRepositoryAtom } from "../states/atoms/pluginStateRepositoryAtom";

import { useHandlePluginRemoved } from "./useHandlePluginRemoved";

vi.mock("../../../lib/mantine/showNotification", () => ({
	showNotification: vi.fn(),
}));

const plugin = create(PluginSchema, { host: "localhost", port: 1234 });

async function removePlugin(save: PluginStateRepository["save"]) {
	const store = getDefaultStore();
	store.set(pluginStateRepositoryAtom, { fetch: vi.fn(), save });
	store.set(pluginAsyncAtom, create(PluginStateSchema, { plugins: [plugin] }));
	const { result } = renderHook(() => useHandlePluginRemoved(plugin));
	await act(async () => {
		await result.current();
	});
}

describe("useHandlePluginRemoved", () => {
	beforeEach(() => {
		vi.mocked(showNotification).mockClear();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("shows only the error notification when the save fails", async () => {
		await removePlugin(vi.fn(async () => Promise.reject(new Error("boom"))));

		expect(showNotification).toHaveBeenCalledTimes(1);
		expect(showNotification).toHaveBeenCalledWith(
			expect.objectContaining({ status: "error" }),
		);
	});

	it("shows the success notification when the save succeeds", async () => {
		await removePlugin(vi.fn(async () => {}));

		expect(showNotification).toHaveBeenCalledWith(
			expect.objectContaining({ status: "success" }),
		);
	});
});
