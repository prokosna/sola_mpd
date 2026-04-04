import equal from "fast-deep-equal";

/**
 * A Map implementation that supports deep equality comparison for keys.
 * Unlike the standard Map, this implementation compares keys using deep equality
 * rather than reference equality.
 *
 * @template K - The type of keys in the map
 * @template V - The type of values in the map
 */
export class DeepMap<K, V> implements Iterable<[K, V]> {
	private map: Map<K, V>;

	/**
	 * Creates a new DeepMap instance.
	 * @param map - Optional Map to initialize with
	 */
	constructor(map?: Map<K, V>) {
		if (map === undefined) {
			this.map = new Map();
			return;
		}
		this.map = map;
	}

	/**
	 * Retrieves a value associated with a key.
	 * Uses deep equality comparison to find the key.
	 *
	 * @param key - The key to look up
	 * @returns The value associated with the key, or undefined if not found
	 */
	get(key: K): V | undefined {
		for (const k of this.map.keys()) {
			if (equal(k, key)) {
				return this.map.get(k);
			}
		}
		return undefined;
	}

	/**
	 * Sets a value for a key in the map.
	 * If a key deeply equal to the provided key already exists, its value will be updated.
	 *
	 * @param key - The key to set
	 * @param value - The value to associate with the key
	 */
	set(key: K, value: V) {
		for (const k of this.map.keys()) {
			if (equal(k, key)) {
				this.map.set(k, value);
				return;
			}
		}
		this.map.set(key, value);
	}

	/**
	 * Checks if a key exists in the map using deep equality comparison.
	 *
	 * @param key - The key to check for
	 * @returns true if a deeply equal key exists, false otherwise
	 */
	has(key: K): boolean {
		for (const k of this.map.keys()) {
			if (equal(k, key)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Deletes a key-value pair from the map.
	 *
	 * @param key - The key to delete
	 * @returns true if the key was deleted, false otherwise
	 */
	delete(key: K): boolean {
		for (const k of this.map.keys()) {
			if (equal(k, key)) {
				return this.map.delete(k);
			}
		}
		return false;
	}

	/**
	 * Implements the Iterator protocol for the DeepMap.
	 * Allows the map to be used in for...of loops.
	 *
	 * @returns An iterator for the key-value pairs in the map
	 */
	[Symbol.iterator](): Iterator<[K, V], unknown, undefined> {
		return this.map[Symbol.iterator]();
	}
}
