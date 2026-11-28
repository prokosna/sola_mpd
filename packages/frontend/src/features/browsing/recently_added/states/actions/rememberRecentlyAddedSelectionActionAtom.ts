import { createRememberSelectionActionAtom } from "../../../common/states/actions/createRememberSelectionActionAtom";
import { rememberedRecentlyAddedSelectionAtom } from "../atoms/rememberedRecentlyAddedSelectionAtom";

export const rememberRecentlyAddedSelectionActionAtom =
	createRememberSelectionActionAtom({
		rememberedSelectionAtom: rememberedRecentlyAddedSelectionAtom,
	});
