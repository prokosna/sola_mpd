import fs from "node:fs";
import path from "node:path";

const BACKUP_MARKER_FILE_NAME = ".backup-v1-done";
const BACKUP_SUBDIRECTORY_NAME = "backups";

// ISO8601 timestamps contain `:`, which is illegal in Windows file/directory
// names, and this app ships as a Windows Electron desktop app.
function toFilesystemSafeTimestamp(date: Date): string {
	return date.toISOString().replace(/[:.]/g, "-");
}

/**
 * Runs once, before schema migrations touch anything. Never throws: the backup
 * is insurance on top of the real data, not a dependency of it, so a failure
 * leaves the marker absent and the next startup retries.
 */
export function backupDbDirectory(dbDirectoryPath: string): void {
	const markerPath = path.join(dbDirectoryPath, BACKUP_MARKER_FILE_NAME);
	if (fs.existsSync(markerPath)) {
		return;
	}

	try {
		const jsonFileNames = fs
			.readdirSync(dbDirectoryPath, { withFileTypes: true })
			.filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
			.map((entry) => entry.name);

		if (jsonFileNames.length > 0) {
			const destinationPath = path.join(
				dbDirectoryPath,
				BACKUP_SUBDIRECTORY_NAME,
				toFilesystemSafeTimestamp(new Date()),
			);
			fs.mkdirSync(destinationPath, { recursive: true });
			for (const fileName of jsonFileNames) {
				fs.copyFileSync(
					path.join(dbDirectoryPath, fileName),
					path.join(destinationPath, fileName),
				);
			}
		}

		fs.writeFileSync(markerPath, "");
	} catch (error) {
		console.error("Failed to back up db directory on startup:", error);
	}
}
