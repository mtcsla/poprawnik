import { ArrowDownward, Edit } from '@mui/icons-material';
import { Button, Chip, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import _ from 'lodash';
import React from 'react';
import { listContext } from '../../../pages/account/lawyer/edit-document/template';
import { Expression, ListElement, TemplatePath, useTemplateDescription } from '../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { useTemplateChangesDisplay } from '../../form-edit/Changes';
import { ConditionCalculationDisplay } from '../../form-edit/condition-calculation-editor/ConditionCalculationDisplay';
import ConditionCalculationEditor, { Condition, OperatorCondition } from '../../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider';
import { ParentElementPropsType, templateEditorContextForConditionsAndCalculations } from '../TemplateEditor';





export const TemplateParentListEditor = ({ path, element, onChange }: ParentElementPropsType<ListElement>) => {
  const [list, setList] = React.useState(element?.list ?? '');
  const [filter, setFilter] = React.useState<Expression<Condition, OperatorCondition>>(element?.filter ?? { operators: [], components: [] });

  const [editing, setEditing] = React.useState(false);

  const { form } = useTemplateDescription();



  React.useEffect(() => {
    onChange({ type: 'list', list, filter, child: element?.child?.length ? element?.child : [] });
  }, [
    list, filter
  ]);

  const listNames = React.useMemo(() => form.filter(step => step.type === 'list' && step.name).map(list => <MenuItem value={list.name} className='w-full flex items-center justify-between'>
    <Chip size='small' className='mr-2' color='warning' label={list.name} />
    lista
  </MenuItem>
  ),
    [form]);

  return <>
    <p className='mb-8 text-sm'>
      W miejscu tego elementu znajdzie się zagnieżdżony fragment dla każdego elementu listy. Jeśli wybierzesz warunek filtrujący, będą wyświetlane tylko te elementy, które spełniają warunek.
    </p>
    <FormControl>
      <InputLabel>
        nazwa listy
      </InputLabel>
      <Select label='nazwa listy'
        value={list}
        onChange={(e, value) => {
          setList(e.target.value as string);
        }}>
        <MenuItem disabled className='opacity-100'><pre>Listy</pre></MenuItem>
        {listNames}
      </Select>
    </FormControl>
    <pre className='mt-8 mb-2 text-sm'>Warunek filtrujący</pre>
    {(element?.filter ?? filter).operators.length
      ? <ConditionCalculationDisplay type='condition' sequence={element?.filter ?? filter} />
      : <div className='p-4 flex justify-center border rounded-lg'>
        <pre>
          Brak warunku
        </pre>
      </div>}
    <Button className='self-end border-none' size='small' onClick={() => setEditing(true)}>Zmień</Button>
    {
      editing
        ? <ConditionCalculationEditor type='condition' initValue={filter} exit={() => setEditing(false)} save={(value) => {
          setFilter(value as Expression<Condition, OperatorCondition>); setEditing(false)
        }} />
        : null
    }

  </>;
};

export const TemplateParentListDisplay = ({ element, children, edit, path, index }: { element: ListElement, children: React.ReactNode, edit: () => void, path: TemplatePath, index: number }) => {
  const { form } = useTemplateDescription();
  const { changedConditions, deletionPaths } = useTemplateChangesDisplay();
  const changedCondition = React.useMemo(() => {
    const changed = changedConditions.find(condition => _.isEqual(condition[0], path.concat([index])));
    return changed ? changed[1] : null;
  }, [])

  return <div style={{ maxWidth: 800 }} className='rounded-lg sm:pt-6 pt-4 flex flex-col overflow-x-visible bg-yellow-100'>
    <span className='px-4 sm:px-6 pb-4 sm:pb-6 w-full inline-flex items-center flex-wrap justify-end gap-3'>
      <pre className='text-sm mb-4'>Interpretacja listy</pre>
      <div className='flex-1' />
      {
        changedConditions.length || deletionPaths.length
          ? null
          : <Button className='bg-white border-none self-end' size='small' color='primary' onClick={edit}>Edytuj<Edit className='ml-2' /></Button>
      }
    </span>
    <p className='text-sm mb-4 mx-4 sm:mx-6'>
      Każdy element listy
      <span className='inline-flex items-center mx-1 p-1 bg-white rounded-lg'><Chip size='small' color='warning' label={element.list} /></span>
      zostanie wstawiony jako poniższy fragment.
    </p>

    <pre className='mx-4 sm:mx-6 mb-2 mt-4 text-xs'>Warunek filtrujący</pre>
    <p className='text-sm mb-4 mx-4 sm:mx-6'>
      Wstawione zostaną tylko te elementy listy, dla których warunek jest spełniony:
    </p>
    <div className={`${changedCondition ? 'bg-purple-100' : 'bg-white'} p-4 flex-col inline-flex gap-3 mb-6  mx-4 sm:mx-6 rounded-lg items-stretch justify-center`}>

      {element?.filter?.operators?.length
        ?
        <>

          <ConditionCalculationDisplay type='condition' sequence={element.filter as Expression<Condition, OperatorCondition>} />
          {

            changedCondition ?
              <>
                <div className="flex rounded justify-center p-3 bg-blue-500 bg-opacity-20"><ArrowDownward color='primary' /> </div>

                <ConditionCalculationDisplay type='condition' sequence={changedCondition as Expression<Condition, OperatorCondition>} />
              </> : null
          }
        </>

        : <div className='p-4 flex justify-center border rounded-lg'>
          <pre>
            Brak warunku
          </pre>
        </div>}
    </div>

    <div className='bg-yellow-100 min-w-full pt-4 pb-4 sm:pb-6 sm:px-6 px-4 rounded-lg w-fit'>
      <div className='bg-white sm:p-4 p-2 rounded-lg'>
        <listContext.Provider value={element?.list ?? ''}>
          <templateEditorContextForConditionsAndCalculations.Provider value={form.findIndex(item => item.name === element?.list)}>
            {children}
          </templateEditorContextForConditionsAndCalculations.Provider>
        </listContext.Provider>
      </div>
    </div>

  </div>;
}