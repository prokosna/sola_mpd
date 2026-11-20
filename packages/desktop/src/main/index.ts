import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
	app,
	BrowserWindow,
	dialog,
	Menu,
	net,
	protocol,
	screen,
	shell,
} from "electron";
import { resolveRendererFilePath } from "./protocol.js";
import {
	DEFAULT_WINDOW_STATE,
	parseWindowState,
	type WindowState,
} from "./windowState.js";

Menu.setApplicationMenu(null);

if (process.env.SOLA_USER_DATA_DIR) {
	const customUserDataDir = path.resolve(process.env.SOLA_USER_DATA_DIR);
	fs.mkdirSync(customUserDataDir, { recursive: true });
	app.setPath("userData", customUserDataDir);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getRendererPath(): string {
	return app.isPackaged
		? path.join(process.resourcesPath, "renderer")
		: path.join(__dirname, "..", "..", "..", "frontend", "dist");
}

// Intercept requests with absolute paths (e.g. /assets/...) and serve them
// from the frontend dist directory. This is necessary because Vite builds
// with base "/" which produces absolute asset references that fail under
// the file:// protocol.
protocol.registerSchemesAsPrivileged([
	{
		scheme: "sola",
		privileges: {
			standard: true,
			secure: true,
			supportFetchAPI: true,
		},
	},
]);

app.whenReady().then(async () => {
	protocol.handle("sola", async (request) => {
		const filePath = await resolveRendererFilePath(
			getRendererPath(),
			request.url,
			(target) => fs.promises.stat(target),
		);
		return net.fetch(pathToFileURL(filePath).toString());
	});

	// Set working directory to userData so backend's relative "./db/..." paths
	// resolve to the OS-specific user data directory.
	const userDataPath = app.getPath("userData");
	process.chdir(userDataPath);

	// Dynamic import after chdir so backend singletons use the correct DB path.
	let initializeIpcManager: (window: BrowserWindow) => void;
	try {
		({ initializeIpcManager } = await import("../ipc/index.js"));
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		const dbDir = path.join(userDataPath, "db");
		dialog.showErrorBox(
			"Sola MPD failed to start",
			`${message}\n\nData directory: ${dbDir}`,
		);
		app.quit();
		return;
	}

	const mainWindow = createWindow();
	initializeIpcManager(mainWindow);

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			const win = createWindow();
			initializeIpcManager(win);
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

function getWindowStatePath(): string {
	return path.join(app.getPath("userData"), "window-state.json");
}

function loadWindowState(): WindowState {
	try {
		const raw = fs.readFileSync(getWindowStatePath(), "utf-8");
		const workAreas = screen
			.getAllDisplays()
			.map((display) => display.workArea);
		return parseWindowState(raw, workAreas);
	} catch {
		return DEFAULT_WINDOW_STATE;
	}
}

function saveWindowState(window: BrowserWindow): void {
	const isMaximized = window.isMaximized();
	// getNormalBounds() returns pre-maximize bounds so restore size is preserved.
	const bounds = window.getNormalBounds();
	const state: WindowState = {
		width: bounds.width,
		height: bounds.height,
		x: bounds.x,
		y: bounds.y,
		isMaximized,
	};
	try {
		fs.writeFileSync(getWindowStatePath(), JSON.stringify(state));
	} catch {
		// Ignore persistence failures; not critical.
	}
}

function createWindow(): BrowserWindow {
	const state = loadWindowState();
	const mainWindow = new BrowserWindow({
		width: state.width,
		height: state.height,
		x: state.x,
		y: state.y,
		autoHideMenuBar: true,
		webPreferences: {
			preload: path.join(__dirname, "..", "preload", "index.cjs"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
			webSecurity: true,
		},
	});

	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		try {
			const parsed = new URL(url);
			if (parsed.protocol === "http:" || parsed.protocol === "https:") {
				void shell.openExternal(url);
			}
		} catch {
			// Ignore invalid URLs.
		}
		return { action: "deny" };
	});

	mainWindow.webContents.on("will-navigate", (event, url) => {
		if (!url.startsWith("sola://app/")) {
			event.preventDefault();
		}
	});

	if (state.isMaximized) {
		mainWindow.maximize();
	}

	mainWindow.on("close", () => {
		saveWindowState(mainWindow);
	});

	mainWindow.loadURL("sola://app/");

	return mainWindow;
}
