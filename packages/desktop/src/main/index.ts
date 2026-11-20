import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
	app,
	BrowserWindow,
	Menu,
	net,
	protocol,
	screen,
	shell,
} from "electron";

Menu.setApplicationMenu(null);

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
		const url = new URL(request.url);
		const rendererRoot = path.resolve(getRendererPath());
		const normalizedPathname = url.pathname.replaceAll("\\", "/");
		let filePath = path.resolve(rendererRoot, `.${normalizedPathname}`);
		const isInsideRenderer =
			filePath === rendererRoot ||
			filePath.startsWith(`${rendererRoot}${path.sep}`);

		if (!isInsideRenderer) {
			filePath = path.join(rendererRoot, "index.html");
		} else {
			// SPA fallback: serve index.html for paths that don't match a file.
			try {
				const stat = await fs.promises.stat(filePath);
				if (stat.isDirectory()) {
					filePath = path.join(filePath, "index.html");
				}
			} catch {
				filePath = path.join(rendererRoot, "index.html");
			}
		}

		return net.fetch(pathToFileURL(filePath).toString());
	});

	// Set working directory to userData so backend's relative "./db/..." paths
	// resolve to the OS-specific user data directory.
	process.chdir(app.getPath("userData"));

	// Dynamic import after chdir so backend singletons use the correct DB path.
	const { initializeIpcManager } = await import("../ipc/index.mjs");

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

type WindowState = {
	width: number;
	height: number;
	x?: number;
	y?: number;
	isMaximized?: boolean;
};

const DEFAULT_WINDOW_STATE: WindowState = { width: 1280, height: 800 };

function getWindowStatePath(): string {
	return path.join(app.getPath("userData"), "window-state.json");
}

function isVisibleOnAnyDisplay(
	x: number,
	y: number,
	width: number,
	height: number,
): boolean {
	return screen.getAllDisplays().some(({ workArea }) => {
		return (
			x < workArea.x + workArea.width &&
			x + width > workArea.x &&
			y < workArea.y + workArea.height &&
			y + height > workArea.y
		);
	});
}

function loadWindowState(): WindowState {
	try {
		const raw = fs.readFileSync(getWindowStatePath(), "utf-8");
		const parsed = JSON.parse(raw) as Partial<WindowState>;
		if (
			typeof parsed.width === "number" &&
			typeof parsed.height === "number" &&
			parsed.width >= 200 &&
			parsed.height >= 200
		) {
			const hasPosition =
				typeof parsed.x === "number" &&
				typeof parsed.y === "number" &&
				isVisibleOnAnyDisplay(parsed.x, parsed.y, parsed.width, parsed.height);
			return {
				width: parsed.width,
				height: parsed.height,
				x: hasPosition ? parsed.x : undefined,
				y: hasPosition ? parsed.y : undefined,
				isMaximized: parsed.isMaximized === true,
			};
		}
	} catch {
		// Fall through to default.
	}
	return DEFAULT_WINDOW_STATE;
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
