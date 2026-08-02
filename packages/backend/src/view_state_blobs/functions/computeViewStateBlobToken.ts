import { createHash } from "node:crypto";

// The token is derived from the content hash, not a random ID, so saving is a
// naturally idempotent upsert: the same selection always maps to the same
// token. 16 hex characters (64 bits) is ample to avoid collisions for this
// volume of data without resorting to a re-encoding scheme (e.g. base62).
const TOKEN_LENGTH = 16;

export function computeViewStateBlobToken(data: string): string {
	return createHash("sha256").update(data).digest("hex").slice(0, TOKEN_LENGTH);
}
