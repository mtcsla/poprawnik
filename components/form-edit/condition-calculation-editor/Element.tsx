import { AddTask, Delete, Edit } from '@mui/icons-material';
import { Checkbox, Chip, FormControl, Menu, MenuItem, Select, Tooltip } from '@mui/material';
import { isDate } from 'mathjs';
import React from 'react';
import { useFormDescription } from '../../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { ConditionCalculationDisplay } from './ConditionCalculationDisplay';
import { Calculation, comparatorsForNotRequiredValuesPolish, comparatorsPolish, Condition, ConditionCalculationSequence, getElement, isChild, Operator, useParenthesesEditor, useSequence } from './ConditionCalculationEditorProvider';
import { EditCondition } from './EditCondition';
import { EditNumberValue } from './EditNumberValue';



export const Element = ({ path, type }: { path: number[]; type: 'condition' | 'calculation'; }) => {
  const { sequence, modifySequence } = useSequence();

  const { element, operator } = React.useMemo(() => getElement(sequence, path), [sequence, path]);
  const { names } = useFormDescription();
  const { parenthesesEditor, setParenthesesEditor, modifyParentheses, parentheses } = useParenthesesEditor();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [editorOpen, setEditorOpen] = React.useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const elementIndex = path[path.length - 1];

  return <>
    <Menu open={!!anchorEl} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
      <MenuItem onClick={() => { setEditorOpen(true); setAnchorEl(null); }}>
        <Edit color='primary' className='mr-2' /> Edytuj {type === 'condition' ? 'podwarunek' : 'część obliczeń'}
      </MenuItem>
      <MenuItem onClick={() => { modifySequence(['remove_element', path]); setAnchorEl(null); }}>
        <Delete color='error' className='mr-2' /> Usuń {type === 'condition' ? 'podwarunek' : 'część obliczeń'}
      </MenuItem>
    </Menu>
    {type === 'condition'
      ? <span className='inline-flex w-full justify-between gap-6'>
        <div onClick={handleClick} className='border border-transparent hover:border-blue-500 hover:bg-blue-50 hover:cursor-pointer inline-flex gap-2 items-center rounded-lg bg-slate-100 p-2'>
          {(element as Condition).simpleValue == null
            ? <>
              {(element as Condition).variable?.endsWith('~')
                ? <p className='text-xs'>długość listy</p>
                : null}

              <Chip
                color={(element as Condition).variable?.endsWith('~')
                  ? 'warning'
                  : names.find(name => name.name == (element as Condition).variable)?.list != null
                    ? 'error'
                    : 'info'}
                label={!(element as Condition).variable?.endsWith('~')
                  ? (element as Condition).variable
                  : ((element as Condition).variable as string).slice(0, -1)} />

              {comparatorsPolish.concat(comparatorsForNotRequiredValuesPolish).find(comp => comp[0] === (element as Condition).comparator)?.[1]}

              {
                (element as Condition).value.type != null && (element as Condition).value.value != null
                  ? (element as Condition).value.type === 'variable'
                    ? ((element as Condition).value.value as string).endsWith('~')
                      ? <>
                        <span className='inline-flex gap-3 items-center'>
                          <p className='text-xs'>długość listy</p> <Chip color='warning' label={((element as Condition).value.value as string).slice(0, -1)} />
                        </span>
                      </>
                      : <Chip label={(element as Condition).value.value} />
                    : (element as Condition).value.type === 'constant'
                      ? <p className='text-sm'>{isDate((element as Condition).value.value) ? ((element as Condition).value.value as Date)?.toLocaleDateString('pl-PL') : (element as Condition).value.value}<p className='inline text-xs italic ml-2'>(wartość stała)</p> </p>
                      :
                      <Tooltip title={
                        <div className='p-2 sm:p-4 border rounded-lg bg-white'>
                          <ConditionCalculationDisplay tooltip reversed type='calculation' sequence={(element as Condition).value.value as ConditionCalculationSequence} />
                        </div>
                      }><Chip className='rounded  bg-green-500 flex items-center' label={<pre className='text-sm text-white'><AddTask className='mr-2' /> obliczenia</pre>} /></Tooltip>
                  : null}
            </>
            : <pre>{(element as Condition).simpleValue ? 'prawda' : 'fałsz'}</pre>}
        </div>

        {editorOpen
          ? <EditCondition {...{ path, initValue: element as Condition, cancel: () => setEditorOpen(false) }} />
          : null}
        {parenthesesEditor && isChild(path, parenthesesEditor) ? <Checkbox className='scale-125' checked={elementIndex >= Math.min(...parentheses) && elementIndex <= Math.max(...parentheses)}
          disabled={parentheses.length === 2 && !parentheses.includes(elementIndex)}
          onClick={() => modifyParentheses(elementIndex)} /> : null}
      </span>
      :
      (element as Calculation).neutral == null ?
        <span className='inline-flex w-full justify-between gap-6'>
          <div onClick={handleClick} className='border border-transparent hover:border-blue-500 hover:bg-blue-50 hover:cursor-pointer inline-flex gap-2 items-center rounded-lg bg-slate-100 p-2'>
            {(element as Calculation).type === 'variable' && ((element as Calculation).value as string)?.endsWith('~')
              ? <p className='text-xs'>długość listy</p>
              : null
            }
            {
              (element as Calculation).type === 'variable'
                ? <Chip
                  color={((element as Calculation).value as string)?.endsWith('~')
                    ? 'warning'
                    : names.find(name => name.name == (element as Calculation).value)?.list != null
                      ? 'error'
                      : 'info'}
                  label={!((element as Calculation).value as string)?.endsWith('~')
                    ? (element as Calculation).value
                    : ((element as Calculation).value as string).slice(0, -1)} />
                : <p className='text-sm'>{(element as Calculation).value}<p className='inline text-xs italic ml-2'>(wartość stała)</p> </p>

            }
          </div>
          {editorOpen
            ? <EditNumberValue {...{ path, initValue: element as Calculation, cancel: () => setEditorOpen(false), save: (value) => { modifySequence(['set_element', [path, value]]); setEditorOpen(false) }, type: 'number', inputType: 'text' }} />
            : null
          }
          {parenthesesEditor && isChild(path, parenthesesEditor) ? <Checkbox className='scale-125' checked={elementIndex >= Math.min(...parentheses) && elementIndex <= Math.max(...parentheses)}
            disabled={parentheses.length === 2 && !parentheses.includes(elementIndex)}
            onClick={() => modifyParentheses(elementIndex)} /> : null}
        </span> :
        <pre>BRAK</pre>

    }
  </>;
};

export const OperatorSelector = ({ path, type }: { path: number[]; type: 'calculation' | 'condition' }) => {
  const { sequence, modifySequence } = useSequence();
  const { parenthesesEditor } = useParenthesesEditor();

  const { element, operator } = getElement(sequence, path);

  const operators = React.useMemo(() => {
    if (type === 'condition')
      return [
        ['&', '∧'],
        ['|', '∨'],
        ['§', '⊻']
      ]
    else
      return [
        ['+', '+'],
        ['-', '-'],
        ['*', '×'],
        ['%', '%'],
        ['^', '^']
      ]
  }, [type])

  return <FormControl size='small'>
    <Select
      value={operator}
      onChange={(e) => modifySequence(['set_operator', [path, e.target.value as Operator]])}
      disabled={!!parenthesesEditor}
      size='small' className='rounded-lg' style={{ width: '3.5rem' }}
    >
      {operators.map(
        ([value, display]) =>
          <MenuItem {...{ value }} >
            {display}
          </MenuItem>
      )}
    </Select>
  </FormControl>;
};
