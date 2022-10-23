import { Add, Delete } from '@mui/icons-material';
import { Button, Checkbox, Menu, MenuItem } from '@mui/material';
import React from 'react';
import { ConditionCalculationSequence, getSubsequence, isChild, useParenthesesEditor, useSequence } from './ConditionCalculationEditorProvider';
import { EditCondition } from "./EditCondition";
import { EditNumberValue } from './EditNumberValue';
import { Element, OperatorSelector } from "./Element";

export const ElementsList = ({ path, type }: { path: number[]; type: 'calculation' | 'condition'; }) => {
  const { sequence, modifySequence } = useSequence();
  const subsequence = React.useMemo(() => getSubsequence(sequence, path), [path, sequence]);
  const elementIndex = React.useMemo(() => path.slice(-1)[0], [path]);
  const [editorOpen, setEditorOpen] = React.useState<boolean>(false);

  const { parenthesesEditor, setParenthesesEditor, modifyParentheses, setParentheses, parentheses } = useParenthesesEditor();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const parenthesesDone = () => {
    modifySequence(['add_parentheses', [path, parentheses as [number, number]]]);
    setParenthesesEditor(null); setParentheses([]);
  };
  const removeParentheses = () => { modifySequence(['remove_parentheses', path]); setAnchorEl(null); };

  React.useEffect(() => {
    if (path.length)
      if (subsequence.components.length === 0)
        modifySequence(['remove_element', path]);
  }, [subsequence]);

  return <span className={` w-full inline-flex gap-6 min-w-max items-start justify-between`}><div className={`inline-flex w-full items-start gap-3 flex-col `}>

    <div className='w-full inline-flex items-center'>
      <div onClick={handleClick} className={(parenthesesEditor ? 'pointer-events-none' : '') + ' rounded-lg cursor-pointer bg-slate-50 p-2 px-4 border border-transparent hover:border-blue-500 hover:bg-blue-50'}>(</div>

      <div className='border-b flex-1 ml-4 mr-4' />
      {parenthesesEditor && path.toString() === parenthesesEditor.toString() ?
        <span className='inline-flex items-center gap-4'>
          <Button size='small' onClick={parenthesesDone}>
            gotowe
          </Button>
          <Button size='small' color='error' onClick={() => setParenthesesEditor(null)}>anuluj</Button>
        </span>
        : null}
    </div>
    {path.length === 0 && subsequence.components.length === 0
      ? <pre className='border p-4 flex items-center w-full justify-center rounded-lg'>Brak {type === 'condition' ? 'warunku' : 'obliczeń'}</pre>
      : null}
    {subsequence.components.map(
      (value, index, array) => {
        return <span className='flex w-full  items-end'>
          <div className='-mb-6 mr-4'>{index !== array.length - 1
            ? <OperatorSelector type={type} path={path.concat([index])} />
            : subsequence.components.length > 1 ? <div className='w-14'></div> : null}</div>
          {(value as ConditionCalculationSequence).components
            ? <ElementsList type={type} path={path.concat([index])} />
            : <Element type={type} path={path.concat([index])} />}
        </span>;
      }
    )}

    {!parenthesesEditor ? <Button onClick={() => setEditorOpen(true)} className='self-start border-none' size='small'>
      <Add className='mr-2' />
      dodaj
      {type === 'calculation'
        ? ' część obliczeń'
        : ' podwarunek'}
    </Button> : null}
    {editorOpen
      ? type === 'condition'
        ? <EditCondition {...{ path, add: true, cancel: () => setEditorOpen(false) }}></EditCondition>
        : <EditNumberValue
          nested
          type='number'
          inputType='text'
          initValue={{ type: null, value: null }}
          cancel={() => setEditorOpen(false)}
          save={value => { modifySequence(['add_element', [path, value]]); setEditorOpen(false) }}
        />
      : null}
    <div className='w-full inline-flex items-center'>
      <div onClick={handleClick} className={(parenthesesEditor ? 'pointer-events-none' : '') + ' rounded-lg cursor-pointer bg-slate-50 p-2 px-4 border border-transparent hover:border-blue-500 hover:bg-blue-50'}>)</div>
      <div className='border-b flex-1 ml-4 mr-4' />
    </div>
    <Menu open={!!anchorEl && ((!path.length && subsequence.components.length < 3) ? false : true)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
      {subsequence.components.length >= 3 ?
        <MenuItem
          onClick={() => { setParenthesesEditor(path); setAnchorEl(null); }}
        >
          <Add className='mr-2' color='primary' /> Dodaj nowe nawiasy pomiędzy tymi nawiasami
        </MenuItem>
        : null}
      {path.length ? [
        <MenuItem onClick={removeParentheses}><Delete className='mr-2' color='error' /> Usuń nawiasy*</MenuItem>,
        <MenuItem disabled className=' opacity-100'> <p className=' text-slate-400 text-sm'>*usunięcie nawiasów nie spowoduje usunięcia podwarunków w nich zawartych</p></MenuItem>
      ] : null}
    </Menu>
  </div>
    {parenthesesEditor && isChild(path, parenthesesEditor) ? <Checkbox className='scale-125' checked={elementIndex >= Math.min(...parentheses) && elementIndex <= Math.max(...parentheses)}
      disabled={parentheses.length === 2 && !parentheses.includes(elementIndex)}
      onClick={() => modifyParentheses(elementIndex)} /> : null}
  </span>;
};
