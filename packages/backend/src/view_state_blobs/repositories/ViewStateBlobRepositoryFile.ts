import fs from "node:fs";
import path from "node:path";

import {
	DB_DIRECTORY,
	DB_FILE_VIEW_STATE_BLOBS,
} from "@sola_mpd/shared/src/const/database.js";

import { backupDbDirectory } from "../../configs/utils/backupDbDirectory.js";
import type {
	ViewStateBlobEntry,
	ViewStateBlobRepository,
} from "./ViewStateBlobRepository.js";

type ViewStateBlobDocument = Record<string, ViewStateBlobEntry>;

let hasAttemptedDbBackup = false;

// Same rationale as ConfigRepositoryFile's backupDbDirectoryOnce(): deferred
// to the first actual write so that a bare module import never touches the
// real db directory.
function backupDbDirectoryOnce() {
	if (hasAttemptedDbBackup) {
		return;
	}
	hasAttemptedDbBackup = true;
	backupDbDirectory(DB_DIRECTORY);
}

// No in-memory cache, unlike ConfigRepositoryFile: read-through/write-through
// keeps the constructor free of any filesystem access, so an import can never
// touch the real db directory.
class ViewStateBlobRepositoryFile implements ViewStateBlobRepository {
	constructor(private readonly localFilePath: string) {}

	private readDocument(): ViewStateBlobDocument {
		try {
			const fileContent = fs.readFileSync(this.localFilePath, "utf-8");
			return JSON.parse(fileContent) as ViewStateBlobDocument;
		} catch (_) {
			return {};
		}
	}

	private writeDocument(document: ViewStateBlobDocument): void {
		backupDbDirectoryOnce();

		const dirPath = path.dirname(this.localFilePath);
		fs.mkdirSync(dirPath, { recursive: true });
		// Temp file must live in the same directory as the destination: rename
		// cannot cross filesystems.
		const tempFilePath = path.join(
			dirPath,
			`.${path.basename(this.localFilePath)}.${process.pid}.${Date.now()}.tmp`,
		);
		fs.writeFileSync(tempFilePath, JSON.stringify(document, null, 2));
		fs.renameSync(tempFilePath, this.localFilePath);
	}

	get = (token: string): ViewStateBlobEntry | undefined => {
		const document = this.readDocument();
		const entry = document[token];
		if (entry === undefined) {
			return undefined;
		}

		const refreshedEntry: ViewStateBlobEntry = {
			...entry,
			lastAccessedAt: Date.now(),
		};
		document[token] = refreshedEntry;
		this.writeDocument(document);
		return refreshedEntry;
	};

	put = (token: string, data: string): void => {
		const document = this.readDocument();
		if (document[token] !== undefined) {
			return;
		}

		const now = Date.now();
		document[token] = { data, createdAt: now, lastAccessedAt: now };
		this.writeDocument(document);
	};

	sweep = (maxAgeMs: number): number => {
		const document = this.readDocument();
		const cutoff = Date.now() - maxAgeMs;

		let removedCount = 0;
		for (const [token, entry] of Object.entries(document)) {
			if (entry.lastAccessedAt < cutoff) {
				delete document[token];
				removedCount++;
			}
		}

		if (removedCount > 0) {
			this.writeDocument(document);
		}
		return removedCount;
	};
}

export const viewStateBlobRepository: ViewStateBlobRepository =
	new ViewStateBlobRepositoryFile(DB_FILE_VIEW_STATE_BLOBS);
