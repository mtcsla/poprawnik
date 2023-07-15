import { collection, doc, getDoc } from '@firebase/firestore';
import { ArrowForward } from '@mui/icons-material';
import { Alert, Skeleton, Snackbar } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';
import { firestore } from '../../../buildtime-deps/firebase';
import { useAuth } from '../../../providers/AuthProvider';
import { FormValues, RootFormValue } from './form';

import { LoadingButton } from '@mui/lab';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import useWindowSize from '../../../hooks/WindowSize';
import publicKeys from "../../../public_keys.json";

import Head from 'next/head';
import { DisplayHeader } from '.';
import { Explanation, Footer } from '../..';
import { useSearch } from '../../../providers/SearchProvider';
import axios from 'axios';

const stripePromise = loadStripe(publicKeys.stripe);

const FormFinalize = () => {
  const [data, setData] = React.useState<FormValues<RootFormValue> | null>(null);
  const [formDoc, setFormDoc] = React.useState<any | null>(null);

  const [loading, setLoading] = React.useState<boolean>(true);

  const router = useRouter();
  const { setSearchOpen } = useSearch();
  const onSearch = () => setSearchOpen(true);


  // const stripe = useStripe();
  // const elements = useElements();


  React.useEffect(() => {
    if (router.isReady)
      getDoc(
        doc(
          collection(firestore, 'products'),
          router.query.id as string
        )
      ).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          setFormDoc({ ...docSnapshot.data() as any, id: docSnapshot.id });
          setData(
            JSON.parse(
              localStorage.getItem(
                `--${docSnapshot.id}-data`
              ) ?? '{}'
            )
          );

          setLoading(false);
        }
        else {
          router.replace(`/forms/${docSnapshot.id}`)
        }
      })
  }, [router.isReady])


  const [clientSecret, setClientSecret] = React.useState<string>('')


  const [error, setError] = React.useState<string>('');
  const { userProfile } = useAuth();

  const { width } = useWindowSize();

  React.useEffect(
    () => {
      if (!userProfile)
        router.replace(`/login?redirect=${`/forms/${router.query.id}/checkout`}`)
      if (data?.['§valuesValid'] && userProfile && router.isReady) {
        axios.post('/api/payments/create-payment-intent', 
          JSON.stringify({
            data: data,
            id: router.query.id as string,
          }),
          {
            headers: {
              'Content-Type': 'application/json'
            },
          }
        ).then((data: any) => {
          setClientSecret(data.clientSecret)
        }).catch(
          err => { setError('Wystąpił błąd podczas tworzenia obiektu płatności. Odśwież stronę i spróbuj ponownie.'); }
        )
      }
    },
    [userProfile, router.isReady, data]
  );


  const [paymentMethod, setPaymentMethod] = React.useState<'blik' | 'p24'>('p24')


  return <div className=''>
    <Head>
      <title>
        Kup {(formDoc?.title as string | undefined)?.toLowerCase()} • POPRAWNIK
      </title>
    </Head>
    <DisplayHeader />
    <div className="min-h-72 h-fit pt-16 px-8 sm:px-12" style={{
      backgroundImage: `url(/bg-light-blue.svg)`,
      backgroundSize: 'cover'
    }} >

      <div className='flex flex-col mx-auto py-8 text-white max-w-[60rem]'>
        <h1 className='sm:text-5xl'>
          {formDoc?.title}
        </h1>
        <pre className='whitespace-normal text-white opacity-70'>
          {formDoc?.category}
        </pre>
        <p className='self-end text-lg mt-8 text-white'>
          tylko
          {" "}
          <strong className='text-blue-200'>{(formDoc?.price / 100)?.toFixed(2).toString().replace(/\./g, ',')}zł</strong><sup>*</sup>
        </p>
      </div>
    </div>

    <div className='flex flex-col py-20 px-8 sm:px-12'>
      <div className='inline-flex flex-col sm:flex-row gap-8 max-w-[60rem] my-8 w-full mx-auto'>
        <div className='flex flex-col'>
          <pre>Opis pisma</pre>
          <p className='my-3'>
            {formDoc?.description}
          </p>

          <p className='text-xs mt-8 text-slate-500 hidden sm:block'>
            * Cena zawiera podatek VAT
            <br />
            † Po dokonaniu zakupu pisma nie będzie można już zmienić danych w formularzu
          </p>
        </div>
        <div className='flex flex-col w-full sm:max-w-[30rem] ml-auto'>

          {userProfile && clientSecret && formDoc ?
            <>
              <Elements stripe={stripePromise} options={{ clientSecret, locale: 'pl' }}>
                <PaymentForm formDoc={formDoc} setError={setError} />
              </Elements>
            </>
            : error
              ? <p className='p-2 mt-8 sm:p-4 border-red-500 rounded-lg bg-red-50 text-red-500 border'>{error}</p>
              : null
          }
          {userProfile && clientSecret && formDoc
            ? null
            : <>
              <span className='inline-flex items-center w-full mt-4 gap-4'>
                <Skeleton height={100} style={{ flex: 1 / 3 }} /> <Skeleton height={100} style={{ flex: 1 / 3 }} /> <Skeleton height={100} style={{ flex: 1 / 3 }} />

              </span>
              <Skeleton variant='rectangular' className='mb-6 rounded' height={50} />
              <Skeleton variant='rectangular' className='mb-6 rounded' height={50} />
              <LoadingButton disabled color='primary' className={`bg-gray-100 w-full normal-case p-2 mt-4  self-start border-none`}>
                ZAPŁAĆ {formDoc ? `${(formDoc?.price / 100)?.toFixed(2)?.toString()?.replace(',', '.')}zł` : <Skeleton className='ml-2' height={'2rem'} width={"4rem"} />}<ArrowForward className='ml-2' />

              </LoadingButton>
            </>
          }
          <p className='text-xs mt-8 text-slate-500 block sm:hidden'>
            * Cena zawiera podatek VAT
            <br />
            † Po dokonaniu zakupu pisma nie będzie można już zmienić danych w formularzu
          </p>

        </div>
      </div>

      <div className='mx-auto my-8 self-end  w-full max-w-[60rem] flex flex-col'>
        <h1 className='text-right font-bold self-end'>Jak to działa?</h1>
        <pre className='text-right self-end'>Wątpliwości? Spieszymy z pomocą!</pre>
      </div>
      <Explanation reverse />
    </div>


    <Footer />
  </div >
}

const PaymentForm = ({ formDoc, setError }: {
  formDoc: any, setError: React.Dispatch<string>
}) => {
  const [formFilledOut, setFormFilledOut] = React.useState<boolean>(false);
  const [notFilledOutError, setNotFilledOutError] = React.useState<boolean>(false);
  const notFilledOutErrorRef = React.useRef<NodeJS.Timeout | null>(null);

  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = React.useState<boolean>(false);


  const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!formFilledOut) {
      setNotFilledOutError(true);
      if (notFilledOutErrorRef.current)
        clearTimeout(notFilledOutErrorRef.current);
      notFilledOutErrorRef.current = setTimeout(() => {
        setNotFilledOutError(false);
      }, 5000)
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    const { error } = await stripe?.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/account/purchases?redirected=true`,
      }
    })
    if (error.type === "card_error" || error.type === "validation_error") {
      setError(error.message ?? '');
    } else {
      setError("Wystąpił nieznany błąd. Odśwież stronę i spróbuj ponownie.");
    }
    setSubmitting(false);

  }
  return <>
    <Snackbar open={notFilledOutError}>
      <Alert severity='error' variant='filled'>Wprowadź dane płatności.</Alert>
    </Snackbar>

    <div className='flex flex-col'>
      <pre className='text-xs mb-2'>Wybierz formę płatności </pre>
      <PaymentElement onChange={({ complete }) => setFormFilledOut(complete)} />
    </div>
    <LoadingButton loading={submitting} color='primary' onClick={onSubmit} className={`w-full mt-8 ${submitting ? 'bg-gray-100 text-transparent' : 'bg-blue-500 text-white'} p-2 self-start normal-case border-none`}>
      ZAPŁAĆ {(formDoc?.price / 100)?.toFixed(2)?.toString()?.replace(',', '.')}zł<sup>†</sup>*<sup></sup><ArrowForward className='ml-2' />
    </LoadingButton>
    {/*<>
            <div className='inline-flex w-full gap-1 mt-4 items-center'>
                <Checkbox className='pl-0 py-0' />
                <label className='text-sm text-slate-500'><b className='text-red-400'>*</b>Oświadczam, że zapoznałem/am się z polityką prywatności.</label>
            </div>
            <div className='inline-flex w-full gap-1  items-center mb-4'>
                <Checkbox className='pl-0 py-0' />
                <p className='text-sm text-slate-500'><b className='text-red-400'>*</b>Oświadczam, że zapoznałem/am się z warunkami świadczenia usług.</p>
            </div>
</>*/}
  </>

}


export default FormFinalize;
