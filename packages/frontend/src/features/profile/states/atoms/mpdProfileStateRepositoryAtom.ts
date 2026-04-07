import { createStateRepositoryAtom } from "../../../common/states/atoms/stateRepositoryAtom";
import type { MpdProfileStateRepository } from "../../repositories/MpdProfileStateRepository";

export const mpdProfileStateRepositoryAtom =
	createStateRepositoryAtom<MpdProfileStateRepository>();
