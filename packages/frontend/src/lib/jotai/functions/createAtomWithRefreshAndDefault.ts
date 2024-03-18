import { Getter, PrimitiveAtom, WritableAtom, atom } from "jotai";

/**
 * Unlike atomWithRefresh(), atomWithRefreshAndDefault() also supports setting value by useSetAtom().
 * @param fn
 * @returns
 */
export function createAtomWithRefreshAndDefault<T>(
  fn: (get: Getter) => T,
): [WritableAtom<T, [update: T], void>, WritableAtom<null, [], void>] {
  const refreshCountAtom = atom(0);

  const atomWithRefreshAndDefault = <V>(
    refreshAtom: PrimitiveAtom<number>,
    getDefault: (get: Getter) => V,
  ) => {
    const overwrittenAtom = atom<{ refresh: number; value: V } | null>(null);
    return atom(
      (get) => {
        const lastState = get(overwrittenAtom);
        if (lastState && lastState.refresh === get(refreshAtom)) {
          return lastState.value;
        }
        return getDefault(get);
      },
      (get, set, update: V) => {
        set(overwrittenAtom, { refresh: get(refreshAtom), value: update });
      },
    );
  };

  const dataAtom = atomWithRefreshAndDefault(refreshCountAtom, (get) =>
    fn(get),
  );

  const refreshAtom = atom(null, (get, set) => {
    set(refreshCountAtom, get(refreshCountAtom) + 1);
  });

  return [dataAtom, refreshAtom];
}
