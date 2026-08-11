import equal from "fast-deep-equal";

/**
 * @template K - The type of keys in the map
 * @template V - The type of values in the map
 */
export class DeepMap<K, V> implements Iterable<[K, V]> {
	private map: Map<K, V>;

	constructor(map?: Map<K, V>) {
		if (map === undefined) {
			this.map = new Map();
			return;
		}
		this.map = map;
	}

	get(key: K): V | undefined {
		for (const k of this.map.keys()) {
			if (equal(k, key)) {
				return this.map.get(k);
			}
		}
		return undefined;
	}

	set(key: K, value: V) {
		for (const k of this.map.keys()) {
			if (equal(k, key)) {
				this.map.set(k, value);
				return;
			}
		}
		this.map.set(key, value);
	}

	has(key: K): boolean {
		for (const k of this.map.keys()) {
			if (equal(k, key)) {
				return true;
			}
		}
		return false;
	}

	delete(key: K): boolean {
		for (const k of this.map.keys()) {
			if (equal(k, key)) {
				return this.map.delete(k);
			}
		}
		return false;
	}

	clear(): void {
		this.map.clear();
	}

	[Symbol.iterator](): Iterator<[K, V], unknown, undefined> {
		return this.map[Symbol.iterator]();
	}
}
