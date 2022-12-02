import { collection, doc, getDoc } from '@firebase/firestore';
import { ArrowBack, ArrowForward, Search } from '@mui/icons-material';
import { Alert, Avatar, Button, Skeleton, Snackbar } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';
import { firestore } from '../../../buildtime-deps/firebase';
import { useAuth } from '../../../providers/AuthProvider';
import { PhasedExplanationAnimation } from "../../index";
import { FormValues, RootFormValue } from './form';

import { LoadingButton } from '@mui/lab';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import LogoHeader from '../../../components/LogoHeader';
import useWindowSize from '../../../hooks/WindowSize';
import publicKeys from "../../../public_keys.json";

import Head from 'next/head';
import Link from 'next/link';
import { useSearch } from '../../../providers/SearchProvider';

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
        fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: data,
            id: router.query.id as string,
          })
        }).then(res => res.json()).then(data => {
          setClientSecret(data.clientSecret)
        }).catch(
          err => { setError('Wystąpił błąd podczas tworzenia obiektu płatności. Odśwież stronę i spróbuj ponownie.'); }
        )
      }
    },
    [userProfile, router.isReady, data]
  );


  const [paymentMethod, setPaymentMethod] = React.useState<'blik' | 'p24'>('p24')


  return <>
    <Head>
      <title>
        Kup {(formDoc?.title as string | undefined)?.toLowerCase()} • POPRAWNIK
      </title>
    </Head>
    <header className='fixed bg-white px-8 sm:px-12 md:px-16 sm:bg-opacity-50 backdrop-blur top-0 flex left-0 h-16 w-full' style={{ zIndex: 2000 }}>
      <div className='h-full w-full flex items-center justify-between m-auto'>
        <div className='inline-flex items-center'>
          <LogoHeader noBackground noPadding noWidth png />
        </div>

        <span className='flex h-full items-center'>
          {
            width && width > 720
              ? <div
                className={
                  "mr-3  bg-slate-50 hover:bg-blue-100 rounded cursor-text transition-colors flex items-center p-2"
                }
                onClick={onSearch}
                style={{ height: '2rem', width: 200 }}
              >
                <Search
                  color={"primary"}
                  sx={{ fontSize: "1.2rem !important" }}
                />
                <p className={"ml-2 text-sm text-slate-500"}>Szukaj...</p>
              </div>
              : <Button className="mr-3 bg-slate-50 " sx={{ padding: "0.4rem", height: '2rem' }}>
                <Search
                  onClick={onSearch}
                  sx={{ fontSize: "20px !important" }}
                />
              </Button>

          }
          <Avatar role="button" variant='rounded' src={userProfile?.photoURL} className='w-8 h-8 hover:bg-blue-100 cursor-pointer text-blue-400 bg-slate-50' />
        </span>
      </div>
    </header>
    <div className='w-full min-h-screen flex pt-16'>
      <div className='p-8 flex my-auto px-8 sm:px-12 md:px-16 flex-1 flex-col h-fit w-full bg-white'>
        <div className='flex flex-col'>
          <div className='flex mb-4 flex-col self-start'>
            <h1 className='mt-4 text-2xl font-bold sm:text-4xl whitespace-normal  text-black mb-2 flex'>{formDoc?.title}</h1>
            <div className='inline-flex gap-3 flex-wrap w-full justify-between'>
              <pre className='whitespace-normal'>{formDoc?.category}</pre>
              <p className='text-lg ml-auto sm:text-xl mt-2'>
                {(formDoc?.price / 100).toFixed(2).toString().replace('.', ',')}zł
              </p>
            </div>
          </div>
          <p className='sm:text-lg'>{formDoc?.description}</p>

          <pre className='text-sm self-end mt-8'>Jesteś zalogowany jako</pre>
          <span className='inline-flex gap-4 self-end my-2 items-center'>
            <Avatar src={userProfile?.photoURL} />

            <span className='flex flex-col'>
              <p>{userProfile?.displayName}</p>
              <pre className='text-sm'>Użytkownik</pre>
            </span>
          </span>

          <div className='flex-col flex my-8'>
            <Link href={`/forms/${router.query.id}/form`}>
              <Button color='error' className='w-full bg-red-50 text-red-500 self-start border-none'><ArrowBack className='mr-2' /> Wróć do formularza</Button>
            </Link>
            <p className='text-sm text-slate-500 mt-2'>
              Po zamówieniu pisma nie będzie możliwości zmiany jego treści, więc jeśli chcesz coś zmienić lub sprawdzić poprawność danych, wróć do formularza.
            </p>
          </div>


        </div>

        <div className='w-full flex flex-col'>
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
              <span className='inline-flex items-center w-full mt-1 mt-4 gap-4'>
                <Skeleton height={100} style={{ flex: 1 / 3 }} /> <Skeleton height={100} style={{ flex: 1 / 3 }} /> <Skeleton height={100} style={{ flex: 1 / 3 }} />

              </span>
              <Skeleton variant='rectangular' className='mb-6 rounded' height={50} />
              <Skeleton variant='rectangular' className='mb-6 rounded' height={50} />
              <LoadingButton disabled color='primary' className={`bg-gray-100 w-full sm:p-4 p-2 mt-4  self-start border-none`}>
                Zapłać {formDoc ? `${(formDoc?.price / 100)?.toFixed(2)?.toString()?.replace(',', '.')}zł` : <Skeleton className='ml-2' height={'2rem'} width={"4rem"} />}<ArrowForward className='ml-2' />

              </LoadingButton>
            </>
          }
        </div>

        <p className='mt-8'>Po sfinalizowaniu płatności dodamy pismo do Twojego konta i przekierujemy cię do podstrony, na której można je pobrać.</p>



      </div>
      {width && width >= 1024
        ? <div className='self-stretch flex flex-col justify-center p-8 sm:p-12 md:p-16' style={{ flex: 1 / 2, backgroundSize: 'cover', backgroundImage: 'url(/bg-new-light-2.svg)', }}>
          <div className='bg-slate-50 rounded-lg my-auto p-6'>
            <PhasedExplanationAnimation phase={1} className='mx-auto mb-auto w-full' active />
          </div>
        </div>
        : null
      }
    </div>
  </>
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
      <pre className='text-xs mt-8 mb-2'>Wybierz formę płatności </pre>
      <PaymentElement onChange={({ complete }) => setFormFilledOut(complete)} />
    </div>
    <LoadingButton loading={submitting} color='primary' onClick={onSubmit} className={`w-full mt-8 ${submitting ? 'bg-gray-100 text-transparent' : 'bg-blue-400 text-white'} sm:p-4 p-2  self-start border-none`}>
      Zapłać {(formDoc?.price / 100)?.toFixed(2)?.toString()?.replace(',', '.')}zł<ArrowForward className='ml-2' />
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