export interface DiffEntry<T> {
  item: T;
  tag: "new" | "changed" | null;
}

export interface Diff<T> {
  entries: DiffEntry<T>[];
  removed: T[];
}

// Compares an ingredient list against the previous batch's, matched by name
// (malt/hop name) so the public experiment timeline can highlight what
// changed between two attempts at the same recipe.
export function diffByName<T>(
  current: T[],
  previous: T[],
  getName: (item: T) => string,
  getAmount: (item: T) => string,
): Diff<T> {
  const prevByName = new Map(previous.map((item) => [getName(item), item]));
  const currentNames = new Set(current.map(getName));

  const entries: DiffEntry<T>[] = current.map((item) => {
    const prev = prevByName.get(getName(item));
    if (!prev) return { item, tag: "new" };
    if (getAmount(prev) !== getAmount(item)) return { item, tag: "changed" };
    return { item, tag: null };
  });

  const removed = previous.filter((item) => !currentNames.has(getName(item)));

  return { entries, removed };
}
