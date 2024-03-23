import equal from "fast-deep-equal";
import { describe, it, expect } from "vitest";

import { DeepMap } from "./DeepMap.js";

describe("DeepMap", () => {
  it("should initialize with an empty map", () => {
    const map = new DeepMap();
    expect([...map]).toEqual([]);
  });

  it("should initialize with a given map", () => {
    const initialMap = new Map([["key", "value"]]);
    const map = new DeepMap(initialMap);
    expect([...map]).toEqual([["key", "value"]]);
  });

  it("should set and get a value based on deep equality", () => {
    const map = new DeepMap();
    const key = { a: 1 };
    map.set(key, "value");
    expect(map.get(key)).toBe("value");
    expect(map.get({ a: 1 })).toBe("value");
  });

  it("should check if it has a key based on deep equality", () => {
    const map = new DeepMap();
    const key = { a: 1 };
    map.set(key, "value");
    expect(map.has(key)).toBe(true);
    expect(map.has({ a: 1 })).toBe(true);
  });

  it("should iterate over its items", () => {
    const key = { a: 1 };
    const map = new DeepMap(new Map([[key, "value"]]));
    for (const [k, v] of map) {
      expect(equal(k, key)).toBe(true);
      expect(v).toBe("value");
    }
  });
});
