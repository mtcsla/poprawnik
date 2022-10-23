import React from 'react';
import { useTopLevelFormData } from '../../pages/forms/[id]/form';
import { FragmentDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { Evaluate } from '../utility/Evaluate';
import UserField, { FieldProps } from './Field';

export interface FragmentProps extends FieldProps<FragmentDescription> {
  index: number,
}

const UserFragment = ({ element, index, context, valueDisplay, listElementValues, formDescription }: FragmentProps) => {
  const fields = React.useMemo(() => element.children.map((field_element, index) =>
    <UserField {...{ element: field_element, context, valueDisplay, listElementValues, formDescription, fragmentCondition: element.condition }} key={index} />
  ), [listElementValues])

  const topData = useTopLevelFormData();

  const active = React.useMemo(() => {
    return Evaluate.sequence(
      element.condition,
      topData.values,
      formDescription,
      topData.currentListIndex ?? undefined,
    ).condition()
  }, [topData.values])

  return <div className={`flex relative flex-col w-full`}>
    {
      !active ?
        <div className='absolute -top-2 -left-2 -right-2 -bottom-2 z-50 bg-slate-400 bg-opacity-5 cursor-not-allowed rounded-lg flex items-center justify-center p-4' >
          <pre className='text-base text-blue-500 bg-gray-50 px-4 p-1 rounded'>Nie dotyczy</pre>
        </div>
        : null
    }
    {element.title ?
      <h2 style={{ letterSpacing: 0.6 }} className=' flex text-xl mb-0 items-start'>

        <pre className='text-blue-500  mr-2.5 font-bold'>
          {index + 1}.
        </pre>
        {element.title}
      </h2>
      : null
    }
    {element.subtitle
      ?
      <p className='text-slate-500 font-normal pl-8 text-base mb-6'>{element.subtitle}</p>
      : null
    }
    <div className='flex justify-between items-start flex-wrap w-full'>
      {fields}
    </div>
  </div>;

}

export default UserFragment;