import { DoneAllTwoTone } from '@mui/icons-material';
import React from 'react';
import { FragmentDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import UserField from './Field';

export type UserFragmentProps = {
  fragment: FragmentDescription,
}

const UserFragment = ({ fragment }: UserFragmentProps) => {
  const fields = React.useMemo(() => fragment.children.map(field =>
    <UserField {...{ field }} />
  ), [])
  return <div className='flex flex-col w-full'>
    <h2 className='flex tracking-wide text-xl mb-0 items-start'><DoneAllTwoTone color='primary' className='mr-4 translate-y-0.5' /> {fragment.title}</h2>
    <p className=' font-normal text-base mb-4'>{fragment.subtitle}</p>
    <div className='flex justify-between items-start flex-wrap w-full'>
      {fields}
    </div>
  </div>;

}

export default UserFragment;