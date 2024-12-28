import { atomWithReducer } from "jotai/utils";

/**
 * Creates an atom with a custom comparison function.
 * c.f. https://jotai.org/docs/recipes/atom-with-compare
 *
 * @template Value The type of the atom's value
 * @param initialValue The initial value of the atom
 * @param areEqual A function to compare the previous and next values
 * @returns An atom that only updates when the comparison function returns false
 */
export function atomWithCompare<Value>(
  initialValue: Value,
  areEqual: (prev: Value, next: Value) => boolean,
) {
  return atomWithReducer(initialValue, (prev: Value, next: Value) => {
    if (areEqual(prev, next)) {
      return prev;
    }

    return next;
  });
}
