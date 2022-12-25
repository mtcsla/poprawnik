import Router, { useRouter } from "next/router";
import { ReactNode } from "react";

import AccountLayout from "../layouts/Account.layout";
import AppLayout from "../layouts/App.layout";
import AuthLayout from "../layouts/Auth.layout";
import GlobalContextsProvider from "../providers/GlobalContexts.provider";

import Head from "next/head";
import "../styles/globals.css";

import nprogress from "nprogress";
nprogress.configure({ showSpinner: false });

Router.events.on('routeChangeStart', () =>
{
	nprogress.start();

})
Router.events.on('routeChangeComplete', () =>
{
	nprogress.done();
})
Router.events.on('routeChangeError', () =>
{
	nprogress.done();
})

function MyApp({ Component, pageProps }: any)
{
	const router = useRouter();

	return (
		<>
			<Head>
				<title>POPRAWNIK • Serwis z pismami sądowymi</title>
				<meta name="theme-color" content="#fff" />
				<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css' />
			</Head>
			<GlobalContextsProvider>
				{pageWithAppropriateWrapper(
					router.pathname,
					<Component {...pageProps} />
				)}
			</GlobalContextsProvider>
		</>
	);
}

const pageWithAppropriateWrapper = (location: string, component: ReactNode) =>
{
	if (location === '/' || (location.includes('forms') && !location.includes('list')))
		return component;

	if (location.includes("/login") || location.includes("/signup"))
		return <AuthLayout>{component}</AuthLayout>;
	if (location.includes("/account"))
		return <AccountLayout>{component}</AccountLayout>

	return <div className="flex flex-col"><AppLayout>{component}</AppLayout></div>;
};

export default MyApp;