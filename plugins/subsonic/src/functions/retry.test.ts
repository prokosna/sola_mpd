import { describe, expect, it, vi } from "vitest";

import { computeBackoffDelayMs, retryWithBackoff } from "./retry.js";

describe("computeBackoffDelayMs", () => {
	it("returns 0 when random is 0", () => {
		expect(computeBackoffDelayMs(0, 100, 2000, () => 0)).toBe(0);
		expect(computeBackoffDelayMs(5, 100, 2000, () => 0)).toBe(0);
	});

	it("scales the upper bound exponentially per attempt up to maxDelayMs", () => {
		const random = () => 0.5;
		expect(computeBackoffDelayMs(0, 100, 2000, random)).toBe(50);
		expect(computeBackoffDelayMs(1, 100, 2000, random)).toBe(100);
		expect(computeBackoffDelayMs(2, 100, 2000, random)).toBe(200);
		expect(computeBackoffDelayMs(3, 100, 2000, random)).toBe(400);
		expect(computeBackoffDelayMs(4, 100, 2000, random)).toBe(800);
		expect(computeBackoffDelayMs(5, 100, 2000, random)).toBe(1000);
		expect(computeBackoffDelayMs(10, 100, 2000, random)).toBe(1000);
	});

	it("applies jitter by multiplying random into the upper bound", () => {
		expect(computeBackoffDelayMs(2, 100, 2000, () => 0.5)).toBe(200);
		expect(computeBackoffDelayMs(2, 100, 2000, () => 0.25)).toBe(100);
		expect(computeBackoffDelayMs(2, 100, 2000, () => 0.99)).toBe(396);
	});
});

describe("retryWithBackoff", () => {
	it("returns the value on the first successful attempt", async () => {
		const fn = vi.fn(async () => "ok");
		const sleep = vi.fn(async () => {});
		const result = await retryWithBackoff(fn, {
			attempts: 3,
			baseDelayMs: 10,
			maxDelayMs: 100,
			sleep,
		});
		expect(result).toBe("ok");
		expect(fn).toHaveBeenCalledTimes(1);
		expect(sleep).not.toHaveBeenCalled();
	});

	it("retries on thrown error then succeeds", async () => {
		let calls = 0;
		const fn = vi.fn(async () => {
			calls += 1;
			if (calls < 3) throw new Error("boom");
			return "ok";
		});
		const sleep = vi.fn(async () => {});
		const result = await retryWithBackoff(fn, {
			attempts: 5,
			baseDelayMs: 10,
			maxDelayMs: 100,
			sleep,
			random: () => 0.5,
		});
		expect(result).toBe("ok");
		expect(fn).toHaveBeenCalledTimes(3);
		expect(sleep).toHaveBeenCalledTimes(2);
	});

	it("rethrows the last error when all attempts fail", async () => {
		const fn = vi.fn(async () => {
			throw new Error("nope");
		});
		const sleep = vi.fn(async () => {});
		await expect(
			retryWithBackoff(fn, {
				attempts: 3,
				baseDelayMs: 1,
				maxDelayMs: 10,
				sleep,
			}),
		).rejects.toThrow("nope");
		expect(fn).toHaveBeenCalledTimes(3);
		expect(sleep).toHaveBeenCalledTimes(2);
	});

	it("retries on a value when retryOnValue says so and returns the last value if exhausted", async () => {
		const fn = vi.fn(async () => [] as number[]);
		const sleep = vi.fn(async () => {});
		const result = await retryWithBackoff(fn, {
			attempts: 4,
			baseDelayMs: 1,
			maxDelayMs: 10,
			sleep,
			retryOnValue: (v) => v.length === 0,
		});
		expect(result).toEqual([]);
		expect(fn).toHaveBeenCalledTimes(4);
		expect(sleep).toHaveBeenCalledTimes(3);
	});

	it("stops retrying on value as soon as retryOnValue returns false", async () => {
		let calls = 0;
		const fn = vi.fn(async () => {
			calls += 1;
			return calls < 3 ? [] : [1];
		});
		const sleep = vi.fn(async () => {});
		const result = await retryWithBackoff(fn, {
			attempts: 10,
			baseDelayMs: 1,
			maxDelayMs: 10,
			sleep,
			retryOnValue: (v) => v.length === 0,
		});
		expect(result).toEqual([1]);
		expect(fn).toHaveBeenCalledTimes(3);
		expect(sleep).toHaveBeenCalledTimes(2);
	});

	it("does not sleep after the final attempt", async () => {
		const fn = vi.fn(async () => {
			throw new Error("x");
		});
		const sleep = vi.fn(async () => {});
		await expect(
			retryWithBackoff(fn, {
				attempts: 2,
				baseDelayMs: 1,
				maxDelayMs: 10,
				sleep,
			}),
		).rejects.toThrow();
		expect(sleep).toHaveBeenCalledTimes(1);
	});

	it("passes the computed backoff delay to sleep", async () => {
		const fn = vi.fn(async () => {
			throw new Error("x");
		});
		const sleep = vi.fn(async () => {});
		await expect(
			retryWithBackoff(fn, {
				attempts: 3,
				baseDelayMs: 100,
				maxDelayMs: 10000,
				sleep,
				random: () => 0.5,
			}),
		).rejects.toThrow();
		expect(sleep).toHaveBeenNthCalledWith(1, 50);
		expect(sleep).toHaveBeenNthCalledWith(2, 100);
	});
});
