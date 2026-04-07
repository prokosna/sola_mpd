import { atomWithDefault } from "jotai/utils";

export function createStateRepositoryAtom<T>() {
	return atomWithDefault<T>(() => {
		throw new Error("Not initialized. Should be setup DI in the provider.");
	});
}
