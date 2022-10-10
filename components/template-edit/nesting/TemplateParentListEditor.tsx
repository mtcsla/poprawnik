import { Edit } from '@mui/icons-material';
import { Button, Chip, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import { Expression, ListElement, useTemplateDescription } from '../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { ConditionCalculationDisplay } from '../../form-edit/condition-calculation-editor/ConditionCalculationDisplay';
import { Condition, OperatorCondition } from '../../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider';
import { ParentElementPropsType } from '../TemplateEditor';





export const TemplateParentListEditor = ({ path, element, onChange }: ParentElementPropsType<ListElement>) => {
  const [list, setList] = React.useState(element?.list ?? '');
  const [filter, setFilter] = React.useState<Expression<Condition, OperatorCondition>>(element?.filter ?? { operators: [], components: [] });

  const { form } = useTemplateDescription();

  React.useEffect(() => {
    onChange({ type: 'list', list, filter, child: [] });
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
    <Button className='self-end border-none' size='small'>Zmień</Button>
  </>;
};

export const TemplateParentListDisplay = ({ element, children }: { element: ListElement, children: React.ReactNode }) => {
  return <div style={{ maxWidth: 800 }} className='bg-yellow-400 rounded-lg sm:pt-6 pt-4 flex flex-col overflow-x-visible'>
    <span className='px-4 sm:px-6 pb-4 sm:pb-6 w-full inline-flex items-center flex-wrap justify-end gap-3'>
      <pre className='text-sm mb-4 text-white'>Interpretacja listy</pre>
      <div className='flex-1' />
      <Button className=' bg-white border-none self-end' size='small' color='primary'>Edytuj<Edit className='ml-2' /></Button>
    </span>
    <p className='text-sm mb-4 text-white mx-4 sm:mx-6'>
      Każdy element listy <span className='inline-flex items-center mx-1 p-1 bg-white rounded-lg'><Chip size='small' color='warning' label={element.list} /></span> zostanie wstawiony jako poniższy fragment.
    </p>

    <div className='bg-white flex flex-col mx-4 sm:mx-6 rounded-lg '>

    </div>

    <div className='bg-yellow-400 min-w-full pt-4 pb-4 sm:px-6 px-4 rounded-lg w-fit'>
      <div className='bg-white sm:p-4 p-2 rounded-lg'>
        {children}
      </div>
    </div>

  </div>;
}