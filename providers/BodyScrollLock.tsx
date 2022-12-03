import React from 'react';
import { bodyScrollLockContext } from './BodyScrollLockProvider';
const BodyScrollLock = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { addConsumer, removeConsumer } = React.useContext(bodyScrollLockContext);

  React.useEffect(() => {
    addConsumer();
    return () => removeConsumer();
  }, [])

  return children as JSX.Element;
}
export default BodyScrollLock;