import { ArrowDownward, ArrowDropDown, ArrowDropUp, ArrowForwardIos, ArrowUpward, Delete, Edit, List } from '@mui/icons-material';
import { Button, ButtonGroup } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { useFormValue, useTopLevelFormData } from '../../pages/forms/[id]/form';
import { StepDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { InitialValues } from '../utility/InitialValues';
import { FieldProps } from './Field';
import UserFragment from './Fragment';

export interface StepProps extends FieldProps<StepDescription> {
  nested?: true,
  setEditingElement?: React.Dispatch<number | null>
}


const UserStep = ({ element, context, nested, display, setEditingElement, listElementValues, formDescription }: StepProps) => {
  const { values, setFieldValue, setFieldError } = useFormValue();
  const topLevelData = useTopLevelFormData();

  const fragments = React.useMemo(() => element.children.map(
    (element, index) => <UserFragment {...{ element, index, context, valueDisplay: display, formDescription, listElementValues }} key={index} />),
    element.type === 'step' ? [element] : [element, listElementValues]
  );
  const formikData = React.useContext(context ?? React.createContext({} as any));


  const listElements =
    React.useMemo(() => {
      if (nested)
        return [<></>]
      return element.type === 'list' ?
        (values[element.name]?.length ?
          (values[element.name] as []).map(
            (value, index, arr) =>
              <>
                <div className={`pt-0 flex flex-col bg-white  ${(topLevelData.currentListIndex != null && index === values[element.name]?.length - 1 && topLevelData.newElement) ? 'hidden' : ''}`}>
                  <div className='inline-flex gap-2 items-center justify-between flex-wrap rounded-t-lg w-full min-h-14 mb-8  py-4'>
                    <pre className='text-black text-sm sm:text-base my-2'>Wartość <b className=' ml-1 text-base sm:text-lg'>{index + 1}</b></pre>

                    <ButtonGroup>
                      <Tooltip title='Zamień z wartością wyżej.'>
                        <Button disabled={index === 0} className='px-3 border-r bg-white border-slate-200 rounded-l'>
                          <ArrowUpward className='scale-75' />
                          <ArrowDropDown />
                        </Button>
                      </Tooltip>
                      <Tooltip title='Zamień z wartością niżej.'>
                        <Button disabled={index === (values[element.name] as []).length - 1} className='rounded-r px-3 border-slate-200 bg-white'>
                          <ArrowDropUp />
                          <ArrowDownward className='scale-75' />
                        </Button>
                      </Tooltip>
                    </ButtonGroup>
                  </div>


                  <div className=' cursor-not-allowed'>
                    <UserStep listElementValues={value} nested={true} display formDescription={formDescription} key={index} element={element} />
                  </div>
                  <div className='flex w-full p-4 sm:px-6 px-4 justify-end'>
                    <Button
                      onClick={() => setEditingElement?.(index)}
                      className='border-none'>
                      <Edit className='mr-3' />
                      edytuj
                    </Button>
                    <Button color='error' className='border-none'>
                      <Delete className='mr-3' />
                      usuń
                    </Button>
                  </div>
                </div>
                {
                  index < arr.length - 1
                    ? <div className='border-t border-slate-100 my-4' />
                    : null
                }
              </>
          ) :
          <div className='flex flex-col items-center justify-center w-full h-72 bg-slate-50 rounded-lg'>
            <pre className='text-black font-bold whitespace-normal'>
              Brak wartości
            </pre>
            <p className='text-sm md:text-base'>Dodaj wartości do listy.</p>

          </div>
        )
        : [<></>]
    }, [values[element.name], topLevelData.currentListIndex, formikData?.errors?.[element.name]])

  return element.type === 'step' || nested
    ? <div className='inline-flex w-full gap-6 flex-col'>
      {fragments}
    </div>
    : <>
      <pre className='text-sm justify-end flex items-center mb-4'><List className='mr-2' color='primary' /> Ten krok jest listą</pre>
      <p className='mb-8'>
        <ArrowForwardIos className='mr-1 -translate-y-0.5' color='primary' /> Dodaj wartości do listy.
      </p>

      {listElements}

      <Button size='small' onClick={
        () => {
          setFieldValue(element.name, [...values[element.name], InitialValues.fromStep(element)]);
          setEditingElement?.(-1);
        }
      } className='self-end border-none'>
        dodaj wartość
      </Button>
    </>
}



/*<>
  <Formik initialValues={
    (editingElement as number) >= 0
      ? (values[element.name] as [])[editingElement as number]
      : stepToInitData(element)
  } onSubmit={() => { }}>
    {() => null}
  </Formik>
</>
*/
export default UserStep;