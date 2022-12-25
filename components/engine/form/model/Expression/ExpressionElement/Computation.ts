import { string } from "mathjs";
import { Condition } from "./Condition";
import { BinaryOperation, UnaryOperation } from "../Expression.types";
import { ExpressionElement } from "./ExpressionElement";
import { Evaluation, Operators } from "../Expression.types";

export class Computation extends ExpressionElement 
{
	protected constructor(public _preValue: string)
	{ super(); }

	get preValue(): string
	{
		return this._preValue;
	}

	/**
	 * Returns a new instance of the class with `preValue` set to the input string.
	 * @param inputString The `preValue` that can be either: 
	 *  - A string formatted as `$type:name$` interpreted as a variable, where `name` is the variable name and `type` is the variable type.  
	 *  - A string not terminated by dollar signs interpreted as a constant.
	 * 	- Empty string, interpreted as `null`, meaning the value hasn't been set.
	 * 
	 * **The variable name cannot begin with a number, must only contain lowercase letters, numbers and underscores, and must not be a reserved word.**
	 * @throws If there's a `$` mismatch when passing a string representing a variable.
	*/
	setPreValue(value: string): Computation
	{
		return Computation.fromString(value);
	}

	public override evaluate(variables: Record<string, number>): Evaluation<Computation>
	{
		return 1 ^ 0;
	}

	/**
	 * Returns the `preValue`.
	*/
	public toString(): string
	{
		return this.preValue;
	}

	/**
	 * Returns a new instance of `Computation` with `preValue` initialized to an empty string. 
	*/
	public static override empty(): Computation
	{
		return new Computation("");
	}

	/**
	 * Returns a new instance of the class with `preValue` set to the input string.
	 * @param inputString The `preValue` that can be either: 
	 *  - A string formatted as `$type:name$` interpreted as a variable, where `name` is the variable name and `type` is the variable type.  
	 *  - A string not terminated by dollar signs interpreted as a constant.
	 * 	- Empty string, interpreted as `null`, meaning the value hasn't been set.
	 * 
	 * **The variable name cannot begin with a number, must only contain lowercase letters, numbers and underscores, and must not be a reserved word.**
	 * @throws If there's a `$` mismatch when passing a string representing a variable.
	*/
	public static override fromString(inputString: string): Computation
	{
		if ((!inputString.match(/^[1-9][0-9]*(\.|,)?[0-9]*$/) && !inputString.match(/^\$number:[a-z_]+[a-z_0-9]*\$$/)))
		{
			throw new Error("Invalid new preValue: " + inputString);
		}
		return new Computation(inputString);
	}


	public static override readonly binaryOperators: [Operators.Computation.Binary, BinaryOperation<Computation>][] = [
		[Operators.Computation.Binary.ADDITION, (a, b) => a + b],
		[Operators.Computation.Binary.SUBTRACTION, (a, b) => a - b],
		[Operators.Computation.Binary.MULTIPLICATION, (a, b) => a * b],
		[Operators.Computation.Binary.DIVISION, (a, b) => a / b],
		[Operators.Computation.Binary.EXPONENTIATION, (a, b) => a ^ b],
		[Operators.Computation.Binary.ROOT, (a, b) => a ** (1 / b)],
	]
	public static override readonly unaryOperators: [Operators.Computation.Unary, UnaryOperation<Computation>][] = [
		[Operators.Computation.Unary.NEGATION, a => -a],
		[Operators.Computation.Unary.FACTORIAL, a => a],
	]
}