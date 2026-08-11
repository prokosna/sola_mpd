import { render, waitFor } from "@testing-library/react";
import { atom, createStore } from "jotai";
import { Provider } from "jotai/react";
import { StrictMode } from "react";
import { MemoryRouter, useNavigate, useSearchParams } from "react-router";
import { describe, expect, it } from "vitest";

import { BrowsingSelectionObserver } from "./BrowsingSelectionObserver";

const SELECTION_QUERY_PARAM = "bsel";

function BackButton() {
	const navigate = useNavigate();
	return (
		<button type="button" onClick={() => navigate(-1)}>
			back
		</button>
	);
}

/** Stands in for the filter panels: writes a selection into the URL. */
function SelectionWriter({ value }: { value: string }) {
	const [, setSearchParams] = useSearchParams();
	return (
		<button
			type="button"
			onClick={() => setSearchParams({ [SELECTION_QUERY_PARAM]: value })}
		>
			write
		</button>
	);
}

describe("BrowsingSelectionObserver", () => {
	// Back and Forward change nothing but the query, so that alone has to
	// re-resolve the position.
	it("re-resolves whenever the query changes, including on Back", async () => {
		const searches: string[] = [];
		const restoreSelectionActionAtom = atom(
			null,
			async (_get, _set, search: string) => {
				searches.push(search);
			},
		);

		const { getByText } = render(
			<StrictMode>
				<Provider store={createStore()}>
					<MemoryRouter initialEntries={["/browser"]}>
						<BrowsingSelectionObserver
							restoreSelectionActionAtom={restoreSelectionActionAtom}
						/>
						<SelectionWriter value="Rock" />
						<BackButton />
					</MemoryRouter>
				</Provider>
			</StrictMode>,
		);

		await waitFor(() => expect(searches).toContain(""));

		getByText("write").click();
		await waitFor(() =>
			expect(searches.some((s) => s.includes("Rock"))).toBe(true),
		);

		getByText("back").click();
		await waitFor(() => expect(searches[searches.length - 1]).toBe(""));
	});
});
