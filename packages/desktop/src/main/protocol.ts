import path from "node:path";

export type StatResult = {
	isDirectory: () => boolean;
};

export async function resolveRendererFilePath(
	rendererRoot: string,
	requestUrl: string,
	statFn: (filePath: string) => Promise<StatResult>,
): Promise<string> {
	const url = new URL(requestUrl);
	const resolvedRoot = path.resolve(rendererRoot);
	const normalizedPathname = url.pathname.replaceAll("\\", "/");
	let filePath = path.resolve(resolvedRoot, `.${normalizedPathname}`);
	const isInsideRenderer =
		filePath === resolvedRoot ||
		filePath.startsWith(`${resolvedRoot}${path.sep}`);

	if (!isInsideRenderer) {
		return path.join(resolvedRoot, "index.html");
	}

	// SPA fallback: serve index.html for paths that don't match a file.
	try {
		const stat = await statFn(filePath);
		if (stat.isDirectory()) {
			filePath = path.join(filePath, "index.html");
		}
	} catch {
		filePath = path.join(resolvedRoot, "index.html");
	}

	return filePath;
}
