import { createStateRepositoryAtom } from "../../../common";
import type { MpdProfileStateRepository } from "../../repositories/MpdProfileStateRepository";

export const mpdProfileStateRepositoryAtom =
	createStateRepositoryAtom<MpdProfileStateRepository>();
