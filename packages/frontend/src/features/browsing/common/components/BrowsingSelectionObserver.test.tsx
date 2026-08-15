import { render, waitFor } from "@testing-library/react";
import { atom, createStore, type WritableAtom } from "jotai";
import { Provider } from "jotai/react";
import { StrictMode } from "react";
import {
	MemoryRouter,
	useLocation,
	useNavigate,
	useSearchParams,
} from "react-router";
import { describe, expect, it } from "vitest";

import type { SelectionQueryParam } from "../types/browserSelection";

import { BrowsingSelectionObserver } from "./BrowsingSelectionObserver";

const SELECTION_QUERY_PARAM = "bsel";

/**
 * A plain in-memory stand-in for a device-backed remembered-selection atom.
 * `writes`, if given, records every value passed to the setter in order, so a
 * test can assert on the write sequence rather than only the settled value.
 */
function createTestRememberedSelectionAtom(
	initial: SelectionQueryParam | undefined,
	writes?: (SelectionQueryParam | undefined)[],
): WritableAtom<
	SelectionQueryParam | undefined,
	[SelectionQueryParam | undefined],
	void
> {
	const base = atom(initial);
	return atom(
		(get) => get(base),
		(_get, set, value: SelectionQueryParam | undefined) => {
			writes?.push(value);
			set(base, value);
		},
	);
}

function createRecordingRestoreSelectionActionAtom(searches: string[]) {
	return atom(null, async (_get, _set, search: string) => {
		searches.push(search);
	});
}

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

/** Stands in for navigating to a bare URL, e.g. via breadcrumbs. */
function ClearButton() {
	const [, setSearchParams] = useSearchParams();
	return (
		<button type="button" onClick={() => setSearchParams({})}>
			clear
		</button>
	);
}

function LocationDisplay() {
	const location = useLocation();
	return (
		<div data-testid="location">{location.pathname + location.search}</div>
	);
}

describe("BrowsingSelectionObserver", () => {
	// Back and Forward change nothing but the query, so that alone has to
	// re-resolve the position.
	it("re-resolves whenever the query changes, including on Back", async () => {
		const searches: string[] = [];
		const restoreSelectionActionAtom =
			createRecordingRestoreSelectionActionAtom(searches);
		const rememberedSelectionAtom =
			createTestRememberedSelectionAtom(undefined);

		const { getByText } = render(
			<StrictMode>
				<Provider store={createStore()}>
					<MemoryRouter initialEntries={["/browser"]}>
						<BrowsingSelectionObserver
							selectionQueryParam={SELECTION_QUERY_PARAM}
							rememberedSelectionAtom={rememberedSelectionAtom}
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

	it("hydrates a bare URL from memory by replacing history, without ever writing undefined mid-flight", async () => {
		const searches: string[] = [];
		const restoreSelectionActionAtom =
			createRecordingRestoreSelectionActionAtom(searches);
		const remembered: SelectionQueryParam = {
			key: SELECTION_QUERY_PARAM,
			value: "Jazz",
		};
		const writes: (SelectionQueryParam | undefined)[] = [];
		const rememberedSelectionAtom = createTestRememberedSelectionAtom(
			remembered,
			writes,
		);
		const store = createStore();

		const { getByTestId, getByText } = render(
			<StrictMode>
				<Provider store={store}>
					<MemoryRouter
						initialEntries={["/other", "/browser"]}
						initialIndex={1}
					>
						<BrowsingSelectionObserver
							selectionQueryParam={SELECTION_QUERY_PARAM}
							rememberedSelectionAtom={rememberedSelectionAtom}
							restoreSelectionActionAtom={restoreSelectionActionAtom}
						/>
						<LocationDisplay />
						<BackButton />
					</MemoryRouter>
				</Provider>
			</StrictMode>,
		);

		// The URL lands in the render commit, but the effect that records the
		// memory and re-resolves runs after it, so wait for that too before
		// asserting on either.
		await waitFor(() =>
			expect(getByTestId("location").textContent).toBe("/browser?bsel=Jazz"),
		);
		await waitFor(() =>
			expect(searches.some((s) => s.includes("Jazz"))).toBe(true),
		);
		expect(store.get(rememberedSelectionAtom)).toEqual(remembered);

		// StrictMode's synchronous double-invoke of the hydrating run must not
		// slip an `undefined` write in before the replace lands.
		expect(writes.some((w) => w === undefined)).toBe(false);

		// A pushed bare entry would need a second Back click to leave /browser;
		// replace: true means one click exits it.
		getByText("back").click();
		await waitFor(() =>
			expect(getByTestId("location").textContent).toBe("/other"),
		);
	});

	it("restores a ?vs= token from memory verbatim instead of re-minting it", async () => {
		const searches: string[] = [];
		const restoreSelectionActionAtom =
			createRecordingRestoreSelectionActionAtom(searches);
		const remembered: SelectionQueryParam = { key: "vs", value: "tok123" };
		const rememberedSelectionAtom =
			createTestRememberedSelectionAtom(remembered);

		const { getByTestId } = render(
			<StrictMode>
				<Provider store={createStore()}>
					<MemoryRouter initialEntries={["/browser"]}>
						<BrowsingSelectionObserver
							selectionQueryParam={SELECTION_QUERY_PARAM}
							rememberedSelectionAtom={rememberedSelectionAtom}
							restoreSelectionActionAtom={restoreSelectionActionAtom}
						/>
						<LocationDisplay />
					</MemoryRouter>
				</Provider>
			</StrictMode>,
		);

		await waitFor(() =>
			expect(getByTestId("location").textContent).toBe("/browser?vs=tok123"),
		);
	});

	it("does not hydrate when the URL already carries a selection, and updates memory to match", async () => {
		const searches: string[] = [];
		const restoreSelectionActionAtom =
			createRecordingRestoreSelectionActionAtom(searches);
		const rememberedSelectionAtom = createTestRememberedSelectionAtom({
			key: SELECTION_QUERY_PARAM,
			value: "Stale",
		});
		const store = createStore();

		const { getByTestId } = render(
			<StrictMode>
				<Provider store={store}>
					<MemoryRouter initialEntries={["/browser?bsel=Rock"]}>
						<BrowsingSelectionObserver
							selectionQueryParam={SELECTION_QUERY_PARAM}
							rememberedSelectionAtom={rememberedSelectionAtom}
							restoreSelectionActionAtom={restoreSelectionActionAtom}
						/>
						<LocationDisplay />
					</MemoryRouter>
				</Provider>
			</StrictMode>,
		);

		await waitFor(() =>
			expect(store.get(rememberedSelectionAtom)).toEqual({
				key: SELECTION_QUERY_PARAM,
				value: "Rock",
			}),
		);
		expect(getByTestId("location").textContent).toBe("/browser?bsel=Rock");
	});

	it("does not hydrate a bare URL on a later change in the same mount, and clears memory", async () => {
		const searches: string[] = [];
		const restoreSelectionActionAtom =
			createRecordingRestoreSelectionActionAtom(searches);
		const remembered: SelectionQueryParam = {
			key: SELECTION_QUERY_PARAM,
			value: "Jazz",
		};
		const rememberedSelectionAtom =
			createTestRememberedSelectionAtom(remembered);
		const store = createStore();

		const { getByTestId, getByText } = render(
			<StrictMode>
				<Provider store={store}>
					<MemoryRouter initialEntries={["/browser?bsel=Rock"]}>
						<BrowsingSelectionObserver
							selectionQueryParam={SELECTION_QUERY_PARAM}
							rememberedSelectionAtom={rememberedSelectionAtom}
							restoreSelectionActionAtom={restoreSelectionActionAtom}
						/>
						<LocationDisplay />
						<ClearButton />
					</MemoryRouter>
				</Provider>
			</StrictMode>,
		);

		// First run takes the non-hydrating branch (URL already carries a
		// selection), which is what sets hydratedRef for the rest of the mount.
		await waitFor(() =>
			expect(getByTestId("location").textContent).toBe("/browser?bsel=Rock"),
		);

		getByText("clear").click();

		await waitFor(() =>
			expect(getByTestId("location").textContent).toBe("/browser"),
		);
		await waitFor(() =>
			expect(store.get(rememberedSelectionAtom)).toBe(undefined),
		);
	});

	// This is the Back button's safety net: once the user has deliberately
	// backed into a bare URL and left, re-entering must not resurrect the
	// selection they backed out of.
	it("does not resurrect a cleared selection when the page is entered again", async () => {
		const searches: string[] = [];
		const restoreSelectionActionAtom =
			createRecordingRestoreSelectionActionAtom(searches);
		const rememberedSelectionAtom = createTestRememberedSelectionAtom({
			key: SELECTION_QUERY_PARAM,
			value: "Jazz",
		});
		const store = createStore();

		const first = render(
			<StrictMode>
				<Provider store={store}>
					<MemoryRouter initialEntries={["/browser?bsel=Rock"]}>
						<BrowsingSelectionObserver
							selectionQueryParam={SELECTION_QUERY_PARAM}
							rememberedSelectionAtom={rememberedSelectionAtom}
							restoreSelectionActionAtom={restoreSelectionActionAtom}
						/>
						<LocationDisplay />
						<ClearButton />
					</MemoryRouter>
				</Provider>
			</StrictMode>,
		);

		await waitFor(() =>
			expect(first.getByTestId("location").textContent).toBe(
				"/browser?bsel=Rock",
			),
		);

		first.getByText("clear").click();
		await waitFor(() =>
			expect(store.get(rememberedSelectionAtom)).toBe(undefined),
		);

		first.unmount();

		const second = render(
			<StrictMode>
				<Provider store={store}>
					<MemoryRouter initialEntries={["/browser"]}>
						<BrowsingSelectionObserver
							selectionQueryParam={SELECTION_QUERY_PARAM}
							rememberedSelectionAtom={rememberedSelectionAtom}
							restoreSelectionActionAtom={restoreSelectionActionAtom}
						/>
						<LocationDisplay />
					</MemoryRouter>
				</Provider>
			</StrictMode>,
		);

		await waitFor(() => expect(searches[searches.length - 1]).toBe(""));
		expect(second.getByTestId("location").textContent).toBe("/browser");
	});
});
