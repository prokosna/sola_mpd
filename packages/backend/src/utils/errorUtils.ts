export const toErrorMessage = (err: unknown): string => {
	if (typeof err === "string") {
		return err;
	}
	if (err instanceof Error) {
		return err.message;
	}
	return "Unknown error";
};
