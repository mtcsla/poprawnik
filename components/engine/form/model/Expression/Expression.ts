import { Condition } from "./ExpressionElement/Condition";
import { Computation } from "./ExpressionElement/Computation";
import { Evaluation, Operators } from "./Expression.types";
import { Calculate } from "@mui/icons-material";
import { ExpressionElement } from "./ExpressionElement/ExpressionElement";
import { cloneDeep, unary } from "lodash";

export class Expression<T extends ExpressionElement>
{
	private constructor(private Element: any, private _elements: (T | Expression<T>)[], private _binaryOperators: string[], private _unaryOperators: string[])
	{
		if (_elements.length != _binaryOperators.length + 1 && (_elements.length != 0 && _binaryOperators.length != 0))
			throw new Error("Invalid number of binary operators.\n" + "Binary operators: " + _binaryOperators.toString() + "\nElements: " + _elements.toString());
		if (_elements.length != _unaryOperators.length)
			throw new Error("Invalid number of unary operators \n" + "Unary operators: " + _unaryOperators.toString() + "\nElements: " + _elements.toString());
	}

	get elements(): (T | Expression<T>)[]
	{ return cloneDeep(this._elements); }
	get binaryOperators(): string[]
	{ return cloneDeep(this._binaryOperators); }
	get unaryOperators(): string[]
	{ return cloneDeep(this._unaryOperators); }

	get size(): number
	{ return this._elements.length; }

	public setElement(index: number, value: (T | Expression<T> | null)): Expression<T>
	{
		if (index < 0 || index > this._elements.length)
			throw new Error("Invalid index: " + index);
		else if (value == null)
		{
			this._elements.splice(index, 1);
			this._unaryOperators.splice(index, 1);
			if (index < this._binaryOperators.length)
				this._binaryOperators.splice(index, 1);
		}
		else if (index == this._elements.length)
		{
			this._elements.push(value);
			this._unaryOperators.push(Operators.UNDEFINED_UNARY);
			if (index > 0)
				this._binaryOperators.push(Operators.UNDEFINED_BINARY);
		}
		else if (index >= 0 || index < this._elements.length)
			this._elements[index] = value;
		return new Expression<T>(this.Element, this._elements, this._binaryOperators, this._unaryOperators);
	}

	public setBinaryOperator(index: number, value: string): Expression<T>
	{
		const allowedOperators = this.Element.binaryOperators.map((item: [string, any]) => item[0]);
		if (!allowedOperators.includes(value))
			throw new Error(`The binary operator ${value} is not allowed. Allowed binary operators: ${allowedOperators}`);


		if (index < 0 || index >= this._binaryOperators.length)
			throw new Error("Invalid index: " + index);
		if (!value)
			throw new Error("Invalid value: " + value);

		this._binaryOperators[index] = value;
		return new Expression<T>(this.Element, this._elements, this._binaryOperators, this._unaryOperators);
	}
	public setUnaryOperator(index: number, value: string | null): Expression<T>
	{

		const allowedOperators = this.Element.unaryOperators.map((item: [string, any]) => item[0]);
		if (!allowedOperators.includes(value) && value != null)
			throw new Error(`The unary operator ${value} is not allowed. Allowed unary operators: ${allowedOperators}`);

		if (index < 0 || index >= this._unaryOperators.length)
			throw new Error("Invalid index: " + index);
		if (value != null && !value)
			throw new Error("Invalid value: " + value);
		if (value == null)
			value = Operators.UNDEFINED_UNARY;

		this._unaryOperators[index] = value;
		return new Expression<T>(this.Element, this._elements, this._binaryOperators, this._unaryOperators);
	}

	/**
	 * Transforms the expression into a string representation and returns it.
	 * 
	 * @example
	 * ```
	 * const expression = new Expression<Condition>(Condition, [
	 * 		new Condition("test", ">", 121),
	 * 		new Condition("test", "<", 3)], 
	 * 		["&&"], 
	 * 		[
	 * 			Operators.UNDEFINED_UNARY,
	 * 			Operators.UNDEFINED_UNARY
	 *  	 	]
	 * ]);
	 * console.log(expression.toString());
	 * ```
	*/
	public toString(): string
	{
		for (const operator of this.binaryOperators)
		{
			if (operator === Operators.UNDEFINED_BINARY)
				throw new Error(`One of the operators is undefined in expression: ${this}`);
		}

		let result = "";

		this.elements.forEach((element, index) =>
		{
			if (this.unaryOperators[index] != null)
				result += this.unaryOperators[index];
			else
				result += "u";

			if (element instanceof this.Element)
				result += `[${element.toString()}]`;
			else
				result += `(${element.toString()})`;
			if (index < this.binaryOperators.length)
				result += `  ${this.binaryOperators[index]}  `;
		});

		return result;
	}

	public evaluate(): Evaluation<T>
	{
		for (const operator of this.binaryOperators)
		{
			if (operator === Operators.UNDEFINED_BINARY)
				throw new Error(`One of the operators is undefined in expression: ${this}`);
		}

		return this.Element.empty().evaluate();
	}

	/**
	 * Parses a string and returns an instance of the class. **Use only for deserialization**.
	 * 
	 * @template T The type of the expression element.
	 * @param Element The class of the expression element. Must be the same as the type parameter `T`.
	 * @param inputString A string representation of the expression.
	 * 
	 * @example
	 * ```
	 * const expression = Expression.fromString<Condition>(Condition, "[{$test$}⋅{>}⋅{121}]  &&  [{$test$}⋅{<}⋅{3}]");
	 * ```
	*/
	public static fromString<T extends ExpressionElement>(Element: any, inputString: string): Expression<T>
	{
		const elements: (T | Expression<T>)[] = [];

		const binaryOperators: string[] = [];
		const unaryOperators: string[] = [];

		const brackets: number[] = [];
		const parentheses: number[] = [];

		for (let i = 0; i < inputString.length; i++)
		{
			if (brackets.length == 0) // Skips brackets if parentheses are open
			{
				if (inputString[i] == "(")
					parentheses.push(i);
				else if (inputString[i] == ")")
				{
					const start = parentheses.pop();
					if (start == null)
						throw new Error(`A closing parentheses at index ${i} is missing its pair in input string: ${inputString}`);
					else if (parentheses.length == 0)
					{
						const tempString = [...inputString]
						const newExpression = tempString.splice(start, i - start + 1, " ").slice(1, -1).join("");
						inputString = tempString.join("");

						i = start;

						elements.push(Expression.fromString<T>(Element, newExpression));
					}
				}
			}
			if (parentheses.length == 0) // Skips parentheses if brackets are open
			{
				if (inputString[i] == "[")
					brackets.push(i);
				else if (inputString[i] == "]")
				{
					const start = brackets.pop();
					if (start == null)
						throw new Error(`A closing bracket at index ${i} is missing its pair in input string: ${inputString}`);
					else if (brackets.length == 0)
					{
						const tempString = [...inputString]
						const newElement = tempString.splice(start, i - start + 1, " ").slice(1, -1).join("");
						inputString = tempString.join("");

						i = start;


						elements.push(Element.fromString(newElement));
					}
				}
			}
		}


		if (brackets.length != 0)
			throw new Error("Invalid bracket pairing in input string: " + inputString);
		if (parentheses.length != 0)
			throw new Error("Invalid parenthesis pairing in input string: " + inputString);




		binaryOperators.push(
			...(inputString.match(/  [^ ]+  /g)?.filter(item => item != '')?.map(item => item.trim()) ?? [])
		);
		inputString = inputString.replace(/  [^ ]+  /g, "");

		unaryOperators.push(
			...(inputString.match(/[^ ]+ /g)?.filter(item => item != '')?.map(item => item.trim()) ?? [])
		);
		inputString = inputString.replace(/[^ ]+ /g, "");

		const allowedBinary = Element.binaryOperators.map(([operator, _]: [string, any]) => operator)
		const allowedUnary = Element.unaryOperators.map(([operator, _]: [string, any]) => operator).concat(Operators.UNDEFINED_UNARY);


		for (const binaryOp of binaryOperators)
			if (!allowedBinary.includes(binaryOp))
				throw new Error(`The binary operator ${binaryOp} is not allowed. Allowed binary operators: ${allowedBinary}`);
		for (const unaryOp of unaryOperators)
			if (!allowedUnary.includes(unaryOp) && allowedUnary)
				throw new Error(`The binary operator ${unaryOp} is not allowed. Allowed binary operators: ${allowedUnary}`);

		return new Expression<T>(Element, elements, binaryOperators, unaryOperators);
	}
	/**
	 * Creates an empty instance of the class.
	 * @template T The type of the expression element.
	 * @param Element The class of the expression element. Must be the same as the type parameter `T`.
	*/
	public static empty<T extends ExpressionElement>(Element: any): Expression<T>
	{
		return new Expression<T>(Element, [], [], []);
	}
}
