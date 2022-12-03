import { AddTask } from '@mui/icons-material';
import { Chip, Tooltip } from '@mui/material';
import { isDate } from 'mathjs';
import React from "react";
import { useFormDescription } from '../../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { Calculation, comparatorsForNotRequiredValuesPolish, comparatorsPolish, Condition, ConditionCalculationSequence } from './ConditionCalculationEditorProvider';

export const ConditionCalculationDisplay = ({ reversed, sequence, first, type, tooltip, focused }: {
  sequence: ConditionCalculationSequence; reversed?: true, first?: true; type: 'calculation' | 'condition', tooltip?: true, focused?: boolean
}) => {
  const { names } = useFormDescription();

  const Wrapper = ({ children, first }: { children: React.ReactNode; first?: true; }) => {
    return first ? <span
      className={`rounded-lg inline-flex gap-1 ${tooltip ? '' : 'p-3'} items-center flex-wrap justify-start` + (reversed ? '' : ' ') + (focused ? 'border-blue-500 text-blue-500' : '')}
      style={tooltip ? {} : { background: reversed ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.3)' }}
    >
      {children}
    </span>
      : <>
        {children}
      </>;
  };

  return <Wrapper first>
    {sequence.components.map((element, index) => <> <>
      {(element as ConditionCalculationSequence).components
        ? <ConditionCalculationDisplay reversed={reversed} type={type} sequence={element as ConditionCalculationSequence} />
        : <div className={'inline-flex gap-2 items-center flex-wrap rounded-lg p-2' + (reversed ? ' text-white' : '')}>
          {index === 0 && !first ? <div className="bg-gray-300 p-2 rounded"><pre className="inline text-white">(</pre></div> : null}
          {type === 'condition' ? <>
            {(element as Condition).simpleValue == null ? <>
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
                  : (element as Condition).variable?.slice(0, -1)} />

              {comparatorsPolish.concat(comparatorsForNotRequiredValuesPolish).find(comp => comp[0] === (element as Condition).comparator)?.[1]}

              {(element as Condition).value.type != null && (element as Condition).value.value != null
                ? (element as Condition).value.type === 'variable'
                  ? ((element as Condition).value.value as string).endsWith('~')
                    ? <span className='inline-flex gap-3 items-center'>
                      <p className='text-xs'>długość listy</p> <Chip color='warning' label={((element as Condition).value.value as string).slice(0, -1)} />
                    </span>
                    : <Chip label={(element as Condition).value.value} />
                  : (element as Condition).value.type === 'constant'
                    ? <p className='text-sm'>{isDate((element as Condition).value.value)
                      ? ((element as Condition).value.value as Date)?.toLocaleDateString('pl-PL')
                      : (element as Condition).value.value} <p className='inline text-xs italic ml-2'>(wartość stała)</p>
                    </p>
                    : <Tooltip title={
                      <div className='p-2 sm:p-4 rounded-lg bg-white'>
                        <ConditionCalculationDisplay tooltip reversed type='calculation' sequence={(element as Condition).value.value as ConditionCalculationSequence} />
                      </div>
                    }><Chip className='rounded  bg-green-500 flex items-center' label={<pre className='text-sm text-white'><AddTask className='mr-2' /> obliczenia</pre>} /></Tooltip>

                : null}
            </> :
              <pre className='text-inherit'>{(element as Condition).simpleValue ? 'prawda' : 'fałsz'}</pre>
            }
          </>
            : <>
              {
                (element as Calculation).type === 'variable'
                  ? <>
                    {((element as Calculation).value as string)?.endsWith('~')
                      ? <p className='text-xs'>długość listy</p>
                      : null}
                    <Chip
                      color={((element as Calculation).value as string)?.endsWith('~')
                        ? 'warning'
                        : names.find(name => name.name == (element as Calculation).value)?.list != null
                          ? 'error'
                          : 'info'}
                      label={!((element as Calculation).value as string)?.endsWith('~')
                        ? (element as Calculation).value
                        : `Krok ${parseInt(((element as Calculation).value as string)?.slice(4, -7) ?? '-1') + 1}`} />
                  </>
                  : (element as Calculation).neutral ? <pre className='text-inherit'>Brak</pre> :
                    <p className='text-sm'>{(element as Calculation).value}<p className='inline text-xs italic'>(wartość stała)</p> </p>
              }
            </>
          }
        </div>}

      {index === sequence.components.length - 1 && !first ? <div className="p-2 bg-gray-300 rounded"><pre className="inline text-white">)</pre></div> : null}
    </>
      {
        index < sequence.components.length - 1
          ? <Chip size='small' color='secondary'
            label={getOperator(sequence.operators[index] as string)} />
          : null
      }
    </>)
    }
  </Wrapper >;
};

const getOperator = (operator: string) => {
  const operators = [
    ['&', '∧'],
    ['|', '∨'],
    ['§', '⊻'],
    ['+', '+'],
    ['-', '-'],
    ['*', '×'],
    ['%', '%'],
    ['^', '^']
  ]
  return operators.find(([id, display]) => id === operator)?.[1] ?? ''
}