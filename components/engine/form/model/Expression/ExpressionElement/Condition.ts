import { BinaryOperation, Separator, UnaryOperation } from "../Expression.types";
import { ExpressionElement } from "./ExpressionElement";
import { Comparator, Evaluation, Operators } from "../Expression.types";
import { Computation } from "./Computation";
import { Expression } from "../Expression";
import { i } from "mathjs";


export class Condition extends ExpressionElement
{
	private constructor(
		private _left: string,
		private _comparator: Comparator,
		private _right: string,
		private _type: 'number' | 'string' | 'date' = "number")
	{ super(); }

	get type(): 'number' | 'string' | 'date'
	{ return this._type; }
	get left(): Expression<Computation> | string | Date
	{
		if (this.type === 'date')
			return new Date(this._left);
		if (this.type === 'number')
			return Expression.fromString<Computation>(Computation, this._left);
		return this._left;
	}
	get right(): Expression<Computation> | string | Date
	{
		if (this.type === 'date')
			return new Date(this._right);
		if (this.type === 'number')
			return Expression.fromString<Computation>(Computation, this._right);
		return this._right;
	}
	get comparator(): Comparator
	{ return this._comparator; }


	setComparator(value: Comparator)
	{
		if (Object.values(Comparator).indexOf(value) === -1)
			throw new Error("Invalid comparator: " + value);
		this._comparator = value;
		return new Condition(this._left, value, this._right, this._type);
	}
	setLeft(value: Expression<Computation> | string | Date)
	{
		if (this.type === 'date' && (!(value instanceof Date) && !(value as string).match(/^\$date:[a-z_]+[a-z_0-9]*\$$/)))
			throw new Error("Invalid date: " + value);
		if (this.type === 'number' && (!(value instanceof Expression<Computation>) && !(value as string).match(/^\$number:[a-z_]+[a-z_0-9]*\$$/)))
			throw new Error("Invalid Expression<Computation>: " + value);
		if (this.type === 'string' && (typeof value !== 'string' || !(value as string).match(/^\$number:[a-z_]+[a-z_0-9]*\$$/)))
			throw new Error("Invalid string: " + value);

		this._left = value instanceof Date ? (value.toDateString()) : value as string;
		return new Condition(this._left, this._comparator, this._right, this._type);
	}
	setRight(value: Expression<Computation> | string | Date)
	{
		if (this.type === 'date' && (!(value instanceof Date) && !(value as string).match(/^\$date:[a-z_]+[a-z_0-9]*\$$/)))
			throw new Error("Invalid date: " + value);
		if (this.type === 'number' && (!(value instanceof Expression<Computation>) && !(value as string).match(/^\$number:[a-z_]+[a-z_0-9]*\$$/)))
			throw new Error("Invalid Expression<Computation>: " + value);
		if (this.type === 'string' && (typeof value !== 'string' || !(value as string).match(/^\$number:[a-z_]+[a-z_0-9]*\$$/)))
			throw new Error("Invalid string: " + value);

		this._right = value instanceof Date ? (value.toDateString()) : value as string;
		return new Condition(this._left, this._comparator, this._right, this._type);
	}

	public override evaluate(variables: Record<string, number>): Evaluation<Condition>
	{

		return true;
	}

	/**
	 * Returns a string representation of the condition in the format `"left comparator right"`.
	*/
	public toString(): string
	{
		return `{${this._left}}<-->{${this.comparator}}<-->{${this._right}}`;
	}

	/**
	 * Returns a new instance of `Condition` with `right`, `left` and `comparator` set to empty strings. 
	*/
	public static override empty(_type: 'number' | 'string' | 'date' = 'number'): Condition
	{
		return new Condition(
			'',
			Comparator.UNDEFINED,
			'',
			_type
		);
	}

	/**
	 * Returns a new instance of the class with `right`, `left` and `comparator`
	 * set to the values parsed from the input string,
	 * formatted as `Expression<Computation>`.
	 * 
	 * **Only use for deserialization.**
	 * 
	 * @param inputString  The string to parse. It must be in the format 
	 * `"{left}<-->{comparator}<-->{right}"`, * where `comparator` is a value
	 *  of the `Comparator` enum and `left` and `right` are formatted as:
	 * - `Expression<Computation>`,  e.g. `"U[$test$] + ~[2]"`
	 * - `string`, e.g. `"test"`, evaluating to `"test"` or `"$test$"`, evaluating to the value of the variable `test`
	 * - `Date`, e.g. `"2021-01-01"`, evaluating to `Date("2021-01-01")` or `"$test$"`, evaluating to the value of the variable `test`
	 *
	 * The first formatting is used for number comparisons, the second for string comparisons and the third for date comparisons. Both sides must be formatted the same way. 
	 * 
	 * **Note:** The string must be formatted as described above, otherwise an error will be thrown.
	 * 
	 * 
	 * @example
	 * ```ts
	 * const condition = Condition.fromString("{U[$test$]+ U[2]}<-->{>}<-->{U[4.20]}"); 
	 * ```
	*/

	public static override fromString(inputString: string): Condition
	{
		inputString = inputString.trim();
		if (inputString.split(Separator.CONDITION).length !== 3)
			throw new Error("Invalid input string: " + inputString);

		const [leftString, comparator, rightString] = inputString.replace(/[{}]/g, '').split(Separator.CONDITION);

		let type: 'number' | 'date' | 'string' = 'number';


		if (leftString === undefined || comparator === undefined || rightString === undefined)
			throw new Error("Invalid input string: " + inputString);
		if (!Object.values(Comparator).includes(comparator as Comparator))
			throw new Error("Invalid comparator: " + comparator);


		if (
			(
				['(', Operators.UNDEFINED_UNARY].includes(leftString[0] as any) || Object.values(Operators.Computation.Unary).includes(leftString[0] as any)
			)
			&&
			(
				['(', Operators.UNDEFINED_UNARY].includes(rightString[0] as any) || Object.values(Operators.Computation.Unary).includes(rightString[0] as any)
			)
		)
		{
			try
			{
				Expression.fromString<Computation>(Computation, leftString);
				Expression.fromString<Computation>(Computation, rightString);
			}
			catch (e)
			{
				console.log(e);
				throw new Error("Invalid input string (invalid Expressions): " + inputString);
			}
			type = 'number';
		}
		else if (
			(leftString.match(/^\$date:[a-z_]+[a-z_0-9]*\$$/) && !!Date.parse(rightString))
			|| (leftString.match(/^\$date:[a-z_]+[a-z_0-9]*\$$/) && leftString.match(/^\$date:[a-z_]+[a-z_0-9]*\$$/))
		)
		{
			type = 'date';
		}
		else if (
			leftString.match(/^\$string:[a-z_]+[a-z_0-9]*\$$/) || leftString.match(/^.+$/)
			&& rightString.match(/^\$string:[a-z_]+[a-z_0-9]*\$$/) || rightString.match(/^.+$/)
		)
		{
			type = 'string';
		}
		else
			throw new Error("Invalid input string: " + inputString + "\n Both sides must be of same type.");

		return new Condition(
			leftString,
			comparator as Comparator,
			rightString,
			'number'
		);
	}


	public static override readonly binaryOperators: [Operators.Condition.Binary, BinaryOperation<Condition>][] =
		[
			[Operators.Condition.Binary.AND, (op1: Evaluation<Condition>, op2: Evaluation<Condition>) => op1 && op2],
			[Operators.Condition.Binary.OR, (op1: Evaluation<Condition>, op2: Evaluation<Condition>) => op1 || op2],
			[Operators.Condition.Binary.XOR, (op1: Evaluation<Condition>, op2: Evaluation<Condition>) => Boolean(Number(op1) ^ Number(op2))]
		]
	public static override readonly unaryOperators: [Operators.Condition.Unary, UnaryOperation<Condition>][] =
		[
			[Operators.Condition.Unary.NOT, (op: Evaluation<Condition>) => !op]
		]
}
