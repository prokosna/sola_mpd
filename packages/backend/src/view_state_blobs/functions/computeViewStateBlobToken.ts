import { createHash } from "node:crypto";

// The token is the content hash, not a random ID, so saving is a naturally
// idempotent upsert: the same selection always maps to the same token.
// 16 hex characters is 64 bits, ample against collisions at this volume.
const TOKEN_LENGTH = 16;

export function computeViewStateBlobToken(data: string): string {
	return createHash("sha256").update(data).digest("hex").slice(0, TOKEN_LENGTH);
}
