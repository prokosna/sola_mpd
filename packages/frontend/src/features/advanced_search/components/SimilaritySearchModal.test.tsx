import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { atom, createStore } from "jotai";
import { Provider } from "jotai/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { isSimilaritySearchModalOpenAtom } from "../states/atoms/similaritySearchUiAtom";

import { SimilaritySearchModal } from "./SimilaritySearchModal";

vi.mock("../../loading", () => ({
	CenterSpinner: () => <div data-testid="spinner" />,
}));
vi.mock("../../playlist", () => ({
	PlaylistSelectModal: () => undefined,
	usePlaylistSelectModal: () => ({
		songsToAddToPlaylistRef: { current: [] },
		setIsPlaylistSelectModalOpen: vi.fn(),
		playlistSelectModalProps: {},
	}),
}));
vi.mock("../../song_table", () => ({
	ColumnEditModal: () => undefined,
	SongTable: () => <div data-testid="song-table" />,
	songTableServerStateAtom: atom(undefined),
	updateSongTableColumnTagsActionAtom: atom(null, () => {}),
	useColumnEditModalProps: () => undefined,
}));
vi.mock("../states/atoms/similaritySearchAtom", () => ({
	similaritySearchSongsAtom: atom(undefined),
}));
vi.mock("../hooks/useSimilaritySearchSongTableProps", () => ({
	useSimilaritySearchSongTableProps: () => undefined,
}));

function renderModal(isOpen: boolean) {
	const store = createStore();
	store.set(isSimilaritySearchModalOpenAtom, isOpen);
	render(
		<MantineProvider>
			<Provider store={store}>
				<SimilaritySearchModal />
			</Provider>
		</MantineProvider>,
	);
}

describe("SimilaritySearchModal while its props are still loading", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("renders no spinner when the modal is closed", () => {
		renderModal(false);

		expect(screen.queryByTestId("spinner")).toBeNull();
	});

	it("renders the spinner inside the modal when it is open", () => {
		renderModal(true);

		expect(
			screen.getByRole("dialog").contains(screen.getByTestId("spinner")),
		).toBe(true);
	});
});
