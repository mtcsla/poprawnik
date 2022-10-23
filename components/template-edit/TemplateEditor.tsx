import { Button, Chip, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import FormDescriptionProvider from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { Expression, ListElement, TemplateElement, TemplatePath, useTemplateDescription } from '../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { ConditionCalculationDisplay } from '../form-edit/condition-calculation-editor/ConditionCalculationDisplay';
import { Condition, OperatorCondition } from '../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider';
import { EditTemplateDescription } from './EditTemplateDescription';

export const isValidElement = (element: TemplateElement) => {
  if (element.type === 'text') return element.text !== '';
  if (element.type === 'calculation') return element.calculation.components.length > 0;
  if (element.type === 'variable') return element.variable !== '' && element.variable != null;
  return true;
}

export type ParentElementPropsType<Type> = {
  path: TemplatePath,
  element?: Type,
  onChange: (value: Type) => void
}

const templateParenthesesEditorContext = React.createContext<{
  path: TemplatePath | null,
  editing: boolean
  parentheses: [number | null, number | null],
  setParentheses: React.Dispatch<[number | null, number | null]>,
  setPath: React.Dispatch<TemplatePath | null>
  setEditing: React.Dispatch<boolean>
}>(
  {
    path: null,
    parentheses: [null, null],
    editing: true,
    setParentheses: () => { },
    setPath: () => { },
    setEditing: () => { },
  }
)
export const useTemplateParenthesesEditor = () => React.useContext(templateParenthesesEditorContext);

export const templateEditorContextForConditionsAndCalculations = React.createContext<number | null>(
  null
);
export const useTemplateEditorContextForConditionsAndCalculations = () => React.useContext(templateEditorContextForConditionsAndCalculations);

export default function TemplateEditor({ display }: { display?: boolean }) {
  const { description, modifyDescription, form } = useTemplateDescription();

  const [parentheses, setParentheses] = React.useState<[number | null, number | null]>([null, null]);
  const [path, setPath] = React.useState<TemplatePath | null>(null);
  const [editing, setEditing] = React.useState<boolean>(false);


  const parenthesesEditorContextValue = { parentheses, setParentheses, path, setPath, editing, setEditing };

  return <templateEditorContextForConditionsAndCalculations.Provider value={-1}>
    <templateParenthesesEditorContext.Provider value={parenthesesEditorContextValue}>
      <FormDescriptionProvider initValue={form} id={''}>
        <EditTemplateDescription noHeadline={display} path={(!editing ? path : null) ?? []} />
      </FormDescriptionProvider>
    </templateParenthesesEditorContext.Provider>
  </templateEditorContextForConditionsAndCalculations.Provider>
}




export const TemplateParentListEditor = ({ path, element, onChange }: ParentElementPropsType<ListElement>) => {
  const [list, setList] = React.useState(element?.list ?? '');
  const [filter, setFilter] = React.useState<Expression<Condition, OperatorCondition>>(element?.filter ?? { operators: [], components: [] });

  const { form } = useTemplateDescription();

  React.useEffect(() => {
    onChange({ type: 'list', list, filter, child: null as never });
  }, [
    list, filter
  ])

  const listNames = React.useMemo(() =>
    form.filter(step => step.type === 'list' && step.name).map(list =>
      <MenuItem value={list.name} className='w-full flex items-center justify-between'>
        <Chip size='small' className='mr-2' color='warning' label={list.name} />
        lista
      </MenuItem>
    )
    , [form])

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
      : <div className='p-4 flex justify-center border rounded-lg'><pre>Brak warunku</pre></div>
    }
    <Button className='self-end border-none' size='small'>Zmień</Button>
  </>
}


