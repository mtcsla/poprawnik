import React from "react";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div
    style={{
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url(/bg-new.svg)',
      backgroundSize: 'cover',
    }}
    className={'flex fixed  items-center justify-center'}
  >
    {children}
  </div>
}

export default AuthWrapper