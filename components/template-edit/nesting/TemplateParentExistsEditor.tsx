import { Edit } from '@mui/icons-material';
import { Button, Checkbox, Chip, FormControl, InputLabel, MenuItem, Select, Tooltip } from '@mui/material';
import React from 'react';
import { existsContext } from '../../../pages/account/lawyer/edit-document/template';
import { useFormDescription } from '../../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { ExistsElement, useTemplateDescription } from '../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { useTemplateChangesDisplay } from '../../form-edit/Changes';
import { Evaluate } from '../../utility/Evaluate';
import { ParentElementPropsType, useTemplateEditorContextForConditionsAndCalculations } from '../TemplateEditor';




export const TemplateParentExistsEditor = ({ path, element, onChange, }: ParentElementPropsType<ExistsElement>) => {
  const { form } = useTemplateDescription();
  const listIndex = useTemplateEditorContextForConditionsAndCalculations();

  const [variables, setVariables] = React.useState<string[]>(element?.variables ?? []);
  const [selectOpen, setSelectOpen] = React.useState(false);

  React.useEffect(() => {
    onChange({ type: 'exists', variables, child: element?.child?.length ? element?.child : [] });
  }, [variables]);

  const globals = React.useMemo(() => Evaluate.getNames(form).filter(name => name.list == null && !name.name?.endsWith('~')), [form]);
  const listVars = React.useMemo(() => listIndex == -1 ? [] : Evaluate.getNames(form).filter(name => name.list === listIndex! && !name.name?.endsWith('~')), [form]);

  const GlobalsElement = React.useMemo(() => globals.map((name) => {
    return <MenuItem className='flex w-full items-center justify-between' value={name.name!}>
      <div className='flex items-center'>
        <Checkbox checked={variables.includes(name.name as string)} />
        <Chip size='small' className='mr-2 ml-2' color='primary' label={name.name} />
      </div>
      {name.type === 'date' ? 'data' : 'tekst'}
    </MenuItem>;
  }),
    [globals, variables]);
  const ListVariablesElement = React.useMemo(() => listVars.map((name) => {
    return <MenuItem className='flex w-full items-center justify-between' value={name.name!}>
      <div className='flex items-center'>
        <Checkbox checked={variables.includes(name.name as string)} />
        <Chip size='small' className='mr-2 ml-2' color='error' label={name.name} />
      </div>
      {name.type === 'date' ? 'data' : 'tekst'}</MenuItem>;
  }),
    [globals, variables]);

  return <>
    <p className='mb-8'>Jeśli wszystkie wybrane zmienne istnieją (ich pola nie są puste), w miejscu tego elementu znajdzie się zagnieżdżony fragment.</p>

    <FormControl>
      <InputLabel>zmienne</InputLabel>
      <Tooltip placement='bottom-end' title={
        variables.length > 1 && !selectOpen ?
          <div className='bg-black bg-opacity-80 p-2 inline-flex gap-3 flex-wrap rounded'>
            {variables.map((name) =>
              <Chip size='small' label={name} color={listVars.map(variable => variable.name as string).includes(name) ? 'error' : 'primary'} />
            )}
          </div>
          : <></>
      } >
        <Select onOpen={(e) => setSelectOpen(true)} onClose={e => setSelectOpen(false)} renderValue={(values) => <div>
          {values.map(value => globals.map(item => item.name as string).includes(value)
            ? <Chip size='small' className='mr-2' color='primary' label={value} />
            : <Chip size='small' className='mr-2' color='error' label={value} />
          )}
        </div>} onChange={(e, value) => setVariables(e.target.value as string[])} value={variables} multiple label='zmienne'>

          <MenuItem disabled><pre className='text-white text-sm'>zmienne globalne</pre></MenuItem>
          {GlobalsElement}
          {listVars.length ?
            <MenuItem disabled><pre className='text-white text-sm'>zmienne listowe</pre></MenuItem>
            : null}
          {ListVariablesElement}
          <MenuItem disabled className='mt-1'></MenuItem>
        </Select>
      </Tooltip>
    </FormControl>

    <p className='mt-8'>Zmiennych, które wybierzesz możesz używać w zagnieżdżonym fragmencie, mimo, że nie są wymagane.</p>
  </>;
};

export const TemplateParentExistsDisplay = ({ element, children, edit }: { element: ExistsElement, children: React.ReactNode, edit: () => void }) => {
  const { names } = useFormDescription();
  const { changedConditions, deletionPaths } = useTemplateChangesDisplay();

  return <div style={{ maxWidth: 800 }} className='rounded-lg sm:pt-6 pt-4 flex flex-col overflow-x-visible bg-green-100'>
    <span className='px-4 sm:px-6 pb-4 sm:pb-6 w-full inline-flex items-center flex-wrap justify-end gap-3'>
      <pre className='text-sm mb-4'>Asercja istnienia</pre>
      <div className='flex-1' />
      {
        changedConditions.length || deletionPaths.length
          ? null
          : <Button className='bg-white border-none self-end' size='small' color='primary' onClick={edit}>Edytuj<Edit className='ml-2' /></Button>
      }
    </span>

    <p className='text-sm mb-4 mx-4 sm:mx-6'>Fragment wyświetlany gdy pola następujących zmiennych są niepuste:
    </p>

    <div className='bg-white inline-flex gap-1 py-2 flex-wrap  mx-4 sm:mx-6 rounded-lg '>
      {element.variables.map((name) => {
        const variable = names.find(item => item.name === name);
        return <Chip size='small' className='mr-2 ml-2' color={variable?.list == null ? 'primary' : 'error'} label={name} />
      })}
    </div>

    <div className='bg-green-100 min-w-full pt-4 pb-4 sm:pb-6 sm:px-6 px-4 rounded-lg w-fit'>
      <div className='bg-white sm:p-4 p-2 rounded-lg'>
        <existsContext.Provider value={element.variables || []}>
          {children}
        </existsContext.Provider>
      </div>
    </div>

  </div>;
}