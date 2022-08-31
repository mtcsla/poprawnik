import React from 'react';
import { FragmentDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import UserField, { FieldProps } from './Field';

export interface FragmentProps extends FieldProps<FragmentDescription> {
  index: number
}

const UserFragment = ({ element, index, context, valueDisplay, listElementValues, formDescription }: FragmentProps) => {
  const fields = React.useMemo(() => element.children.map((element, index) =>
    <UserField {...{ element, context, valueDisplay, listElementValues, formDescription }} key={index} />
  ), [listElementValues])
  return <div className='flex flex-col w-full'>
    <h2 style={{ letterSpacing: 0.6 }} className=' flex text-xl mb-0 items-start'>
      <pre className='text-blue-500  mr-2.5 font-bold'>
        {index + 1}.
      </pre>
      {element.title}
    </h2>
    <p className='text-slate-500 font-normal pl-8 text-base mb-6'>{element.subtitle}</p>
    <div className='flex justify-between items-start flex-wrap w-full'>
      {fields}
    </div>
  </div>;

}

export default UserFragment;