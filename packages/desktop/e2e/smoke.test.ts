import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	_electron,
	type ElectronApplication,
	expect,
	type Page,
	test,
} from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mainEntry = path.resolve(__dirname, "..", "dist", "main", "index.mjs");

let electronApp: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
	electronApp = await _electron.launch({
		args: ["--no-sandbox", mainEntry],
	});
	page = await electronApp.firstWindow();
	await page.waitForLoadState("domcontentloaded");
});

test.afterAll(async () => {
	if (electronApp !== undefined) {
		await electronApp.close();
	}
});

test("app window has correct title", async () => {
	const title = await page.title();
	expect(title).toBe("Sola MPD");
});

test("renderer has root element", async () => {
	const root = page.locator("#root");
	await expect(root).toBeAttached();
});

test("IPC bridge is injected via preload", async () => {
	// Playwright's page.evaluate may not see contextBridge globals due to
	// execution context isolation. Use webContents.executeJavaScript via
	// the main process, which runs in the renderer's actual main world.
	const hasBridge = await electronApp.evaluate(({ BrowserWindow }) => {
		const win = BrowserWindow.getAllWindows()[0];
		if (win === undefined) return false;
		return win.webContents.executeJavaScript(
			"window.__SOLA_IPC_BRIDGE__ != null",
		);
	});
	expect(hasBridge).toBe(true);

	const bridgeMethods: string[] = await electronApp.evaluate(
		({ BrowserWindow }) => {
			const win = BrowserWindow.getAllWindows()[0];
			if (win === undefined) return [];
			return win.webContents.executeJavaScript(
				"Object.keys(window.__SOLA_IPC_BRIDGE__)",
			);
		},
	);
	expect(bridgeMethods).toContain("invoke");
	expect(bridgeMethods).toContain("on");
	expect(bridgeMethods).toContain("off");
});

test("frontend React app renders", async () => {
	// Use webContents.executeJavaScript to check rendering from the
	// actual renderer context where the IPC bridge is available.
	const rendered = await electronApp.evaluate(({ BrowserWindow }) => {
		const win = BrowserWindow.getAllWindows()[0];
		if (win === undefined) return false;
		return win.webContents.executeJavaScript(
			`new Promise((resolve) => {
				const check = () => {
					const root = document.getElementById("root");
					if (root !== null && root.children.length > 0) {
						resolve(true);
					} else {
						setTimeout(check, 200);
					}
				};
				check();
				setTimeout(() => resolve(false), 15000);
			})`,
		);
	});
	expect(rendered).toBe(true);
});
