export interface RetryOptions<T> {
	/** Total attempts including the first call. Must be >= 1. */
	attempts: number;
	/** Base delay used to seed the exponential backoff in milliseconds. */
	baseDelayMs: number;
	/** Upper bound on the per-attempt delay in milliseconds. */
	maxDelayMs: number;
	/**
	 * Optional predicate to retry on a successfully returned value. When it
	 * returns true the value is treated as a failure and another attempt is
	 * made. Thrown errors are always retried until `attempts` is exhausted.
	 */
	retryOnValue?: (value: T) => boolean;
	/** Injection point for tests; defaults to `setTimeout`-based sleep. */
	sleep?: (ms: number) => Promise<void>;
	/** Injection point for tests; defaults to `Math.random`. */
	random?: () => number;
}

/**
 * Computes the delay before the (zero-indexed) `attempt`-th retry using full
 * jitter exponential backoff. Exported for testability.
 */
export function computeBackoffDelayMs(
	attempt: number,
	baseDelayMs: number,
	maxDelayMs: number,
	random: () => number = Math.random,
): number {
	const exp = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
	return Math.floor(random() * exp);
}

const defaultSleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retries `fn` up to `options.attempts` times with full-jitter exponential
 * backoff. Retries on thrown errors unconditionally; additionally retries on
 * a returned value when `retryOnValue` says so. Returns the last value if
 * retries are exhausted on a value, or rethrows the last error if exhausted
 * on a throw.
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	options: RetryOptions<T>,
): Promise<T> {
	const sleep = options.sleep ?? defaultSleep;
	const random = options.random ?? Math.random;
	let lastError: unknown;
	let lastValue: T | undefined;
	let lastHadValue = false;
	for (let attempt = 0; attempt < options.attempts; attempt++) {
		try {
			lastValue = await fn();
			lastHadValue = true;
			lastError = undefined;
			if (
				options.retryOnValue === undefined ||
				!options.retryOnValue(lastValue)
			) {
				return lastValue;
			}
		} catch (err) {
			lastError = err;
			lastHadValue = false;
		}
		const isLastAttempt = attempt === options.attempts - 1;
		if (isLastAttempt) {
			break;
		}
		await sleep(
			computeBackoffDelayMs(
				attempt,
				options.baseDelayMs,
				options.maxDelayMs,
				random,
			),
		);
	}
	if (lastHadValue) {
		return lastValue as T;
	}
	throw lastError;
}
