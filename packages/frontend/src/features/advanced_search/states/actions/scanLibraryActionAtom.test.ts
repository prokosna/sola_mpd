import { createStore, type WritableAtom } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { showNotification } from "../../../../lib/mantine/showNotification";
import type { AdvancedSearchClient } from "../../services/AdvancedSearchClient";
import { advancedSearchEndpointAtom } from "../atoms/advancedSearchAtom";
import { advancedSearchClientAtom } from "../atoms/advancedSearchClientAtom";
import { scanLibraryActionAtom } from "./scanLibraryActionAtom";

vi.mock("../../../../lib/mantine/showNotification", () => ({
	showNotification: vi.fn(),
}));

// The endpoint atom is typed read-only because its initial value comes from import.meta.env.
const endpointAtom = advancedSearchEndpointAtom as unknown as WritableAtom<
	string | undefined,
	[string | undefined],
	void
>;

describe("scanLibraryActionAtom", () => {
	const command = vi.fn();

	function setup(endpoint?: string) {
		const store = createStore();
		store.set(advancedSearchClientAtom, {
			command,
		} as unknown as AdvancedSearchClient);
		store.set(endpointAtom, endpoint);
		return store;
	}

	beforeEach(() => {
		command.mockReset();
		vi.mocked(showNotification).mockClear();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("notifies success once the request is accepted", async () => {
		command.mockResolvedValue({});
		const store = setup("http://localhost:1234");

		await store.set(scanLibraryActionAtom);

		expect(command).toHaveBeenCalledOnce();
		expect(showNotification).toHaveBeenCalledWith({
			title: "Library scan started",
			status: "success",
		});
	});

	it("notifies an error when the request fails", async () => {
		command.mockRejectedValue(new Error("boom"));
		const store = setup("http://localhost:1234");

		await store.set(scanLibraryActionAtom);

		expect(showNotification).toHaveBeenCalledWith({
			title: "Could not start library scan",
			description: "boom",
			status: "error",
		});
	});

	it("does nothing without an endpoint", async () => {
		const store = setup(undefined);

		await store.set(scanLibraryActionAtom);

		expect(command).not.toHaveBeenCalled();
		expect(showNotification).not.toHaveBeenCalled();
	});
});
