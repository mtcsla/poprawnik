import { GetStaticPropsContext } from 'next';
import { useRouter } from 'next/router';
import React from 'react';

export const getStaticProps = (ctx: GetStaticPropsContext) => {
  return {
    props: {},
  }
}

const MainPage = () => {
  const router = useRouter()
  React.useEffect(() => {
    router.push('/dashboard')
  }, [])

  return <></>
}

export default MainPage;
