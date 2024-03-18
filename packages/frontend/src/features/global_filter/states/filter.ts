import { atom, useSetAtom } from "jotai";
import { useCallback } from "react";

const globalFilterTextAtom = atom("");

const globalFilterTokensAtom = atom((get) => {
  const text = get(globalFilterTextAtom);
  const chunks = text.split(" ");
  const tokens = chunks
    .map((v) => v.trim())
    .filter((v) => v !== "")
    .map((v) => v.toLowerCase());
  return tokens;
});

export { globalFilterTokensAtom };

export function useSetGlobalFilterTextState() {
  const setGlobalFilterText = useSetAtom(globalFilterTextAtom);

  return useCallback(
    (text: string) => {
      setGlobalFilterText(text);
    },
    [setGlobalFilterText],
  );
}
