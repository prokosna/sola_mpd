import { describe, expect, it } from "vitest";

import { toolError, toolResultJson, toolResultText } from "./toolResult.js";

describe("toolResultJson", () => {
	it("serialises plain objects into a text block and structuredContent", () => {
		const result = toolResultJson({ a: 1, b: "two" });
		expect(result.content).toEqual([
			{ type: "text", text: JSON.stringify({ a: 1, b: "two" }, null, 2) },
		]);
		expect(result.structuredContent).toEqual({ a: 1, b: "two" });
	});

	it("wraps arrays in a result key so structuredContent stays a plain object", () => {
		const result = toolResultJson([1, 2, 3]);
		expect(result.structuredContent).toEqual({ result: [1, 2, 3] });
		expect(result.content?.[0]).toEqual({
			type: "text",
			text: JSON.stringify([1, 2, 3], null, 2),
		});
	});

	it("wraps primitives in a result key", () => {
		expect(toolResultJson(42).structuredContent).toEqual({ result: 42 });
		expect(toolResultJson("hello").structuredContent).toEqual({
			result: "hello",
		});
		expect(toolResultJson(null).structuredContent).toEqual({ result: null });
	});

	it("does not preserve class instances as plain objects", () => {
		class Box {
			value = 1;
		}
		const result = toolResultJson(new Box());
		expect(result.structuredContent).toEqual({ result: { value: 1 } });
	});
});

describe("toolResultText", () => {
	it("returns a single text content block", () => {
		const result = toolResultText("hello world");
		expect(result.content).toEqual([{ type: "text", text: "hello world" }]);
		expect(result.structuredContent).toBeUndefined();
		expect(result.isError).toBeUndefined();
	});
});

describe("toolError", () => {
	it("marks the result as an error and carries the message", () => {
		const result = toolError("something broke");
		expect(result.isError).toBe(true);
		expect(result.content).toEqual([{ type: "text", text: "something broke" }]);
	});
});
