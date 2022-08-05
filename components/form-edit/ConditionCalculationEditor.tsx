import { Add, Delete, Edit } from '@mui/icons-material';
import { Button, ButtonGroup, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Menu, MenuItem, Select, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Field, Formik } from 'formik';
import { cloneDeep } from 'lodash';
import React from 'react';
import { FieldValueType, useFormDescription, valueTypeToPolish } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { useFormEditorLocation } from './FormEditor';

export type Condition = {
  variable: string | null,
  comparator: string | null,
  value: ConditionValue
}
export type ConditionValue = {
  type: 'variable' | 'constant' | 'calculation' | null
  value: string | number | Calculation | null
}

export type Calculation = string | number | null;

export type Subcondition = Condition | Calculation

export type OperatorCondition = '&' | '|' | '%'
export type OperatorCalculation = '+' | '-' | '/' | '*' | '^'

export type Operator = OperatorCondition | OperatorCalculation | null;

export type ConditionCalculationSequence = { components: (Subcondition | ConditionCalculationSequence)[], operators: Operator[] }


function checkIfValid(sequence: ConditionCalculationSequence): boolean {
  let result = true;

  sequence.components.forEach(
    (item, index, arr) => {
      if (index != (arr.length - 1)) {
        if (sequence.operators[index] == null) {
          result = false;
        }
      }
      if ((item as ConditionCalculationSequence).components || (item as ConditionCalculationSequence).operators)
        if (!checkIfValid(item as ConditionCalculationSequence))
          result = false;
    }
  )
  return result;
}

const sequenceContext = React.createContext<{ sequence: ConditionCalculationSequence, modifySequence: React.Dispatch<SequenceAction> }>(
  {
    sequence: { components: [], operators: [] },
    modifySequence: () => { }
  }
);
const parenthesesContext = React.createContext<{
  parenthesesEditor: number[] | null, setParenthesesEditor: React.Dispatch<number[] | null>,
  setParentheses: React.Dispatch<number[]>,
  parentheses: number[],
  modifyParentheses: (number: number) => void
}>({
  parentheses: [],
  parenthesesEditor: null,
  setParentheses: () => { },
  setParenthesesEditor: () => { },

  modifyParentheses: (number: number) => { }
})

const useSequence = () => React.useContext(sequenceContext);
const useParenthesesEditor = () => React.useContext(parenthesesContext);
const ConditionCalculationEditor = ({ exit, save, type, initValue }: {
  exit: () => void,
  save: (condition: ConditionCalculationSequence) => void,
  type: 'calculation' | 'condition',
  initValue?: ConditionCalculationSequence
}) => {

  const { location } = useFormEditorLocation();
  const [step, fragment, field]: [number, number, number] = location as [number, number, number];
  const [parenthesesEditor, setParenthesesEditor] = React.useState<number[] | null>(null);
  const [parentheses, setParentheses] = React.useState<number[]>([])

  const modifyParentheses = (number: number) => {
    if (!parentheses.includes(number)) {
      let newParentheses = parentheses.concat([number])
      if (newParentheses.length > 2)
        newParentheses = newParentheses.slice(1);
      setParentheses(newParentheses);
    }
    else if (parentheses.length === 2) {
      let newParentheses
      if (parentheses[0] == number)
        newParentheses = [parentheses[1]]
      else
        newParentheses = [parentheses[0]]
      setParentheses(newParentheses);
    } else {
      setParentheses([]);
    }
  }

  const [sequence, modifySequence] = React.useReducer(
    sequenceReducer,
    initValue ?? { components: [], operators: [] } as ConditionCalculationSequence
  );

  const valid = React.useMemo(() => { return checkIfValid(sequence); }, [sequence]);




  return <sequenceContext.Provider value={{ sequence, modifySequence }}>
    <parenthesesContext.Provider value={{ parenthesesEditor, setParenthesesEditor, parentheses, setParentheses, modifyParentheses }}>
      <Dialog className='max-w-none' open>
        <DialogTitle className='flex flex-col'>
          {!parenthesesEditor ? <>
            <pre className='text-sm'>Edytujesz warunek</pre>
            <p className='text-sm'>Ustal pod jakim warunkiem pole będzie aktywne.</p>
          </> : <>
            <pre className='text-sm'>Dodajesz nawiasy</pre>
            <p className='text-sm'>Zaznacz początek i koniec nawiasu.</p>
          </>
          }
        </DialogTitle>

        <DialogContent style={{ minWidth: 500 }} className=' flex w-auto flex-col'>
          <ElementsList type={type} path={parenthesesEditor == null ? [] : parenthesesEditor} />
        </DialogContent>


        {!parenthesesEditor ? <DialogActions>
          <Button size='small' onClick={() => save(sequence)} className='border-none' disabled={!valid}>zapisz</Button>
          <Button onClick={exit} size='small' color='error' className='border-none'>anuluj</Button>
        </DialogActions> : null}
      </Dialog>
    </parenthesesContext.Provider>
  </sequenceContext.Provider>
}

export type SequenceAction =
  ['add_element', [number[], Condition | Calculation]]
  | ['remove_element', number[]]
  | ['insert_element', [number[], Condition | Calculation]]
  | ['add_parentheses', [number[], [number, number]]]
  | ['remove_parentheses', number[]]
  | ['set_operator', [number[], Operator]]
  | ['set_element', [number[], Condition | Calculation]]

function sequenceReducer(
  state: ConditionCalculationSequence,
  [actionType, actionValue]: SequenceAction
): ConditionCalculationSequence {
  const newState = cloneDeep(state);
  switch (actionType) {
    case 'add_element':
      {
        const [path, newElement] = actionValue;
        let subsequence = getSubsequence(newState, path.slice(0, -1), true);
        subsequence.components.push(newElement); subsequence.operators.push(null);
      }
      break;
    case 'insert_element':
      break;
    case 'remove_element':
      {
        const path = actionValue;
        const newSubsequence = getSubsequence(newState, path.slice(0, -1), true);

        newSubsequence.components.splice(path.slice(-1)[0], 1)
        newSubsequence.operators.splice(path.slice(-1)[0], 1)
      }
      break;
    case 'add_parentheses':
      {
        const [path, [start, end]] = actionValue;
        const subsequence = getSubsequence(newState, path, true);
        const newSubsequence = {
          components:
            subsequence.components.slice(Math.min(start, end), Math.max(start, end) + 1),
          operators: subsequence.operators.slice(Math.min(start, end), Math.max(start, end)),
        }
        subsequence.components.splice(Math.min(start, end), Math.max(start, end) - Math.min(start, end) + 1);
        subsequence.operators.splice(Math.min(start, end), Math.max(start, end) - Math.min(start, end));

        subsequence.components.splice(Math.min(start, end), 0, newSubsequence);
      }
      break;
    case 'remove_parentheses':
      {
        const path = actionValue;
        const subsequence = getSubsequence(newState, path.slice(0, -1), true);
        const index = path.slice(-1)[0]

        const removedElement =
          subsequence.components.splice(index, 1)[0]
        subsequence.components.splice(index, 0, ...(removedElement as ConditionCalculationSequence).components)
        subsequence.operators.splice(index, 0, ...(removedElement as ConditionCalculationSequence).operators)
      }
      break;
    case 'set_operator':
      {
        const [path, operator] = actionValue;
        const subsequence = getSubsequence(newState, path.slice(0, -1), true);

        subsequence.operators[path.slice(-1)[0]] = operator;
      }
      break;
    case 'set_element':
      {
        const [path, element] = actionValue;
        const subsequence = getSubsequence(newState, path.slice(0, -1), true);

        subsequence.components[path.slice(-1)[0]] = element;
      }
      break;
    default:
      break;
  }

  return newState;
}

function getSubsequence(sequence: ConditionCalculationSequence, path: number[], reference?: true): ConditionCalculationSequence {
  let newSequence = reference ? sequence : cloneDeep(sequence);
  for (let number of path) {
    if (!newSequence.components[number])
      throw new Error('Path doesn\'t point to subsequence.')
    newSequence = newSequence.components[number] as ConditionCalculationSequence;
  }
  return newSequence;
}
function getElement(sequence: ConditionCalculationSequence, path: number[], reference?: true): { element: Subcondition, operator: Operator } {
  const parentSequence = getSubsequence(sequence, path.slice(0, -1), reference);
  return {
    element: parentSequence.components[path.slice(-1)[0]] as Subcondition,
    operator: parentSequence.operators[path.slice(-1)[0]]
  }
}
function isChild(path: number[], subpath: number[]): boolean {
  return path.slice(0, -1).toString() === subpath.toString() && !!path.toString();
}


const ElementsList = ({ path, type }: { path: number[], type: 'calculation' | 'condition' }) => {
  const { sequence, modifySequence } = useSequence();
  const subsequence = React.useMemo(() => getSubsequence(sequence, path), [path, sequence]);
  const elementIndex = React.useMemo(() => path.slice(-1)[0], [path])
  const [editorOpen, setEditorOpen] = React.useState<boolean>(false);

  const { parenthesesEditor, setParenthesesEditor, modifyParentheses, setParentheses, parentheses } = useParenthesesEditor();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const parenthesesDone = () => {
    modifySequence(['add_parentheses', [path, parentheses as [number, number]]]);
    setParenthesesEditor(null); setParentheses([]);
  }
  const removeParentheses = () => { modifySequence(['remove_parentheses', path]); setAnchorEl(null) }

  React.useEffect(() => {
    if (path.length)
      if (subsequence.components.length === 0)
        modifySequence(['remove_element', path]);
  }, [subsequence])

  return <span className='w-full inline-flex gap-6 min-w-max items-start justify-between'><div className={'inline-flex w-full items-start gap-3 flex-col'}>

    <div className='w-full inline-flex items-center'>
      <div onClick={handleClick} className={(parenthesesEditor ? 'pointer-events-none' : '') + ' rounded-lg cursor-pointer bg-slate-50 p-2 px-4 border border-transparent hover:border-blue-500 hover:bg-blue-50'}>(</div>

      <div className='border-b flex-1 ml-4 mr-4' />
      {
        parenthesesEditor && path.toString() === parenthesesEditor.toString() ?
          <span className='inline-flex items-center gap-4'>
            <Button size='small' onClick={parenthesesDone}>
              gotowe
            </Button>
            <Button size='small' color='error' onClick={() => setParenthesesEditor(null)}>anuluj</Button>
          </span>
          : null
      }
    </div>
    {
      path.length === 0 && subsequence.components.length === 0
        ? <pre className='border p-4 flex items-center justify-center rounded-lg'>Brak warunku</pre>
        : null
    }
    {
      subsequence.components.map(
        (value, index, array) => {
          return <span className='flex w-full  items-end'>
            <div className='-mb-6 mr-4'>{
              index !== array.length - 1
                ? <OperatorSelector path={path.concat([index])} />
                : subsequence.components.length > 1 ? <div className='w-14'></div> : null
            }</div>
            {
              (value as ConditionCalculationSequence).components
                ? <ElementsList type={type} path={path.concat([index])} />
                : <Element type={type} path={path.concat([index])} />
            }
          </span>
        }
      )
    }

    {!parenthesesEditor ? <Button onClick={() => setEditorOpen(true)} className='self-start border-none' size='small'>
      <Add className='mr-2' />
      dodaj
      {
        type === 'calculation'
          ? ' część obliczeń'
          : ' podwarunek'
      }
    </Button> : null}
    {editorOpen
      ? <EditCondition {...{ path, add: true, cancel: () => setEditorOpen(false) }}></EditCondition>
      : null
    }
    <div className='w-full inline-flex items-center'>
      <div onClick={handleClick} className={(parenthesesEditor ? 'pointer-events-none' : '') + ' rounded-lg cursor-pointer bg-slate-50 p-2 px-4 border border-transparent hover:border-blue-500 hover:bg-blue-50'}>)</div>
      <div className='border-b flex-1 ml-4 mr-4' />
    </div>
    <Menu open={!!anchorEl && ((!path.length && subsequence.components.length < 3) ? false : true)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
      {subsequence.components.length >= 3 ?
        <MenuItem
          onClick={() => { setParenthesesEditor(path); setAnchorEl(null) }}
        >
          <Add className='mr-2' color='primary' /> Dodaj nowe nawiasy pomiędzy tymi nawiasami
        </MenuItem>
        : null
      }
      {path.length ? [
        <MenuItem onClick={removeParentheses}><Delete className='mr-2' color='error' /> Usuń nawiasy*</MenuItem>,
        <MenuItem disabled className=' opacity-100'> <p className=' text-slate-400 text-sm'>*usunięcie nawiasów nie spowoduje usunięcia podwarunków w nich zawartych</p></MenuItem>
      ] : null
      }
    </Menu>
  </div >
    {parenthesesEditor && isChild(path, parenthesesEditor) ? <Checkbox className='scale-125' checked={elementIndex >= Math.min(...parentheses) && elementIndex <= Math.max(...parentheses)}
      disabled={parentheses.length === 2 && !parentheses.includes(elementIndex)}
      onClick={() => modifyParentheses(elementIndex)} /> : null}
  </span>
}

const EditCondition = ({ path, add, cancel, initValue }: { path: number[], add?: true, cancel: () => void, initValue?: Condition }) => {

  const { names, description } = useFormDescription();
  const { location } = useFormEditorLocation();
  const [step, fragment, field] = location as [number, number, number];
  const { sequence, modifySequence } = useSequence();

  const [valueEditorOpen, setValueEditorOpen] = React.useState(false);

  const globalVariableNames = React.useMemo(() => names.filter(item =>
    (item.step < step || (item.step === step && item.fragment < fragment))
    && item.list == null
  ).map((item) => <MenuItem value={item.name} className='flex items-center justify-between'>
    <Chip color='info' label={item.name} /> {valueTypeToPolish(item.valueType)}
  </MenuItem>), [names, step, fragment])

  const listVariableNames = React.useMemo(() => names.filter(item =>
    item.list === step && item.fragment < fragment
  ).map((item) => <MenuItem value={item.name} className='flex items-center justify-between'>
    <Chip color='error' label={item.name} /> {valueTypeToPolish(item.valueType)}
  </MenuItem>), [names, step, fragment])

  const listNames = React.useMemo(() => description.filter(
    (item, index) => item.type === 'list' && index < step
  ).map((item, index) =>
    <MenuItem value={`list${index}Length~`} className='flex items-center justify-between'>
      <span className='inline-flex gap-3 items-center'>
        długość listy <Chip color='warning' label={`Krok ${index + 1}`} />
      </span>
      liczba
    </MenuItem>
  ), [description.length, step])

  const emptyList =
    <MenuItem disabled><pre>brak</pre></MenuItem>


  return <Dialog open>
    <DialogTitle>
      <pre className='text-sm'>{!add ? 'Edytujesz' : 'Dodajesz'} warunek</pre>
      <p className='text-sm'>Edytuj ten prosty warunek...</p>
    </DialogTitle>

    <Formik initialValues={initValue ?? getEmptyCondition()} onSubmit={() => { }}>
      {({ values, setFieldValue }) => {
        const save = () => {
          if (add) {
            modifySequence(['add_element', [path, values]])
          } else {

            modifySequence(['set_element', [path, values]])
          }
          cancel()
        }

        const [loaded1, setLoaded1] = React.useState<boolean>(false);
        const [loaded2, setLoaded2] = React.useState<boolean>(false);

        const variableValueType = React.useMemo((): FieldValueType => {
          if (values.variable?.endsWith('Length~'))
            return 'number';
          return names.find(name => values.variable === name.name)?.valueType ?? 'number' as FieldValueType;
        }, [values.variable])
        const variableRequired = React.useMemo((): boolean => {
          if (values.variable?.endsWith('Length~'))
            return true;
          return names.find(name => values.variable === name.name)?.required ?? false as boolean;
        }, [values.variable]);

        React.useEffect(
          () => {
            if (loaded1) { setFieldValue('comparator', null); setFieldValue('value', getEmptyCondition().value) } else setLoaded1(true);
          }, [values.variable]
        )
        React.useEffect(
          () => { if (loaded2) setFieldValue('value', getEmptyCondition().value); else setLoaded2(true) }, [values.comparator]
        )

        return <>
          <DialogContent className='inline-flex gap-2 flex-col pt-2' style={{ minWidth: 300 }} >
            <p className='text-sm text-slate-600'>wartośc prawdziwa, gdy: </p>
            <FormControl>
              <InputLabel>pierwszy argument</InputLabel>
              <Field as={Select} name='variable' label='pierwszy składnik' className='flex justify-between' >
                <MenuItem disabled className='opacity-100'>Listy</MenuItem>
                {listNames.length ? listNames : emptyList}
                <MenuItem disabled className='opacity-100'>Zmienne globalne</MenuItem>
                {globalVariableNames.length ? globalVariableNames : emptyList}
                <MenuItem disabled className='opacity-100'>Zmienne listowe</MenuItem>
                {listVariableNames.length ? listVariableNames : emptyList}
              </Field>
            </FormControl>
            <FormControl>
              <InputLabel>operator</InputLabel>
              <Field disabled={!values.variable} name='comparator' as={Select} className='min-w-0' label='operator' >
                <MenuItem disabled className='opacity-100'>Cechy wartości</MenuItem>
                {comparatorsForNotRequiredValuesPolish.map(([id, label, hint]) =>
                  <MenuItem disabled={variableRequired} value={id}>
                    <span className='flex items-center justify-between w-full'>
                      <Chip color='primary' className='mr-2' label={label} />
                      {hint}
                    </span>
                  </MenuItem>
                )}
                <MenuItem disabled className='opacity-100'>Porównywanie wartości</MenuItem>
                {comparatorsPolish.map(([id, label, hint]) =>
                  <MenuItem disabled={variableValueType === 'text' && !comparatorsText.includes(id)} value={id}>
                    <span className='flex items-center justify-between w-full'>
                      <Chip color='secondary' className='mr-2' label={label} />
                      {hint}
                    </span>
                  </MenuItem>
                )}
              </Field>
            </FormControl>
            {
              ['exists', 'not-exists'].includes(values.comparator as string)
                ? null
                : <Button onClick={() => setValueEditorOpen(true)} disabled={!values.comparator} size='small' className='p-3 mt-0.5 rounded'>
                  <p className='w-full text-left text-base text-slate-500 font-normal normal-case'>
                    {values.value.type === null || values.value.value === null
                      ? 'drugi argument'
                      : values.value.type === 'variable'
                        ? <span className='flex items-center justify-between w-full'>
                          <Chip className='mr-2' label={values.value.value} />
                          {valueTypeToPolish(variableValueType)}
                        </span>
                        : values.value.type === 'constant'
                          ? <span className='flex flex-col'><p className='text-xs text-slate-500'>wartość stała</p>
                            {values.value.value}
                          </span>
                          : null
                    }
                  </p>
                </Button>
            }
            {valueEditorOpen ?
              <EditNumberValue initValue={values.value} type={variableValueType} cancel={() => setValueEditorOpen(false)}
                save={(values) => { setFieldValue('value', values); setValueEditorOpen(false) }} />
              : null
            }
          </DialogContent>
          <DialogActions>
            <Button size='small' className='border-none'
              disabled={!values.variable || !values.value || !values.comparator} onClick={save}>Gotowe</Button>
            <Button size='small' className='border-none' color='error' onClick={cancel}>Anuluj</Button>
          </DialogActions>

          <DialogContent>
            <p className='text-sm font-semibold'>...lub wybierz prostą wartość logiczną:</p>
            <p className='text-xs text-slate-500 mb-4' style={{ maxWidth: 350 }}>wybranie prostej wartości wymaże wartości wprowadzone w pola prostego warunku</p>

            <ButtonGroup className='w-full'>
              <Button className='flex-1 rounded-l'>prawda</Button>
              <Button className='flex-1 rounded-r'>fałsz</Button>
            </ButtonGroup>
          </DialogContent>

        </>
      }}
    </Formik>

  </Dialog>
}
const EditNumberValue = ({ type, save, cancel, initValue }:
  {
    type: FieldValueType,
    initValue: ConditionValue,
    save: (value: ConditionValue) => void,
    cancel: () => void,

  }) => {

  const { names, description } = useFormDescription();
  const { location } = useFormEditorLocation();
  const [step, fragment, field] = location as [number, number, number];

  const globalVariableNames = React.useMemo(() => names.filter(item =>
    (item.step < step || (item.step === step && item.fragment < fragment))
    && item.list == null && item.valueType === type
  ).map((item) => <MenuItem value={item.name} className='flex items-center justify-between'>
    <Chip color='info' label={item.name} /> {valueTypeToPolish(item.valueType)}
  </MenuItem>), [names, step, fragment])

  const listVariableNames = React.useMemo(() => names.filter(item =>
    item.list === step && item.fragment < fragment && item.valueType === type
  ).map((item) => <MenuItem value={item.name} className='flex items-center justify-between'>
    <Chip color='error' label={item.name} /> {valueTypeToPolish(item.valueType)}
  </MenuItem>), [names, step, fragment])

  const listNames = React.useMemo(() => description.filter(
    (item, index) => item.type === 'list' && index < step
  ).map((item, index) =>
    <MenuItem value={`list${index}Length~`} className='flex items-center justify-between'>
      <span className='inline-flex gap-3 items-center'>
        długość listy <Chip color='warning' label={`Krok ${index + 1}`} />
      </span>
      liczba
    </MenuItem>
  ), [description.length, step])

  const emptyList =
    <MenuItem disabled><pre>brak</pre></MenuItem>

  return <Dialog open>
    <DialogTitle><pre className='text-sm'>Edytujesz wartość liczbową</pre></DialogTitle>
    <Formik initialValues={initValue} onSubmit={() => { }}>
      {({ values, setFieldValue }) => {

        const [loaded, setLoaded] = React.useState(false);
        React.useEffect(() => {
          if (loaded)
            setFieldValue('value', null)
          else setLoaded(true);
        }, [values.type])

        return <>
          <DialogContent className='pt-2 inline-flex flex-col gap-3'>

            <FormControl>
              <InputLabel>rodzaj wartości</InputLabel>
              <Field as={Select} name='type' label='rodzaj wartości' className='flex justify-between' >
                <MenuItem value='variable'>zmienna</MenuItem>
                <MenuItem value='constant'>stała</MenuItem>
                <MenuItem value='calculation' disabled>obliczenia</MenuItem>
              </Field>
            </FormControl>

            {
              values.type === 'variable'
                ? <FormControl>
                  <InputLabel>zmienna</InputLabel>
                  <Field value={values.value} as={Select} name='value' label='zmienna' className='flex justify-between' >
                    {type === 'number'
                      ?
                      [<MenuItem disabled className='opacity-100'>Listy</MenuItem>].concat(
                        listNames.length ? listNames : emptyList)
                      : null
                    }
                    <MenuItem disabled className='opacity-100'>Zmienne globalne</MenuItem>
                    {globalVariableNames.length ? globalVariableNames : emptyList}
                    {description[step].type === 'list'
                      ?
                      [
                        <MenuItem disabled className='opacity-100'>Zmienne listowe</MenuItem>
                      ].concat(listVariableNames.length ? listVariableNames : emptyList)
                      : null
                    }
                  </Field>
                </FormControl>
                : values.type === 'constant'
                  ? <Field as={type === 'date' ? DatePicker : TextField} type={type} placeholder={
                    `wprowadź ${type === 'text'
                      ? 'tekst'
                      : type == 'number'
                        ? 'liczbę'
                        : 'datę'
                    }`

                  } name='value' />
                  : values.type
                    ? <Button>Wybierz</Button>
                    : <TextField disabled placeholder='wartość' />
            }
          </DialogContent>
          <DialogActions>
            <Button size='small' className='border-none' disabled={!values.type || !values.value} onClick={() => save(values)}>Gotowe</Button>
            <Button size='small' className='border-none' color='error' onClick={cancel}>Anuluj</Button>
          </DialogActions>
        </>
      }}
    </Formik>
  </Dialog>
}

export const comparatorsForNotRequiredValuesPolish = [
  ['not-exists', 'nie istnieje', 'pole jest puste'],
  ['exists', 'istnieje', 'pole nie jest puste'],
]
export const comparatorsPolish = [
  ['<', '<', 'jest mniejsze od'],
  ['<=', '≤', 'jest równe lub mniejsze od'],
  ['>', '>', 'jest większe od'],
  ['>=', '≥', 'jest równe lub większe od'],
  ['==', '=', 'równa się'],
  ['!=', '≠', 'różni się od'],
]
export const comparatorsText = ['==', '!=']


const Element = ({ path, type }: { path: number[], type: 'condition' | 'calculation' }) => {
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

  return <>{
    type === 'condition'
      ? <span className='inline-flex w-full justify-between gap-6'>
        <div onClick={handleClick} className='border border-transparent hover:border-blue-500 hover:bg-blue-50 hover:cursor-pointer inline-flex gap-2 items-center rounded-lg bg-slate-100 p-2'>
          {
            (element as Condition).variable?.endsWith('~')
              ? <p className='text-xs'>długość listy</p>
              : null
          }

          <Chip
            color={(element as Condition).variable?.endsWith('~')
              ? 'warning'
              : names.find(name => name.name == (element as Condition).variable)?.list != null
                ? 'error'
                : 'info'
            }
            label={
              !(element as Condition).variable?.endsWith('~')
                ? (element as Condition).variable
                : `Krok ${parseInt((element as Condition).variable?.slice(4, -7) ?? '-1') + 1}`
            } />

          {comparatorsPolish.concat(comparatorsForNotRequiredValuesPolish).find(comp => comp[0] === (element as Condition).comparator)?.[1]}

          {
            (element as Condition).value.type != null && (element as Condition).value.value != null
              ? (element as Condition).value.type === 'variable'
                ? <Chip label={(element as Condition).value.value} />
                : (element as Condition).value.type === 'constant'
                  ? <p className='text-sm'>{(element as Condition).value.value}<p className='inline text-xs italic ml-2'>(wartość stała)</p> </p>
                  : null //to be replaced 
              : null
          }
        </div>
        <Menu open={!!anchorEl} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
          <MenuItem onClick={() => { setEditorOpen(true); setAnchorEl(null); }}>
            <Edit color='primary' className='mr-2' /> Edytuj {type === 'condition' ? 'podwarunek' : 'część obliczeń'}
          </MenuItem>
          <MenuItem onClick={() => { modifySequence(['remove_element', path]); setAnchorEl(null); }}>
            <Delete color='error' className='mr-2' /> Usuń {type === 'condition' ? 'podwarunek' : 'część obliczeń'}
          </MenuItem>
        </Menu>
        {editorOpen
          ? <EditCondition {...{ path, initValue: element as Condition, cancel: () => setEditorOpen(false) }}></EditCondition>
          : null
        }
        {parenthesesEditor && isChild(path, parenthesesEditor) ? <Checkbox className='scale-125' checked={elementIndex >= Math.min(...parentheses) && elementIndex <= Math.max(...parentheses)}
          disabled={parentheses.length === 2 && !parentheses.includes(elementIndex)}
          onClick={() => modifyParentheses(elementIndex)} /> : null}
      </span>
      : JSON.stringify(element)}
  </>
}

const OperatorSelector = ({ path }: { path: number[] }) => {
  const { sequence, modifySequence } = useSequence();
  const { parenthesesEditor } = useParenthesesEditor();

  const { element, operator } = getElement(sequence, path);

  return <FormControl size='small'>
    <Select
      value={operator}
      onChange={(e) => modifySequence(['set_operator', [path, e.target.value as Operator]])}
      disabled={!!parenthesesEditor}
      size='small' className='rounded-lg' style={{ width: '3.5rem' }}
    >
      <MenuItem value='&'>
        ∧
      </MenuItem>
      <MenuItem value='|'>
        ∨
      </MenuItem>
      <MenuItem value='§'>
        ⊻
      </MenuItem>
    </Select>
  </FormControl>
}

const getEmptyCondition = (): Condition => ({
  variable: null,
  comparator: null,
  value: {
    type: null,
    value: null
  }
})
const getEmptyCalculation = (): Calculation => null;

export default ConditionCalculationEditor;