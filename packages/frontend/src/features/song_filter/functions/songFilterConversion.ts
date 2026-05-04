import { FilterCondition_Operator } from "@sola_mpd/shared/src/models/filter_pb.js";

export function convertOperatorToDisplayName(
	operator: FilterCondition_Operator,
): string {
	switch (operator) {
		case FilterCondition_Operator.UNKNOWN:
			return "unknown";
		case FilterCondition_Operator.EQUAL:
			return "=";
		case FilterCondition_Operator.NOT_EQUAL:
			return "!=";
		case FilterCondition_Operator.CONTAIN:
			return "has";
		case FilterCondition_Operator.NOT_CONTAIN:
			return "!has";
		case FilterCondition_Operator.REGEX:
			return "=~";
		case FilterCondition_Operator.LESS_THAN:
			return "<";
		case FilterCondition_Operator.LESS_THAN_OR_EQUAL:
			return "<=";
		case FilterCondition_Operator.GREATER_THAN:
			return ">";
		case FilterCondition_Operator.GREATER_THAN_OR_EQUAL:
			return ">=";
		case FilterCondition_Operator.ADDED_SINCE:
			return "since";
	}
}

export function convertDisplayNameToOperator(
	str: string,
): FilterCondition_Operator {
	switch (str) {
		case "unknown":
			return FilterCondition_Operator.UNKNOWN;
		case "=":
			return FilterCondition_Operator.EQUAL;
		case "!=":
			return FilterCondition_Operator.NOT_EQUAL;
		case "has":
			return FilterCondition_Operator.CONTAIN;
		case "!has":
			return FilterCondition_Operator.NOT_CONTAIN;
		case "=~":
			return FilterCondition_Operator.REGEX;
		case "<":
			return FilterCondition_Operator.LESS_THAN;
		case "<=":
			return FilterCondition_Operator.LESS_THAN_OR_EQUAL;
		case ">":
			return FilterCondition_Operator.GREATER_THAN;
		case ">=":
			return FilterCondition_Operator.GREATER_THAN_OR_EQUAL;
		case "since":
			return FilterCondition_Operator.ADDED_SINCE;
		default:
			throw new Error(`Not supported operator: ${str}`);
	}
}

export function listAllFilterConditionOperators(): FilterCondition_Operator[] {
	// ADDED_SINCE is a server-side-only filter (MPD's "(added-since 'T')") used
	// by Recently Added's fast path. It is not exposed in user-facing filter
	// builders because its value must be a timestamp paired with tag=ADDED_AT,
	// which the Search UI does not surface today.
	return Object.keys(FilterCondition_Operator)
		.filter((v) => Number.isNaN(Number(v)))
		.map(
			(v) =>
				FilterCondition_Operator[v as keyof typeof FilterCondition_Operator],
		)
		.filter(
			(v) =>
				v !== FilterCondition_Operator.UNKNOWN &&
				v !== FilterCondition_Operator.ADDED_SINCE,
		);
}
