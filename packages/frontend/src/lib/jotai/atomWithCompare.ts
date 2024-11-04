import { WritableAtom } from "jotai";
import { atomWithReducer } from "jotai/utils";

export function atomWithCompare<T>(
  initialValue: T,
  areEqual: (prev: T, next: T) => boolean,
): WritableAtom<T, [T], void> {
  return atomWithReducer(initialValue, (prev: T, next: T) => {
    if (areEqual(prev, next)) {
      return prev;
    }
    return next;
  });
}
