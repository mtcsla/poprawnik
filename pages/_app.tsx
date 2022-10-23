import Router, { useRouter } from "next/router";
import { ReactNode } from "react";
import AppContextWrapper from "../components/page-wrappers/AppContextWrapper";
import AppWrapper from "../components/page-wrappers/AppWrapper";
import AuthWrapper from "../components/page-wrappers/AuthWrapper";
import "../styles/globals.css";

import nprogress from "nprogress";

Router.events.on('routeChangeStart', () => {
  nprogress.start();

})
Router.events.on('routeChangeComplete', () => {
  nprogress.done();
})
Router.events.on('routeChangeError', () => {
  nprogress.done();
})

import Head from "next/head";
import AccountPageWrapper from "../components/page-wrappers/AccountPageWrapper";

function MyApp({ Component, pageProps }: any) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>POPRAWNIK - serwis z pismami sądowymi</title>
        <meta name="theme-color" content="#fff" />
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css' />
      </Head>
      <AppContextWrapper>
        {pageWithAppropriateWrapper(
          router.pathname,
          <Component {...pageProps} />
        )}
      </AppContextWrapper>
    </>
  );
}

const pageWithAppropriateWrapper = (location: string, component: ReactNode) => {
  if (location === '/')
    return component;
  if (location.includes("/login") || location.includes("/signup"))
    return <AuthWrapper>{component}</AuthWrapper>;
  if (location.includes("/account"))
    return <AccountPageWrapper>{component}</AccountPageWrapper>

  return <div className="flex flex-col"><AppWrapper>{component}</AppWrapper></div>;
};

export default MyApp;