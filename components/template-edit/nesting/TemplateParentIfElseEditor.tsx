import { ArrowDownward, Edit } from '@mui/icons-material';
import { Button } from '@mui/material';
import _ from 'lodash';
import React from 'react';
import { Expression, IfElseElement, TemplatePath } from '../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { useTemplateChangesDisplay } from '../../form-edit/Changes';
import { ConditionCalculationDisplay } from '../../form-edit/condition-calculation-editor/ConditionCalculationDisplay';
import ConditionCalculationEditor, { Condition, OperatorCondition } from '../../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider';
import { ParentElementPropsType } from '../TemplateEditor';

export const TemplateParentIfElseEditor = ({ path, element, onChange }: ParentElementPropsType<IfElseElement>) => {
  const [condition, setCondition] = React.useState<Expression<Condition, OperatorCondition>>(
    element?.condition ?? { operators: [], components: [] }
  );
  const [editingCondition, setEditingCondition] = React.useState(false);

  React.useEffect(() => {
    if (element) {
      setCondition(element.condition ?? { operators: [], components: [] });
      console.log(element.condition)
    }
  }, [element]);
  React.useEffect(() => {
    onChange({ type: 'ifElse', condition, child: element?.child?.length ? element?.child : [] });
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
        initValue={condition}
        save={(value) => {
          setCondition(value as Expression<Condition, OperatorCondition>);
          setEditingCondition(false);
        }} type='condition' />
      : null}
  </>;
};

export const TemplateParentIfElseDisplay = ({ element, children, edit, path, index }: { element: IfElseElement, children: React.ReactNode, edit: () => void, path: TemplatePath, index: number }) => {
  const { changedConditions, deletionPaths } = useTemplateChangesDisplay();
  const changedCondition = React.useMemo(() => {
    const changed = changedConditions.find(condition => _.isEqual(condition[0], path.concat([index])));
    return changed ? changed[1] : null;
  }, [])

  return <div style={{ maxWidth: 800 }} className='bg-red-100 rounded-lg sm:pt-6 pt-4 flex flex-col overflow-x-visible'>
    <span className='px-4 sm:px-6 pb-4 sm:pb-6 w-full inline-flex items-center flex-wrap justify-end gap-3'>
      <pre className='text-sm mb-4'>Fragment warunkowy</pre>
      <div className='flex-1' />
      {
        changedConditions.length || deletionPaths.length
          ? null
          : <Button className='bg-white border-none self-end' size='small' color='primary' onClick={edit}>Edytuj<Edit className='ml-2' /></Button>
      }
    </span>

    <p className='text-sm mb-4 mx-4 sm:mx-6'>Fragment wyświetlany gdy spełniony jest warunek:
    </p>

    <div className={`${changedCondition ? 'bg-purple-100' : 'bg-white'} p-4 inline-flex gap-3 flex-col mx-4 sm:mx-6 rounded-lg `}>

      <ConditionCalculationDisplay type='condition' sequence={element.condition as Expression<Condition, OperatorCondition>} />
      {

        changedCondition ?
          <>
            <div className="flex rounded justify-center p-3 bg-blue-500 bg-opacity-20"><ArrowDownward color='primary' /> </div>

            <ConditionCalculationDisplay type='condition' sequence={changedCondition as Expression<Condition, OperatorCondition>} />
          </> : null
      }
    </div>

    <div className='pt-4 pb-4 min-w-full sm:pb-6 sm:px-6 px-4 rounded-lg w-fit bg-red-100'>
      <div className='bg-white sm:p-4 p-2 rounded-lg'>
        {children}
      </div>
    </div>

  </div>;
}