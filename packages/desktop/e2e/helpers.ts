import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	_electron,
	type ElectronApplication,
	type Page,
} from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const mainEntry = path.resolve(__dirname, "..", "dist", "main", "index.mjs");

export type DesktopSession = {
	electronApp: ElectronApplication;
	page: Page;
	errors: string[];
	close: () => Promise<void>;
};

function resolveExecutablePath(
	rawPath: string | undefined,
): string | undefined {
	if (!rawPath) return undefined;
	const fromCwd = path.resolve(rawPath);
	if (fs.existsSync(fromCwd)) return fromCwd;
	const fromRepoRoot = path.resolve(repoRoot, rawPath);
	if (fs.existsSync(fromRepoRoot)) return fromRepoRoot;
	return fromCwd;
}

export async function launchDesktopApp(
	userDataDir: string,
): Promise<DesktopSession> {
	const executablePath = resolveExecutablePath(
		process.env.SOLA_E2E_EXECUTABLE_PATH,
	);

	const baseArgs = process.platform === "linux" ? ["--no-sandbox"] : [];
	const launchOptions =
		executablePath !== undefined
			? {
					executablePath,
					args: baseArgs,
					env: { ...process.env, SOLA_USER_DATA_DIR: userDataDir },
				}
			: {
					args: [...baseArgs, mainEntry],
					env: { ...process.env, SOLA_USER_DATA_DIR: userDataDir },
				};

	const electronApp = await _electron.launch(launchOptions);
	const page = await electronApp.firstWindow();
	const errors: string[] = [];

	page.on("pageerror", (err) => {
		errors.push(`pageerror: ${err.message}`);
	});
	page.on("console", (msg) => {
		if (msg.type() === "error") {
			errors.push(`console.error: ${msg.text()}`);
		}
	});
	page.on("crash", () => {
		errors.push("renderer crashed");
	});

	await page.waitForLoadState("domcontentloaded");

	return {
		electronApp,
		page,
		errors,
		close: async () => {
			await electronApp.close();
		},
	};
}

export type TestMpdServer = {
	host: string;
	port: number;
	stop: () => Promise<void>;
};

function getFreePort(): Promise<number> {
	return new Promise((resolve, reject) => {
		const server = net.createServer();
		server.unref();
		server.on("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			if (address === null || typeof address === "string") {
				server.close(() => reject(new Error("Failed to allocate port")));
				return;
			}
			const { port } = address;
			server.close(() => resolve(port));
		});
	});
}

function sendMpdCommand(
	host: string,
	port: number,
	command: string,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const socket = net.createConnection({ host, port });
		let buffer = "";
		let greeted = false;

		socket.setTimeout(5000);
		socket.on("timeout", () => {
			socket.destroy();
			reject(new Error(`MPD command timed out: ${command}`));
		});
		socket.on("error", (err) => {
			socket.destroy();
			reject(err);
		});
		socket.on("data", (chunk) => {
			buffer += chunk.toString("utf-8");
			if (!greeted) {
				const newlineIdx = buffer.indexOf("\n");
				if (newlineIdx === -1) return;
				const greeting = buffer.slice(0, newlineIdx);
				if (!greeting.startsWith("OK MPD")) {
					socket.destroy();
					reject(new Error(`Unexpected MPD greeting: ${greeting}`));
					return;
				}
				greeted = true;
				buffer = buffer.slice(newlineIdx + 1);
				socket.write(`${command}\n`);
				return;
			}
			if (buffer.endsWith("OK\n") || /^ACK /m.test(buffer)) {
				socket.end();
				resolve(buffer);
			}
		});
	});
}

async function waitForMpdReady(
	host: string,
	port: number,
	timeoutMs = 15_000,
): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	let updated = false;

	while (Date.now() < deadline) {
		try {
			if (!updated) {
				await sendMpdCommand(host, port, "update");
				updated = true;
			}
			const listOutput = await sendMpdCommand(host, port, "listall");
			if (
				listOutput.includes("sample1.flac") &&
				listOutput.includes("sample2.flac") &&
				listOutput.includes("sample3.flac")
			) {
				return;
			}
		} catch {
			// MPD is still starting up.
		}
		await new Promise((resolve) => setTimeout(resolve, 200));
	}

	throw new Error(
		"Timed out waiting for test MPD server to index sample songs",
	);
}

function hasMpdBinary(): boolean {
	const res = spawnSync("mpd", ["--version"], { stdio: "ignore" });
	return res.status === 0;
}

export async function startTestMpdServer(): Promise<TestMpdServer | undefined> {
	if (process.env.SOLA_E2E_MPD_PORT) {
		const host = process.env.SOLA_E2E_MPD_HOST ?? "127.0.0.1";
		const port = Number(process.env.SOLA_E2E_MPD_PORT);
		await waitForMpdReady(host, port);
		return {
			host,
			port,
			stop: async () => {},
		};
	}

	if (!hasMpdBinary()) {
		if (process.env.SOLA_E2E_REQUIRE_MPD === "1") {
			throw new Error(
				"SOLA_E2E_REQUIRE_MPD=1 is set, but the `mpd` binary is not installed on PATH.",
			);
		}
		return undefined;
	}

	const host = "127.0.0.1";
	const port = await getFreePort();
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sola-mpd-e2e-mpd-"));
	const playlistsDir = path.join(tmpDir, "playlists");
	fs.mkdirSync(playlistsDir, { recursive: true });

	const musicDir = path.join(repoRoot, "mpd", "music");
	const confPath = path.join(tmpDir, "mpd.conf");
	const conf = [
		`music_directory "${musicDir}"`,
		`playlist_directory "${playlistsDir}"`,
		`db_file "${path.join(tmpDir, "tag_cache")}"`,
		`state_file "${path.join(tmpDir, "state")}"`,
		`sticker_file "${path.join(tmpDir, "sticker.sql")}"`,
		`bind_to_address "${host}"`,
		`port "${port}"`,
		'filesystem_charset "UTF-8"',
		"audio_output {",
		'  type "null"',
		'  name "Test Null Output"',
		'  mixer_type "software"',
		"}",
	].join("\n");
	fs.writeFileSync(confPath, conf, "utf-8");

	const child: ChildProcess = spawn(
		"mpd",
		["--stdout", "--no-daemon", confPath],
		{
			stdio: ["ignore", "pipe", "pipe"],
		},
	);

	let stderr = "";
	child.stderr?.on("data", (chunk: Buffer) => {
		stderr += chunk.toString("utf-8");
	});

	try {
		await waitForMpdReady(host, port);
	} catch (err) {
		child.kill("SIGTERM");
		fs.rmSync(tmpDir, { recursive: true, force: true });
		throw new Error(
			`${err instanceof Error ? err.message : String(err)}\nmpd stderr:\n${stderr}`,
		);
	}

	return {
		host,
		port,
		stop: async () => {
			if (child.exitCode === null) {
				child.kill("SIGTERM");
				await new Promise<void>((resolve) => {
					const timer = setTimeout(() => {
						child.kill("SIGKILL");
						resolve();
					}, 3000);
					child.once("exit", () => {
						clearTimeout(timer);
						resolve();
					});
				});
			}
			fs.rmSync(tmpDir, { recursive: true, force: true });
		},
	};
}
