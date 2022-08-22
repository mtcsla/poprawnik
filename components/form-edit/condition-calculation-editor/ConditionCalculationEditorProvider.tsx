import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { cloneDeep } from 'lodash';
import React from 'react';
import { useFormEditorLocation } from '../FormEditor';
import { ElementsList } from './ElementsList';

export type Condition = {
  variable: string | null,
  comparator: string | null,
  value: ConditionValue,
  simpleValue?: boolean,
}
export type ConditionValue = {
  type: 'variable' | 'constant' | 'calculation' | null
  value: string | number | Date | ConditionCalculationSequence | null
}

export interface Calculation extends ConditionValue {
  neutral?: true
};

export type Subcondition = Condition | Calculation

export type OperatorCondition = '&' | '|' | '§'
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

export const useSequence = () => React.useContext(sequenceContext);
export const useParenthesesEditor = () => React.useContext(parenthesesContext);
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
        let subsequence = getSubsequence(newState, path, true);
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

export function getSubsequence(sequence: ConditionCalculationSequence, path: number[], reference?: true): ConditionCalculationSequence {
  let newSequence = reference ? sequence : cloneDeep(sequence);
  for (let number of path) {
    if (!newSequence.components[number])
      throw new Error('Path doesn\'t point to subsequence.')
    newSequence = newSequence.components[number] as ConditionCalculationSequence;
  }
  return newSequence;
}
export function getElement(sequence: ConditionCalculationSequence, path: number[], reference?: true): { element: Subcondition, operator: Operator } {
  const parentSequence = getSubsequence(sequence, path.slice(0, -1), reference);
  return {
    element: parentSequence.components[path.slice(-1)[0]] as Subcondition,
    operator: parentSequence.operators[path.slice(-1)[0]]
  }
}
export function isChild(path: number[], subpath: number[]): boolean {
  return path.slice(0, -1).toString() === subpath.toString() && !!path.toString();
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


export const getEmptyCondition = (): Condition => ({
  variable: null,
  comparator: null,
  value: {
    type: null,
    value: null
  }
})
const getEmptyCalculation = (): Calculation => ({ type: null, value: null });

export default ConditionCalculationEditor;