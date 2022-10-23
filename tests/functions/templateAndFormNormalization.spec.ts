import { randomInt } from "mathjs";
import { FormRandom } from "../../components/utility/FormRandom";
import { FormUtility } from "../../components/utility/FormUtility";

describe("Template and form normalizer", () => {
  it("Should return the list of changes to the form", () => {
    const sampleForm = FormRandom.formDescription();

    for (let i = 0; i < 100; i++) {
      const testStep = randomInt(0, sampleForm.length);
      const testFragment = randomInt(0, sampleForm[testStep].children.length);
      const testField = randomInt(
        0,
        sampleForm[testStep].children[testFragment].children.length
      );

      const changes = FormUtility.removed(
        sampleForm,
        [testStep, testFragment, testField],
        "removed"
      );
      expect(changes.length).toBeGreaterThanOrEqual(0);
    }
  });

  it("Should return the list of changes to the template", () => {});

  it("Should apply the changes to the form", () => {});

  it("Should apply the changes to the template", () => {});
});
