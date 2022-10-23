import { Chip, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import { TemplatePath, useTemplateDescription, VariableElement } from '../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { Evaluate } from '../utility/Evaluate';
import { useTemplateEditorContextForConditionsAndCalculations } from './TemplateEditor';

export const EditTemplateElementVariable = ({ path, index, onChange, element }: { path: TemplatePath; index: number | null; onChange: (value: VariableElement) => void; element: VariableElement | null; }
) => {
  const { description, modifyDescription, form } = useTemplateDescription();
  const listIndex = useTemplateEditorContextForConditionsAndCalculations();


  const globals = React.useMemo(() => Evaluate.getNames(form).filter(name => name.list == null && name.valueType !== 'number' && name.required && !name.fragmentConditional && !name?.condition?.components?.length && !name.name?.endsWith('~')), [form]);
  const listVars = React.useMemo(() => listIndex == -1 ? [] : Evaluate.getNames(form).filter(name => name.list === listIndex! && name.valueType !== 'number' && name.required && !name.fragmentConditional && !name?.condition?.components?.length && !name.name?.endsWith('~')), [form]);

  const GlobalsElement = React.useMemo(() => globals.map((name) => {
    return <MenuItem className='flex w-full items-center justify-between' value={name.name!}>
      <Chip size='small' className='mr-2' color='primary' label={name.name} /> {name.type === 'date' ? 'data' : 'tekst'}</MenuItem>;
  }),
    [globals]);
  const ListVariablesElement = React.useMemo(() => listVars.map((name) => {
    return <MenuItem className='flex w-full items-center justify-between' value={name.name!}>
      <Chip size='small' className='mr-2' color='error' label={name.name} /> {name.type === 'date' ? 'data' : 'tekst'}</MenuItem>;
  }),
    [globals]);

  const [selectedVariable, setSelectedVariable] = React.useState<string>(element?.variable ?? '');

  React.useEffect(() => {
    onChange({
      type: 'variable',
      variable: selectedVariable,
      child: null as never
    });
  }, [selectedVariable]);


  return <>
    <FormControl size='small'>
      <InputLabel>zmienna</InputLabel>
      <Select onChange={(e, value) => setSelectedVariable(e.target.value as VariableElement['variable'])} value={selectedVariable} label='zmienna'>
        <MenuItem disabled><pre className='text-white text-sm'>zmienne globalne</pre></MenuItem>
        {GlobalsElement}
        {listVars.length ?
          <MenuItem disabled><pre className='text-white text-sm'>zmienne listowe</pre></MenuItem>
          : null}
        {ListVariablesElement}
        <MenuItem disabled className='mt-1'></MenuItem>
      </Select>
    </FormControl>
  </>;
};
