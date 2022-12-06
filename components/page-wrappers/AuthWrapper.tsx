import React from "react";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div
    style={{
      width: '100vw',
      minHeight: '100vh',
    }}
    className={'flex  items-center justify-center'}
  >
    {children}
  </div>
}

export default AuthWrapper