import React from 'react';
const BodyScrollLock = ({ children }: { children: React.ReactNode }): JSX.Element => {
  React.useEffect(() => {
    const body = document.getElementsByTagName('body')[0];
    const html = document.getElementsByTagName('html')[0];

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';

    return () => {
      body.style.overflow = 'auto';
      html.style.overflow = 'auto';
    }
  }, [])

  return children as JSX.Element;
}
export default BodyScrollLock;