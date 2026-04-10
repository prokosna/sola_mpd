import { atom } from "jotai";

export const globalFilterTextAtom = atom("");

export const globalFilterTokensAtom = atom((get) => {
	const text = get(globalFilterTextAtom);
	const chunks = text.split(" ");
	const tokens = chunks
		.map((v) => v.trim())
		.filter((v) => v !== "")
		.map((v) => v.toLowerCase());
	return tokens;
});
