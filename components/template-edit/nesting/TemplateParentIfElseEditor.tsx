import { Edit } from '@mui/icons-material';
import { Button } from '@mui/material';
import React from 'react';
import { Expression, IfElseElement } from '../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { ConditionCalculationDisplay } from '../../form-edit/condition-calculation-editor/ConditionCalculationDisplay';
import ConditionCalculationEditor, { Condition, OperatorCondition } from '../../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider';
import { ParentElementPropsType } from '../TemplateEditor';

export const TemplateParentIfElseEditor = ({ path, element, onChange }: ParentElementPropsType<IfElseElement>) => {
  const [condition, setCondition] = React.useState<Expression<Condition, OperatorCondition>>(
    element?.condition ?? { operators: [], components: [] }
  );
  const [editingCondition, setEditingCondition] = React.useState(false);

  React.useEffect(() => {
    if (element)
      setCondition(element?.condition ?? { operators: [], components: [] });
  }, [element]);
  React.useEffect(() => {
    onChange({ type: 'ifElse', condition, child: [] });
  }, [condition]);

  return <>
    <p className='mb-8'>Jeśli warunek jest spełniony, w miejscu tego elementu znajdzie się zagnieżdżony fragment.
    </p>
    <pre className='text-sm mb-2'>Warunek</pre>
    {!condition.components.length
      ? <div className='p-2 sm:p-4 border rounded-lg flex items-center justify-center'><pre>Brak warunku</pre></div>
      : <ConditionCalculationDisplay type='condition' sequence={condition} />}
    <Button size='small' className='border-none self-end mt-2' onClick={() => setEditingCondition(true)}>Zmień</Button>
    {editingCondition
      ? <ConditionCalculationEditor
        exit={() => setEditingCondition(false)}
        save={(value) => {
          setCondition(value as Expression<Condition, OperatorCondition>);
          setEditingCondition(false);
        }} type='condition' />
      : null}
  </>;
};

export const TemplateParentIfElseDisplay = ({ element, children }: { element: IfElseElement, children: React.ReactNode }) => {
  return <div style={{ maxWidth: 800 }} className='bg-red-500 rounded-lg sm:pt-6 pt-4 flex flex-col overflow-x-visible'>
    <span className='px-4 sm:px-6 pb-4 sm:pb-6 w-full inline-flex items-center flex-wrap justify-end gap-3'>
      <pre className='text-sm mb-4 text-white'>Fragment warunkowy</pre>
      <div className='flex-1' />
      <Button className=' bg-white border-none self-end' size='small' color='primary'>Edytuj<Edit className='ml-2' /></Button>
    </span>

    <p className='text-sm mb-4 text-white mx-4 sm:mx-6'>Fragment wyświetlany gdy spełniony jest warunek:
    </p>

    <div className='bg-white flex flex-col mx-4 sm:mx-6 rounded-lg '>
      <ConditionCalculationDisplay type='condition' sequence={element.condition as Expression<Condition, OperatorCondition>} />
    </div>

    <div className='bg-red-500 pt-4 pb-4 min-w-full sm:px-6 px-4 rounded-lg w-fit'>
      <div className='bg-white sm:p-4 p-2 rounded-lg'>
        {children}
      </div>
    </div>

  </div>;
}