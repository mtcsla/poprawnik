import { faker } from "@faker-js/faker";
import {
  StepDescription,
  FragmentDescription,
  FieldValueType,
  FieldType,
  FormDescription,
} from "../../providers/FormDescriptionProvider/FormDescriptionProvider";
import {
  Condition,
  ConditionCalculationSequence,
  ConditionValue,
} from "../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider";
import { randomInt } from "mathjs";
import {
  comparatorsText,
  Operator,
} from "../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider";
import { formControlClasses } from "@mui/material";

export namespace FormRandom {
  export const emptyStep = (isList: boolean): StepDescription => ({
    subtitle: faker.company.catchPhrase(),
    type: !isList ? "step" : "list",
    name: !isList
      ? ""
      : faker.unique(() => faker.random.alphaNumeric(25), undefined, {
          maxRetries: 500,
          maxTime: 1000,
        }),
    children: [FormRandom.emptyFragment()],
  });
  export const emptyFragment = (): FragmentDescription => ({
    title: faker.company.bs(),
    subtitle: faker.company.catchPhrase(),
    icon: "",
    children: [],
  });
  export const conditionElement = (names: Name[]) => {
    const variable = faker.helpers.arrayElement(names);
    let comparators =
      variable.valueType !== "text"
        ? ["==", "!=", ">=", ">", "<=", "<"]
        : ["==", "!="];
    if (!variable.required || variable.condition)
      comparators = comparators.concat(["exists", "not-exists"]);
    const comparator = faker.helpers.arrayElement(comparators);

    const type =
      !randomInt(0, 2) ||
      names.filter((name) => name.type === variable.type).length < 2
        ? "constant"
        : "variable";
    const value =
      type === "constant"
        ? variable.valueType === "text"
          ? variable.type === "text"
            ? faker.random.alphaNumeric(20)
            : faker.helpers.arrayElement(variable.options)
          : variable.type === "date"
          ? faker.date.recent(365)
          : parseInt(faker.random.numeric(20))
        : faker.helpers.arrayElement(
            names.filter((name) => name.type === variable.type)
          ).name;
    return {
      variable: variable.name,
      comparator,
      value: { type, value } as ConditionValue,
    } as Condition;
  };
  export const condition = (
    names: Name[],
    short?: true,
    nesting?: true
  ): ConditionCalculationSequence => {
    const sequence: ConditionCalculationSequence = {
      components: [],
      operators: [],
    };
    const elementsNumber = randomInt(2, short ? 5 : 9);

    if ((!!randomInt(0, 7) && !nesting) || !names.length) return sequence;

    for (let i = 0; i < elementsNumber; i += 1) {
      const newCondition: Condition = {
        variable: null,
        comparator: null,
        value: {
          type: null,
          value: null,
        },
      };

      sequence.components.push(
        !!randomInt(0, 4)
          ? FormRandom.conditionElement(names)
          : FormRandom.condition(
              names,
              randomInt(0, 3) ? true : undefined,
              true
            )
      );
      sequence.operators.push(
        faker.helpers.arrayElement(["&", "|", "§"]) as Operator
      );
    }
    sequence.operators[sequence.operators.length - 1] = null;

    return sequence;
  };

  type Name = {
    name: string;
    valueType: FieldValueType;
    type: FieldType;
    list: null | number;
    required: boolean;
    condition: boolean;
    options: string[];
  };
  export const formDescription = (): FormDescription => {
    const names: Name[] = [];
    const usedNames: Name[] = [];

    const currFragmentNames: Name[] = [];

    for (let i = 0; i < randomInt(70, 100); i += 1) {
      const type: FieldType = !randomInt(0, 2)
        ? "text"
        : !randomInt(0, 2)
        ? "select"
        : "date";
      const valueType: FieldValueType =
        type === "text"
          ? !randomInt(0, 2)
            ? "number"
            : "text"
          : (null as FieldValueType);
      names.push({
        name: faker
          .unique(() => faker.random.alphaNumeric(25), undefined, {
            maxRetries: 500,
            maxTime: 1000,
          })
          .toLowerCase(),
        type,
        valueType,
        list: null,
        required: !randomInt(0, 5),
        condition: !randomInt(0, 3),
        options:
          type === "select"
            ? Array.apply(0, Array(randomInt(2, 7))).map(() =>
                faker.commerce.productAdjective().toLowerCase()
              )
            : ([] as string[]),
      });
    }

    const isFirstStepList = !randomInt(0, 5);
    const data: FormDescription = [FormRandom.emptyStep(isFirstStepList)];

    while (names.length) {
      if (data[data.length - 1].type === "list")
        names[0].list = data.length - 1;

      const fullWidth =
        !randomInt(0, 4) &&
        data[data.length - 1].children[
          data[data.length - 1].children.length - 1
        ].children.filter((field) => !field.fullWidth).length %
          2 ===
          0;

      data[data.length - 1].children[
        data[data.length - 1].children.length - 1
      ].children.push({
        name: names[0].name,
        description: faker.commerce.productDescription(),
        fullWidth,
        required: names[0].required,
        label: faker.company.bsNoun(),
        placeholder: `np. ${faker.company.catchPhraseNoun()}`,
        type: names[0].type,
        valueType: names[0].valueType,
        options: names[0].options,
        numberType:
          names[0].valueType === "number"
            ? !randomInt(0, 2)
              ? "real"
              : "integer"
            : null,
        min: null,
        max: null,
        hint: "",
        condition: FormRandom.condition(usedNames),
      });

      currFragmentNames.push(names[0]);
      names.splice(0, 1);

      if (
        data[data.length - 1].children[
          data[data.length - 1].children.length - 1
        ].children.length >= 5 &&
        randomInt(0, 16) % 4 === 0
      ) {
        usedNames.push(...currFragmentNames);
        data[data.length - 1].children.push(FormRandom.emptyFragment());
      } else if (
        data[data.length - 1].children.length >= 2 &&
        randomInt(0, 20) % 3 === 0
      ) {
        usedNames.push(...currFragmentNames);
        data.push(FormRandom.emptyStep(!randomInt(0, 5)));
        if (data[data.length - 1].type === "list")
          usedNames.push({
            name: data[data.length - 1].name + "~",
            valueType: "number",
            type: "text",
            list: null,
            required: true,
            condition: false,
            options: [],
          });
      }
    }
    return data;
  };
}
