import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
	type DesktopSession,
	launchDesktopApp,
	startTestMpdServer,
	type TestMpdServer,
} from "./helpers.js";

test.describe
	.serial("Desktop app E2E", () => {
		let userDataDir: string;
		let session: DesktopSession | undefined;
		let mpdServer: TestMpdServer | undefined;

		test.beforeAll(async () => {
			userDataDir = fs.mkdtempSync(
				path.join(os.tmpdir(), "sola-mpd-e2e-userdata-"),
			);
			mpdServer = await startTestMpdServer();
			session = await launchDesktopApp(userDataDir);
		});

		test.afterAll(async () => {
			if (session !== undefined) {
				await session.close();
				session = undefined;
			}
			if (mpdServer !== undefined) {
				await mpdServer.stop();
				mpdServer = undefined;
			}
			if (userDataDir) {
				fs.rmSync(userDataDir, { recursive: true, force: true });
			}
		});

		test("boots cleanly with IPC bridge, channel allowlist, and Landing page", async () => {
			if (session === undefined) throw new Error("Session not initialized");
			const { electronApp, page, errors } = session;

			expect(await page.title()).toBe("Sola MPD");
			await expect(page.locator("#root")).toBeAttached();

			// Verify contextBridge preload API and channel allowlist enforcement.
			const bridgeCheck = await electronApp.evaluate(({ BrowserWindow }) => {
				const win = BrowserWindow.getAllWindows()[0];
				if (win === undefined)
					return { ok: false, methods: [], rejected: false };
				return win.webContents.executeJavaScript(`(async () => {
				const bridge = window.__SOLA_IPC_BRIDGE__;
				if (bridge == null) return { ok: false, methods: [], rejected: false };
				let rejected = false;
				try {
					await bridge.invoke("unauthorized_channel", new Uint8Array());
				} catch {
					rejected = true;
				}
				return { ok: true, methods: Object.keys(bridge), rejected };
			})()`);
			});
			expect(bridgeCheck.ok).toBe(true);
			expect(bridgeCheck.methods).toEqual(
				expect.arrayContaining(["invoke", "on", "off"]),
			);
			expect(bridgeCheck.rejected).toBe(true);

			// Clean userData has no MPD profile yet, so the landing form must render.
			await expect(page.getByText("MPD Server Information")).toBeVisible({
				timeout: 15_000,
			});
			expect(errors).toEqual([]);
		});

		test("connects to real MPD via IPC, lists sample songs, navigates, and persists state across restart", async () => {
			test.skip(
				mpdServer === undefined,
				"mpd binary not installed; skipping real MPD E2E test",
			);
			if (session === undefined || mpdServer === undefined) {
				throw new Error("Session or MPD server not initialized");
			}
			const { page, errors } = session;

			// Fill MPD profile form and validate connection over Electron IPC.
			await page.getByLabel("Name").fill("E2E Local MPD");
			await page.getByLabel("Host").fill(mpdServer.host);
			await page.getByLabel("Port").fill(String(mpdServer.port));
			await page.getByRole("button", { name: "Test" }).click();

			await expect(page.getByText("Successfully connected!")).toBeVisible({
				timeout: 15_000,
			});
			await page.getByRole("button", { name: "Save" }).click();

			// Navigate to All Songs and verify the sample FLAC tracks from mpd/music load.
			await expect(page.getByText("All Songs")).toBeVisible({
				timeout: 15_000,
			});
			await page.getByText("All Songs").click();

			await expect(page.getByText("Sample 1", { exact: true })).toBeVisible({
				timeout: 15_000,
			});
			await expect(page.getByText("Sample 3", { exact: true })).toBeVisible({
				timeout: 15_000,
			});

			// Verify SPA navigation works under the sola:// protocol without errors.
			await page.getByText("File Explore").click();
			await expect(page.getByText("sample", { exact: true })).toBeVisible({
				timeout: 15_000,
			});
			expect(errors).toEqual([]);

			// Close app and restart with the same userDataDir; profile persistence
			// should skip Landing and open directly into Home.
			await session.close();
			session = undefined;

			expect(fs.existsSync(path.join(userDataDir, "window-state.json"))).toBe(
				true,
			);

			session = await launchDesktopApp(userDataDir);
			await expect(session.page.getByText("All Songs")).toBeVisible({
				timeout: 15_000,
			});
			expect(session.errors).toEqual([]);
		});
	});
