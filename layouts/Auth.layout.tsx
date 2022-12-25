import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) =>
{
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

export default AuthLayout