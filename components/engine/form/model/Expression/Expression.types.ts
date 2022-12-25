import { Condition } from "./ExpressionElement/Condition";
import { Computation } from "./ExpressionElement/Computation";
import { ExpressionElement } from "./ExpressionElement/ExpressionElement";


export type BinaryOperation<T extends ExpressionElement> = (left: Evaluation<T>, right: Evaluation<T>) => Evaluation<T>;
export type UnaryOperation<T extends ExpressionElement> = (operand: Evaluation<T>) => Evaluation<T>;

export namespace Operators
{
	export namespace Condition
	{
		export enum Binary
		{
			AND = "&&",
			OR = "||",
			XOR = "^^",
		};
		export enum Unary
		{
			NOT = "~",
		}
	}
	export namespace Computation
	{
		export enum Binary
		{
			ADDITION = "+",
			SUBTRACTION = "-",
			MULTIPLICATION = "*",
			DIVISION = "/",
			EXPONENTIATION = "^",
			ROOT = "√",
		}
		export enum Unary
		{
			NEGATION = "-",
			FACTORIAL = "!",
		}
	}
	export const UNDEFINED_BINARY = "B";
	export const UNDEFINED_UNARY = "U";
}

export enum Separator
{
	EXPRESSION = "  ",
	CONDITION = "<-->",
}

export enum Comparator
{
	UNDEFINED = "",
	EQUAL = "==",
	NOT_EQUAL = "!=",
	LESS_THAN = "<",
	LESS_THAN_OR_EQUAL = "<=",
	GREATER_THAN = ">",
	GREATER_THAN_OR_EQUAL = ">=",
}


export type Evaluation<T extends ExpressionElement> =
	T extends Condition ? boolean
	: T extends Computation ? number
	: never;

