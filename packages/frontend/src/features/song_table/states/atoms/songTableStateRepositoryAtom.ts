import { createStateRepositoryAtom } from "../../../common/states/atoms/stateRepositoryAtom";
import type { SongTableStateRepository } from "../../repositories/SongTableStateRepository";

export const songTableStateRepositoryAtom =
	createStateRepositoryAtom<SongTableStateRepository>();
