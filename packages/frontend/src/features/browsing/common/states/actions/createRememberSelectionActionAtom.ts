import { atom, type WritableAtom } from "jotai";

import type { SelectionQueryParam } from "../../types/browserSelection";

export function createRememberSelectionActionAtom(config: {
	rememberedSelectionAtom: WritableAtom<
		SelectionQueryParam | undefined,
		[SelectionQueryParam | undefined],
		void
	>;
}) {
	const { rememberedSelectionAtom } = config;

	return atom(null, (_get, set, selection: SelectionQueryParam | undefined) => {
		set(rememberedSelectionAtom, selection);
	});
}
