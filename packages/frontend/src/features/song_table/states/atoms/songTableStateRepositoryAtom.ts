import { createStateRepositoryAtom } from "../../../common";
import type { SongTableStateRepository } from "../../repositories/SongTableStateRepository";

export const songTableStateRepositoryAtom =
	createStateRepositoryAtom<SongTableStateRepository>();
