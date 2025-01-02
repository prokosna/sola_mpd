import { atom, useSetAtom } from "jotai";
import { useCallback } from "react";

/**
 * Base atom for storing raw global filter input.
 *
 * Features:
 * - Raw text storage
 * - Empty string default
 * - Single source of truth
 */
const globalFilterTextAtom = atom("");

/**
 * Derived atom for processed search tokens.
 *
 * Features:
 * - Space-based tokenization
 * - Whitespace trimming
 * - Empty token filtering
 * - Case normalization
 *
 * Processing Flow:
 * 1. Split text on spaces
 * 2. Trim each token
 * 3. Remove empty tokens
 * 4. Convert to lowercase
 *
 * @example
 * Input: "  Song  Title  "
 * Output: ["song", "title"]
 */
export const globalFilterTokensAtom = atom((get) => {
  const text = get(globalFilterTextAtom);
  const chunks = text.split(" ");
  const tokens = chunks
    .map((v) => v.trim())
    .filter((v) => v !== "")
    .map((v) => v.toLowerCase());
  return tokens;
});

/**
 * Hook for updating global filter text.
 *
 * Features:
 * - Memoized update function
 * - Type-safe text updates
 * - Automatic token derivation
 * - Performance optimized
 *
 * @returns Memoized text update function
 */
export function useSetGlobalFilterTextState() {
  const setGlobalFilterText = useSetAtom(globalFilterTextAtom);

  return useCallback(
    (text: string) => {
      setGlobalFilterText(text);
    },
    [setGlobalFilterText],
  );
}
