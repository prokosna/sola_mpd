import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { app, BrowserWindow, net, protocol } from "electron";

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
		let filePath = path.join(getRendererPath(), url.pathname);

		// SPA fallback: serve index.html for paths that don't match a file.
		try {
			const stat = await fs.promises.stat(filePath);
			if (stat.isDirectory()) {
				filePath = path.join(filePath, "index.html");
			}
		} catch {
			filePath = path.join(getRendererPath(), "index.html");
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

function createWindow(): BrowserWindow {
	const mainWindow = new BrowserWindow({
		width: 1280,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "..", "preload", "index.cjs"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	mainWindow.loadURL("sola://app/");

	return mainWindow;
}
