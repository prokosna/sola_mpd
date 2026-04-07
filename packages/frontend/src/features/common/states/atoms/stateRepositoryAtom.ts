import { atomWithDefault } from "jotai/utils";
import type { StateRepository } from "../../repositories/StateRepository";

export function createStateRepositoryAtom<T extends StateRepository<never>>() {
	return atomWithDefault<T>(() => {
		throw new Error("Not initialized. Should be setup DI in the provider.");
	});
}
