import { FilterCondition_Operator } from "@sola_mpd/shared/src/models/filter_pb.js";
import { describe, expect, it } from "vitest";

import {
	convertDisplayNameToOperator,
	convertOperatorToDisplayName,
	listAllFilterConditionOperators,
} from "./songFilterConversion";

describe("convertOperatorToDisplayName", () => {
	it("should convert all operators to display names", () => {
		expect(convertOperatorToDisplayName(FilterCondition_Operator.EQUAL)).toBe(
			"=",
		);
		expect(
			convertOperatorToDisplayName(FilterCondition_Operator.NOT_EQUAL),
		).toBe("!=");
		expect(convertOperatorToDisplayName(FilterCondition_Operator.CONTAIN)).toBe(
			"has",
		);
		expect(
			convertOperatorToDisplayName(FilterCondition_Operator.NOT_CONTAIN),
		).toBe("!has");
		expect(convertOperatorToDisplayName(FilterCondition_Operator.REGEX)).toBe(
			"=~",
		);
		expect(
			convertOperatorToDisplayName(FilterCondition_Operator.LESS_THAN),
		).toBe("<");
		expect(
			convertOperatorToDisplayName(FilterCondition_Operator.LESS_THAN_OR_EQUAL),
		).toBe("<=");
		expect(
			convertOperatorToDisplayName(FilterCondition_Operator.GREATER_THAN),
		).toBe(">");
		expect(
			convertOperatorToDisplayName(
				FilterCondition_Operator.GREATER_THAN_OR_EQUAL,
			),
		).toBe(">=");
		expect(convertOperatorToDisplayName(FilterCondition_Operator.UNKNOWN)).toBe(
			"unknown",
		);
	});
});

describe("convertDisplayNameToOperator", () => {
	it("should convert display names back to operators", () => {
		expect(convertDisplayNameToOperator("=")).toBe(
			FilterCondition_Operator.EQUAL,
		);
		expect(convertDisplayNameToOperator("!=")).toBe(
			FilterCondition_Operator.NOT_EQUAL,
		);
		expect(convertDisplayNameToOperator("has")).toBe(
			FilterCondition_Operator.CONTAIN,
		);
		expect(convertDisplayNameToOperator("!has")).toBe(
			FilterCondition_Operator.NOT_CONTAIN,
		);
		expect(convertDisplayNameToOperator("=~")).toBe(
			FilterCondition_Operator.REGEX,
		);
	});

	it("should round-trip all operators", () => {
		const operators = listAllFilterConditionOperators();
		for (const op of operators) {
			const displayName = convertOperatorToDisplayName(op);
			expect(convertDisplayNameToOperator(displayName)).toBe(op);
		}
	});

	it("should throw for unsupported operator string", () => {
		expect(() => convertDisplayNameToOperator("invalid")).toThrow(
			"Not supported operator: invalid",
		);
	});
});

describe("listAllFilterConditionOperators", () => {
	it("should exclude UNKNOWN operator", () => {
		const operators = listAllFilterConditionOperators();
		expect(operators).not.toContain(FilterCondition_Operator.UNKNOWN);
	});

	it("should contain all non-UNKNOWN operators", () => {
		const operators = listAllFilterConditionOperators();
		expect(operators).toContain(FilterCondition_Operator.EQUAL);
		expect(operators).toContain(FilterCondition_Operator.NOT_EQUAL);
		expect(operators).toContain(FilterCondition_Operator.CONTAIN);
		expect(operators).toContain(FilterCondition_Operator.NOT_CONTAIN);
		expect(operators).toContain(FilterCondition_Operator.REGEX);
		expect(operators).toContain(FilterCondition_Operator.LESS_THAN);
		expect(operators).toContain(FilterCondition_Operator.LESS_THAN_OR_EQUAL);
		expect(operators).toContain(FilterCondition_Operator.GREATER_THAN);
		expect(operators).toContain(FilterCondition_Operator.GREATER_THAN_OR_EQUAL);
		expect(operators).toContain(FilterCondition_Operator.ADDED_SINCE);
	});
});
