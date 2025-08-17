import type { NextFunction, Request, RequestHandler, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { wrap } from "./wrap";

describe("wrap", () => {
	it("should call next with an error if the handler throws an error", async () => {
		const error = new Error("test error");
		const handler: RequestHandler = (_req, _res, _next) => {
			throw error;
		};

		const wrappedHandler = wrap(handler);

		const req = {} as Request;
		const res = {} as Response;
		const next = vi.fn() as NextFunction;

		await wrappedHandler(req, res, next);

		expect(next).toHaveBeenCalledWith(error);
	});

	it("should call next with an error if the handler returns a rejected promise", async () => {
		const error = new Error("test error");
		const handler: RequestHandler = (_req, _res, _next) => {
			return Promise.reject(error);
		};

		const wrappedHandler = wrap(handler);

		const req = {} as Request;
		const res = {} as Response;
		const next = vi.fn() as NextFunction;

		await wrappedHandler(req, res, next);

		expect(next).toHaveBeenCalledWith(error);
	});

	it("should not call next with an error if the handler succeeds", async () => {
		const handler: RequestHandler = (_req, _res, _next) => {
			// Do nothing
		};

		const wrappedHandler = wrap(handler);

		const req = {} as Request;
		const res = {} as Response;
		const next = vi.fn() as NextFunction;

		await wrappedHandler(req, res, next);

		expect(next).not.toHaveBeenCalledWith(expect.any(Error));
	});
});
