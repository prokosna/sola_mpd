import { type Atom, atom } from "jotai";
import { unwrap } from "jotai/utils";

// Re-raised unhandled so the global unhandledrejection listeners report it.
const rejectUnhandled = (error: unknown): void => {
	void Promise.reject(error);
};

// A rejected load would otherwise be thrown during render and unmount the app.
// The promise standing in for it never settles, so unwrap keeps the previous
// value until the base atom produces a new promise.
export function atomWithSync<T>(
	baseAtom: Atom<Promise<T> | T>,
	onRejected: (error: unknown) => void = rejectUnhandled,
) {
	const settledAtom = atom((get) => {
		const value = get(baseAtom);
		if (!(value instanceof Promise)) {
			return value;
		}
		return value.catch((error: unknown) => {
			onRejected(error);
			return new Promise<T>(() => {});
		});
	});
	return unwrap(settledAtom, (prev) => prev);
}
