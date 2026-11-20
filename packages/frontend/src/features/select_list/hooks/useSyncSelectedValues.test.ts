import { renderHook } from "@testing-library/react";
import type { GridApi, IRowNode } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { describe, expect, it } from "vitest";

import { useSyncSelectedValues } from "./useSyncSelectedValues";

function createFakeApi(keys: string[], initiallySelected: string[] = []) {
	const selected = new Set(initiallySelected);
	const nodes = keys.map(
		(key) =>
			({
				data: { key },
				isSelected: () => selected.has(key),
			}) as unknown as IRowNode,
	);
	const api = {
		forEachNode: (callback: (node: IRowNode) => void) =>
			nodes.forEach(callback),
		setNodesSelected: ({
			nodes: targets,
			newValue,
		}: {
			nodes: IRowNode[];
			newValue: boolean;
		}) => {
			for (const node of targets) {
				if (newValue) {
					selected.add(node.data.key);
				} else {
					selected.delete(node.data.key);
				}
			}
		},
	} as unknown as GridApi;
	return { api, selected };
}

describe("useSyncSelectedValues", () => {
	// Regression: a selection restored from the URL was never drawn on reload,
	// because the grid did not exist yet when selectedValues arrived.
	it("applies selectedValues when called after the grid gets its rows", () => {
		const gridRef = { current: null };
		const { result } = renderHook(() =>
			useSyncSelectedValues(gridRef, ["Anime Song"]),
		);

		const { api, selected } = createFakeApi(["Aikatsu", "Anime Song"]);
		result.current(api);

		expect([...selected]).toEqual(["Anime Song"]);
	});

	it("syncs the existing grid when selectedValues change", () => {
		const { api, selected } = createFakeApi(["A", "B", "C"], ["A"]);
		const gridRef = { current: { api } as unknown as AgGridReact };
		const { rerender } = renderHook(
			({ values }) => useSyncSelectedValues(gridRef, values),
			{ initialProps: { values: ["A"] } },
		);

		rerender({ values: ["B", "C"] });

		expect([...selected].sort()).toEqual(["B", "C"]);
	});
});
