import { faker } from '@faker-js/faker';
import { e, pickRandom, randomInt, randomIntDependencies } from 'mathjs';
import { Expression } from './Expression';
import { Comparator, Operators, Separator } from './Expression.types';
import { Computation } from './ExpressionElement/Computation';
import { Condition } from './ExpressionElement/Condition';
import { ExpressionElement } from './ExpressionElement/ExpressionElement';

const STRESS_TEST = process.env.NODE_ENV === 'test' ? 1 : 10000;
function getRandomComputationValue(oneInXChanceForVariable = 2)
{
	return randomInt(0, oneInXChanceForVariable) ? (faker.random.numeric(randomInt(1, 4)) + (!!randomInt(0, 2) ? `.${faker.random.numeric(2)}` : '')) : `$number:${faker.random.alpha().toLowerCase().replace(/ /g, '_')}$`;
}
const getRandomConditionValues = (): [string, Comparator, string] =>
{
	let left = getRandomComputationValue()
	let right = getRandomComputationValue(4);

	let comparator = Object.values(Comparator)[pickRandom([0, 1, 2, 3, 4, 5, 6], 1) as number];
	return [left, comparator, right]
}

function getRandomComputationExpression(currentDepth = 0, maxDepth = 10): Expression<Computation>
{
	const expression = Expression.empty<Computation>(Computation);
	for (let i = 0; i < randomInt(1, 10); i++)
	{
		expression.setElement(
			expression.size,
			(currentDepth < maxDepth && !!randomInt(0, 2))
				? getRandomComputationExpression(currentDepth + 1, maxDepth)
				: Computation.fromString(getRandomComputationValue()),
		);
		if (expression.size > 1)
			expression.setBinaryOperator(
				expression.size - 2,
				Object.values(Operators.Computation.Binary)[pickRandom([0, 1, 2, 3, 4, 5], 1) as number] as Operators.Computation.Binary
			)

		expression.setUnaryOperator(
			expression.size - 1,
			!!randomInt(0, 3)
				? Object.values(Operators.Computation.Unary)[pickRandom([0, 1], 1) as number] as Operators.Computation.Unary
				: null
		)
	}
	return expression;
}

function getRandomCondition(currentDepth = 0, maxDepth = 10)
{

	const type = randomInt(0, 2) ? 'number' : randomInt(0, 2) ? 'string' : 'date';

	let left: string, right: string;

	if (type === 'number')
	{
		left = randomInt(0, 4) ? `${getRandomComputationExpression(currentDepth, maxDepth)}` : `U[${Computation.fromString(getRandomComputationValue())}]`;
		right = randomInt(0, 4) ? `${getRandomComputationExpression(currentDepth, maxDepth)}` : `U[${Computation.fromString(getRandomComputationValue())}]`;
	}
	else if (type === 'string')
	{
		const randomLeft = faker.random.alpha(randomInt(2, 10));
		const randomRight = faker.random.alpha(randomInt(2, 10));

		left = randomInt(0, 2) ? `${randomLeft}` : `$string:${randomLeft}$`;
		right = randomInt(0, 2) ? `${randomRight}` : `$string:${randomRight}$`;
	}
	else
	{
		left = randomInt(0, 2) ? faker.date.past().toLocaleDateString() : `$date:${faker.random.alpha(randomInt(2, 10))}$`;
		right = randomInt(0, 2) ? faker.date.past().toLocaleDateString() : `$date:${faker.random.alpha(randomInt(2, 10))}$`;
	}

	const comparator = Object.values(Comparator)[pickRandom([0, 1, 2, 3, 4, 5, 6], 1) as number];
	return Condition.fromString(`{${left.toString()}<-->{${comparator.toString()}}<-->{${right.toString()}}`);
}

function getRandomConditionExpression(currentDepth = 0, maxDepth = 10): Expression<Condition>
{
	const expression = Expression.empty<Condition>(Condition);
	for (let i = 0; i < 2; i++)
	{
		expression.setElement(
			expression.size,
			(currentDepth < maxDepth && !!randomInt(0, 2))
				? getRandomConditionExpression(currentDepth + 1, maxDepth)
				: getRandomCondition(currentDepth + 1, maxDepth + 1),
		);
		if (expression.size > 1)
			expression.setBinaryOperator(
				expression.size - 2,
				Object.values(Operators.Condition.Binary)[pickRandom([0, 1, 2], 1) as number] as Operators.Condition.Binary,
			)

		expression.setUnaryOperator(
			expression.size - 1,
			!!randomInt(0, 3)
				? Object.values(Operators.Condition.Unary)[pickRandom([0, 1], 1) as number] as Operators.Condition.Unary
				: null
		)
	}
	return expression;
}


describe(
	'\nExpression\n',
	() =>
	{
		describe('Should never throw on correct data', () =>
		{
			it('', () => { });
		});
		describe('Should throw on incorrect data', () =>
		{
			it('.fromString() should throw if the input string contains invalid operators', () =>
			{
				const type = !!randomInt(0, 2) ? 'Condition' : 'Computation';

				let expressionString = (type === 'Condition' ? getRandomConditionExpression : getRandomComputationExpression)(0, 2).toString();
				const operators = Object.values(Operators[type].Binary).concat(Object.values(Operators[type].Unary));

				let newExpressionString: string = expressionString;
				do
				{
					newExpressionString = expressionString.replace(
						new RegExp(
							`\\${operators[pickRandom(operators.map((op, index) => index), 1) as number]}`,
						),
						faker.random.alpha(2).toUpperCase()
					);
				}
				while (newExpressionString == expressionString);


				if (type === 'Condition')
					expect(() => Expression.fromString<Condition>(Condition, newExpressionString)).toThrow();
				else
					expect(() => Expression.fromString<Computation>(Computation, newExpressionString)).toThrow();

			})
			it('setBinaryOperator() and setUnaryOperator() should throw if the operator doesn\'t match the type of the expression element', () =>
			{
				let operator = faker.random.alphaNumeric(randomInt(1, 3));
				while (Object.values(Operators.Condition.Binary).includes(operator as any) || Object.values(Operators.Condition.Binary).includes(operator as any))
					operator = faker.random.alphaNumeric(randomInt(1, 3));

				let expression = (randomInt(0, 1) ? getRandomComputationExpression : getRandomConditionExpression)(0, 2);
				expect(() => expression.setBinaryOperator(randomInt(0, expression.size - 1), operator as any)).toThrow();


				operator = faker.random.alphaNumeric(randomInt(1, 3));
				while (Object.values(Operators.Condition.Unary).includes(operator as any) || Object.values(Operators.Condition.Unary).includes(operator as any))
					operator = faker.random.alphaNumeric(randomInt(1, 3));

				expression = (randomInt(0, 1) ? getRandomComputationExpression : getRandomConditionExpression)(0, 2);
				expect(() => expression.setUnaryOperator(randomInt(0, expression.size), operator as any)).toThrow();
			});


		});
	}
);
describe(
	'\nExpression<Computation>\n',

	() =>
	{
		describe('Should never throw on correct data', () =>
		{
			let strings: string[] = [];
			let expressions: Expression<Computation>[] = [];

			for (let i = 0; i < STRESS_TEST; i++)
				expressions.push(getRandomComputationExpression(0, 2));

			it('.toString() shouldn\'t throw an error', () =>
			{
				for (let i = 0; i < STRESS_TEST; i++)
					expect(() => strings.push(expressions[i].toString())).not.toThrow()
			});
			it('.fromString() shouldn\'t throw an error', () =>
			{
				for (let i = 0; i < STRESS_TEST; i++)
					expect(() => Expression.fromString<Computation>(Computation, strings[i])).not.toThrow()
			})
		})
		describe('Should throw on incorrect data', () =>
		{

			const incorrectStrings: string[] = [];


			const breakableChars =
				(Object.values(
					Operators.Computation.Binary,
				) as string[])
					.concat(
						Object.values(
							Operators.Computation.Unary
						) as string[]
					).concat(
						'(', ')', '[', ']'
					)



			for (let i = 0; i < STRESS_TEST; i++)
			{

				const correct = getRandomComputationExpression(0, 2).toString()
				let incorrect = correct;
				do
				{
					incorrect = correct.replace(
						new RegExp(
							`\\${breakableChars[randomInt(0, breakableChars.length)]}`
						),
						faker.random.alpha(1).toUpperCase()
					)
				}
				while (incorrect === correct)


				incorrectStrings.push(incorrect)
			}

			it('.fromString() should throw an error', () =>
			{
				for (let i = 0; i < STRESS_TEST; i++)
					expect(() => Expression.fromString<Computation>(Computation, incorrectStrings[i])).toThrow()
			});
		});

		describe('Should behave as documented', () =>
		{
			const strings: string[] = [];
			const expressions: Expression<Computation>[] = [];

			for (let i = 0; i < STRESS_TEST; i++)
			{
				expressions.push(getRandomComputationExpression(0, 2));
				strings.push(expressions[i].toString());
			}

			it('.fromString() should return the same expression as the one serialized by .toString()', () =>
			{
				for (let i = 0; i < STRESS_TEST; i++)
				{
					expect(Expression.fromString<Computation>(Computation, strings[i])).toStrictEqual(expressions[i])
				}
			});

		});
	}
)
describe(
	'\nExpression<Condition>\n',
	() =>
	{
		describe('Should never throw on correct data', () =>
		{
			let strings: string[] = [];
			let expressions: Expression<Condition>[] = [];

			for (let i = 0; i < STRESS_TEST; i++)
				expressions.push(getRandomConditionExpression(0, 2));

			it('.toString() shouldn\'t throw an error', () =>
			{
				for (let i = 0; i < STRESS_TEST; i++)
					expect(() => strings.push(expressions[i].toString())).not.toThrow()
			});
			it('.fromString() shouldn\'t throw an error', () =>
			{
				for (let i = 0; i < STRESS_TEST; i++)
					expect(() => Expression.fromString<Condition>(Condition, strings[i])).not.toThrow()
			})
		})
		describe('Should throw on incorrect data', () =>
		{

			const incorrectStrings: string[] = [];


			const breakableChars =
				(Object.values(
					Operators.Condition.Binary,
				) as string[])
					.concat(
						Object.values(
							Operators.Condition.Unary
						) as string[]
					).concat(
						'(', ')', '[', ']',
					)



			for (let i = 0; i < STRESS_TEST; i++)
			{

				const correct = getRandomConditionExpression(0, 2).toString()
				let incorrect = correct;
				do
				{
					incorrect = correct.replace(
						new RegExp(
							`\\${breakableChars[randomInt(0, breakableChars.length)]}`
						),
						faker.random.alpha(1).toUpperCase()
					)
				}
				while (incorrect === correct)

				incorrectStrings.push(incorrect)
			}

			it('.fromString() should throw an error', () =>
			{
				for (let i = 0; i < STRESS_TEST; i++)
					expect(() => Expression.fromString<Condition>(Condition, incorrectStrings[i])).toThrow()
			});
		});

		describe('Should behave as documented', () =>
		{
			const strings: string[] = [];
			const expressions: Expression<Condition>[] = [];

			for (let i = 0; i < STRESS_TEST; i++)
			{
				expressions.push(getRandomConditionExpression(0, 2));
				strings.push(expressions[i].toString());
			}

			it('.fromString() should return the same expression as the one serialized by .toString()', () =>
			{
				for (let i = 0; i < STRESS_TEST; i++)
				{
					expect(Expression.fromString<Condition>(Condition, strings[i])).toStrictEqual(expressions[i])
				}
			})

		});


	}
)
describe(
	'\nComputation class\n',
	() =>
	{

		it('Should correctly parse string', () =>
		{

			for (let i = 0; i < STRESS_TEST; i++)
			{
				let value = getRandomComputationValue();
				let expression = Computation.fromString(value);

				expect(expression.preValue).toBe(value);
			}
		});
	}
)
describe(
	'\nCondition class\n',
	() =>
	{
		it('.fromString() should correctly parse correct string', () =>
		{

			for (let i = 0; i < STRESS_TEST; i++)
			{
				const [left, comparator, right] = getRandomConditionValues();

				let expression = Condition.fromString(`{U[${left}]}<-->{${comparator}}<-->{U[${right}}]`);

				expect(expression.left).toStrictEqual(Expression.fromString<Computation>(Computation, `U[${left}]`));
				expect(expression.right).toStrictEqual(Expression.fromString<Computation>(Computation, `U[${right}]`));

				expect(expression.comparator).toBe(comparator);
			}
		});
		it('.fromString() should throw when parsing incorrect string', () =>
		{
			const correct = getRandomCondition(0, 2).toString();
			const breakableChars = (Object.values(Comparator) as string[]).concat('{', '}', Separator.CONDITION);

			let incorrect = correct;
			do
			{
				correct.replace(
					new RegExp(
						`\\${breakableChars[randomInt(0, breakableChars.length)]}`,
					),
					faker.random.alpha(1)
				)
			}
			while (incorrect == correct)


			for (let i = 0; i < STRESS_TEST; i++)
			{
				expect(
					() => Condition.fromString(incorrect)
				).toThrow();
			}
		})
	}
)