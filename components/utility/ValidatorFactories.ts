import { isValid } from "date-fns";
import { FieldDescription } from "../../providers/FormDescriptionProvider/FormDescriptionProvider";

export namespace Validators {
  export const factory = (field: FieldDescription) => {
    return {
      text: () => textFieldValidatorFactory(field),
      select: () => selectFieldValidatorFactory(field),
      date: () => dateFieldValidatorFactory(field),
    };
  };

  const textFieldValidatorFactory = (field: FieldDescription) =>
    field.valueType === "number"
      ? (value: string) => {
          console.log(`running for ${field.name} number`);
          if (field.required && !value) return "To pole jest wymagane.";

          const parser = field.numberType === "real" ? parseFloat : parseInt;

          const min = field.min
            ? parser((field.min as string).replace(/,/g, "."))
            : -1000000000000000000000000000000000000000000000;
          const max = field.max
            ? parser((field.max as string).replace(/,/g, "."))
            : 1000000000000000000000000000000000000000000000;

          if (field.numberType === "real") {
            if (
              !value?.match(/^\-?[1-9]?[0-9]*[,.]?[0-9]+$/) &&
              !value?.match(/^\-?[1-9][0-9]*$/)
            )
              return "To pole musi zawierać poprawną liczbę rzeczywistą lub całkowitą.";
          } else if (!value.match(/^\-?[1-9]?[0-9]*$/))
            return "To pole musi zawierać poprawną liczbę całkowitą.";

          if (parser(value) < min)
            return `Wartość pola musi być większa od ${min}.`;
          if (parser(value) > max)
            return `Wartość pola muse być mniejsza od ${max}.`;
          return null;
        }
      : selectFieldValidatorFactory(field);

  const selectFieldValidatorFactory =
    (field: FieldDescription) => (value: string) => {
      console.log(`running for ${field.name} text/select`);
      if (field.required) if (!value) return "To pole jest wymagane.";
      return null;
    };
  const dateFieldValidatorFactory =
    (field: FieldDescription) => (date: Date) => {
      console.log(`running for ${field.name} date`);
      if (typeof date === "string") date = new Date(date);

      const min = new Date(field.min as string);
      const max = new Date(field.max as string);

      min.setHours(0, 0, 0, 0);
      max.setHours(0, 0, 0, 0);

      if (field.required) {
        if (!date) return "To pole jest wymagane.";
      }
      if (isValid(date)) {
        if (date < min)
          return `Data musi być większa od lub równa ${min.toLocaleDateString(
            "pl-PL"
          )}.`;
        if (date > max)
          return `Data musi być większa od od lub równa ${max.toLocaleDateString(
            "pl-PL"
          )}.`;
      } else {
        return `Wprowadź poprawną datę.`;
      }
      return null;
    };
}
