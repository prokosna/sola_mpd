import { create } from "@bufbuild/protobuf";
import { MantineProvider } from "@mantine/core";
import {
	PluginInfoSchema,
	PluginSchema,
	PluginStateSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getDefaultStore } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { showNotification } from "../../../lib/mantine/showNotification";
import { pluginAsyncAtom } from "../states/atoms/pluginAtom";
import { pluginStateRepositoryAtom } from "../states/atoms/pluginStateRepositoryAtom";

import { PluginAddModalRegister } from "./PluginAddModalRegister";

vi.mock("../../../lib/mantine/showNotification", () => ({
	showNotification: vi.fn(),
}));

function setup(save: () => Promise<void>) {
	const store = getDefaultStore();
	store.set(pluginStateRepositoryAtom, { fetch: vi.fn(), save });
	store.set(pluginAsyncAtom, create(PluginStateSchema, {}));
	const pluginToAdd = create(PluginSchema, {
		host: "localhost",
		port: 1234,
		info: create(PluginInfoSchema, {
			name: "p",
			requiredPluginParameters: ["token"],
		}),
	});
	const handleModalClosed = vi.fn();
	render(
		<MantineProvider>
			<PluginAddModalRegister
				pluginToAdd={pluginToAdd}
				handleModalClosed={handleModalClosed}
			/>
		</MantineProvider>,
	);
	fireEvent.change(screen.getByLabelText("token"), {
		target: { value: "secret" },
	});
	fireEvent.click(screen.getByText("Add"));
	return { pluginToAdd, handleModalClosed };
}

describe("PluginAddModalRegister", () => {
	beforeEach(() => {
		vi.mocked(showNotification).mockClear();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("keeps the modal open and the prop untouched when the save fails", async () => {
		const save = vi.fn(async () => Promise.reject(new Error("boom")));
		const { pluginToAdd, handleModalClosed } = setup(save);

		await waitFor(() =>
			expect(showNotification).toHaveBeenCalledWith(
				expect.objectContaining({ status: "error" }),
			),
		);

		expect(showNotification).toHaveBeenCalledTimes(1);
		expect(handleModalClosed).not.toHaveBeenCalled();
		expect(pluginToAdd.pluginParameters).toEqual({});
	});

	it("closes the modal and notifies when the save succeeds", async () => {
		const save = vi.fn(async () => {});
		const { pluginToAdd, handleModalClosed } = setup(save);

		await waitFor(() => expect(handleModalClosed).toHaveBeenCalled());

		expect(showNotification).toHaveBeenCalledWith(
			expect.objectContaining({ status: "success" }),
		);
		expect(pluginToAdd.pluginParameters).toEqual({});
	});
});
