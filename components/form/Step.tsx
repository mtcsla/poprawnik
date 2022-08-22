import React from 'react';
import { StepDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import UserFragment from './Fragment';

export type UserStepProps = {
  step: StepDescription,
}

const UserStep = ({ step }: UserStepProps) => {
  const fragments = React.useMemo(() => step.children.map(fragment => <UserFragment {...{ fragment }} />), []);
  return step.type === 'step'
    ? <div className='inline-flex w-full gap-4 flex-col'>
      {fragments}
    </div>
    : null
}

export default UserStep;