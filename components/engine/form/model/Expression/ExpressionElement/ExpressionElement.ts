import { Evaluation } from "../Expression.types";
import { BinaryOperation, UnaryOperation } from "../Expression.types";

/**
 * @class @abstract
 * @classdesc A virtual class that represents an expression element.
*/


export class ExpressionElement
{
	protected constructor() { }
	public toString(): string { return ""; }
	/**
	 * Creates a new instance of the class from a string
	 * @param inputString A string representation of the expression element.
	*/
	static fromString(inputString: string): ExpressionElement { throw new Error("Cannot instantiate virtual class ExpressionElement"); }
	/**
	 * Creates an empty instance of the class
	*/
	static empty(): ExpressionElement { throw new Error("Cannot instantiate virtual class ExpressionElement"); }

	/**
	 * Array of string representations of binary operators and functions to compute the operation's value, in order of precedence.
	 * @example
	 * ```
	 * const [operator, operation] = DerivedElement.unaryOperators[0];
	 * const result = operation(left, right);
	 * ```
	*/
	static binaryOperators: [string, BinaryOperation<any>][] = [];
	/**
	 * Array of string representations of unary operators and functions to compute the operation's value, in order of precedence.
	 * @example
	 * ```
	 * const [operator, operation] = DerivedElement.unaryOperators[0];
	 * const result = operation(operand);
	 * ```
	*/
	static unaryOperators: [string, UnaryOperation<any>][] = [];
	/**
	 * Evaluates the expression with the given variables
	*/
	evaluate(variables: Record<string, number>): Evaluation<any> { return null as never; }
}
;
