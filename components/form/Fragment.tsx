import React from 'react';
import { FormikContextValue, FormValues, NestedFormValue } from '../../pages/forms/[id]/form';
import { FragmentDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import UserField from './Field';

export type UserFragmentProps = {
  fragment: FragmentDescription,
  index: number
  context?: React.Context<FormikContextValue>
  display?: true
  values?: FormValues<NestedFormValue>
}

const UserFragment = ({ fragment, index, context, display, values }: UserFragmentProps) => {
  const fields = React.useMemo(() => fragment.children.map((field, index) =>
    <UserField {...{ field, context, valueDisplay: display, values }} key={index} />
  ), [])
  return <div className='flex flex-col w-full'>
    <h2 style={{ letterSpacing: 0.6 }} className=' flex text-xl mb-0 items-start'>
      <pre className='text-blue-500  mr-2.5 font-bold'>
        {index + 1}.
      </pre>
      {fragment.title}
    </h2>
    <p className='text-slate-500 font-normal pl-8 text-base mb-6'>{fragment.subtitle}</p>
    <div className='flex justify-between items-start flex-wrap w-full'>
      {fields}
    </div>
  </div>;

}

export default UserFragment;