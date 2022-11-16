import { Button } from '@mui/material';
import React from 'react';
import { CalculationElement, Expression, TemplatePath } from '../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { ConditionCalculationDisplay } from '../form-edit/condition-calculation-editor/ConditionCalculationDisplay';
import ConditionCalculationEditor, { Calculation, OperatorCalculation } from '../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider';

export const EditTemplateElementCalculation = ({ path, index, onChange, element }: {
  path: TemplatePath; index: number | null; onChange: (element: CalculationElement) => void; element: CalculationElement | null;
}) => {

  const [calculation, setCalculation] = React.useState<Expression<Calculation, OperatorCalculation>>(element?.calculation || { components: [], operators: [] });
  const [editingCalculation, setEditingCalculation] = React.useState<boolean>(false);


  React.useEffect(() => {
    onChange({
      type: 'calculation',
      calculation: calculation,
      child: null as never,
    });
  }, [calculation]);

  return <div className='w-full flex flex-col'>
    {editingCalculation
      ? <ConditionCalculationEditor
        type='calculation'
        initValue={calculation}
        save={(value) => { setCalculation(value as Expression<Calculation, OperatorCalculation>); setEditingCalculation(false); }}
        exit={() => setEditingCalculation(false)}
      />

      : null}
    {calculation.components.length
      ? <ConditionCalculationDisplay sequence={calculation} type='calculation' first />
      : <pre className='flex items-center justify-center p-2 sm:p-4 border rounded-lg'>brak</pre>}
    <Button className='self-end border-none' size='small' onClick={() => setEditingCalculation(true)}>Zmień</Button>
  </div>;
};
