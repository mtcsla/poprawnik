import { FormRandom } from "../../components/utility/FormRandom";
import { randomInt } from "mathjs";
import { FormNameCheck } from "../../components/utility/FormNameCheck";
import { FormUtility } from "../../components/utility/FormUtility";
import { FormNormalize } from "../../components/form-edit/condition-calculation-editor/normalizers/FormNormalize";
import {
  ConditionCalculationSequence,
  Condition,
} from "../../components/form-edit/condition-calculation-editor/ConditionCalculationEditorProvider";

describe("Condition normalizer inside form description object", () => {
  it("should remove all subconditions containing the names from all fields in steps where index >= index of the step where the name is defined\n\t[100 random test cases]", () => {
    for (let i = 0; i < 100; i++) {
      const description = FormRandom.formDescription();

      const pathForDeletion: FormUtility.Path = [-1, null, null];

      pathForDeletion[0] = randomInt(0, description.length);
      pathForDeletion[1] = !!randomInt(0, 2)
        ? randomInt(0, description[pathForDeletion[0]].children.length)
        : null;
      pathForDeletion[2] =
        pathForDeletion[1] == null
          ? null
          : !!randomInt(0, 2) &&
            description[pathForDeletion[0]].children[pathForDeletion[1]]
              .children.length
          ? randomInt(
              0,
              description[pathForDeletion[0]].children[
                pathForDeletion[1] as number
              ].children.length
            )
          : null;

      const _delete = !!randomInt(0, 2) ? true : undefined;

      const shouldBeDeleted = FormUtility.removed(
        description,
        pathForDeletion,
        "removed",
        _delete
      );
      const newDescription = FormNormalize.conditions(
        description,
        pathForDeletion,
        _delete
      );

      const pathToString = (path: number[]) =>
        `${path[0]}/${path[1]}/${path[2]}`;
      const checkCondition = (
        condition: ConditionCalculationSequence,
        _paths: number[][],
        _path: number[] = []
      ) => {
        const paths = _paths.map((path) => pathToString(path));

        condition.components.forEach((item, index) => {
          const type =
            !(item as ConditionCalculationSequence).components ||
            !(item as ConditionCalculationSequence).operators
              ? "condition"
              : "sequence";
          if (type === "condition") {
            if (paths.includes(pathToString(_path.concat([index]))))
              expect((item as Condition).simpleValue).toBe(true);
            else expect((item as Condition).simpleValue).toBe(undefined);
          } else
            checkCondition(
              item as ConditionCalculationSequence,
              _paths,
              _path.concat([index])
            );
        });
      };
    }
  });
});
describe("Condition normalizer UX", () => {
  it("Should return a list of the changes.", () => {});
});
