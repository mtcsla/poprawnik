import { collection, doc, getDoc } from '@firebase/firestore';
import { ArrowBack, ArrowForward, CompareArrows } from '@mui/icons-material';
import { Alert, Avatar, Button, Checkbox, Skeleton, Snackbar } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { firestore } from '../../../buildtime-deps/firebase';
import { useAuth } from '../../../providers/AuthProvider';
import BodyScrollLock from '../../../providers/BodyScrollLock';
import { FormValues, RootFormValue } from './form';

import { LoadingButton } from '@mui/lab';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import publicKeys from "../../../public_keys.json";
const stripePromise = loadStripe(publicKeys.stripe);

const FormFinalize = () => {
  const [data, setData] = React.useState<FormValues<RootFormValue> | null>(null);
  const [formDoc, setFormDoc] = React.useState<any | null>(null);

  const [loading, setLoading] = React.useState<boolean>(true);

  const router = useRouter();


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


  return <BodyScrollLock>
    <div className="top-0 sm:px-8 overflow-y-auto bottom-0 flex flex-col left-0 right-0 fixed bg-white" style={{ /*backgroundImage: 'url(/bg-new-light.svg)',*/ backgroundSize: 'cover', zIndex: 201 }}>
      <div className='w-full h-full flex'>
        <div className='mx-auto p-8 flex my-auto flex-col h-fit w-full bg-white' style={{ maxWidth: 900 }}>
          <div className='flex-col flex'>
            <Link href={`/forms/${router.query.id}/form`}>
              <Button color='error' className='w-full bg-red-200 text-red-500 self-start border-none'><ArrowBack className='mr-2' /> Wróć do formularza</Button>
            </Link>
            <p className='text-sm text-slate-500 mt-2'>
              Po zamówieniu pisma nie będzie możliwości zmiany jego treści, więc jeśli chcesz coś zmienić lub sprawdzić poprawność danych, wróć do formularza.
            </p>
          </div>

          <div className='flex flex-col'>
            <p className='text-sm text-slate-500 mt-6'>Zamawiasz pismo:</p>
            <h2 className='font-bold text-black mb-0'>{formDoc?.title}</h2>
            <pre className='text-xs mb-4 '>{formDoc?.category}</pre>

            <pre className='text-sm self-end'>Jesteś zalogowany jako</pre>
            <span className='inline-flex gap-4 self-end my-2 items-center'>
              <Avatar src={userProfile?.photoURL} />

              <span className='flex flex-col'>
                <p>{userProfile?.displayName}</p>
                <pre className='text-sm'>Użytkownik</pre>
              </span>
            </span>


            <h2>
              <CompareArrows color='primary' className='mr-2 -translate-y-0.5' />
              Zamów pismo
            </h2>
            <p>Zamów pismo, a my wygenerujemy je i dodamy do Twojego konta.</p>
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
                <Skeleton variant='rectangular' className='mt-6 rounded' height={110} />
                <span className='flex items-center w-full mt-1'>
                  <Skeleton className='mb-4 flex-1 mr-4' /> <Skeleton className='mb-4' style={{ flex: 0.2 }} />
                </span>
                <Skeleton variant='rectangular' className='rounded' height={110} />
                <span className='flex items-center w-full mt-1'>
                  <Skeleton className='mb-4 flex-1 mr-4' /> <Skeleton className='mb-4' style={{ flex: 0.2 }} />
                </span>
                <Skeleton variant='rectangular' className='rounded' height={110} />
                <span className='flex items-center w-full mt-1'>
                  <Skeleton className='mb-4 flex-1 mr-4' /> <Skeleton className='mb-4' style={{ flex: 0.2 }} />
                </span>
              </>
            }
          </div>



        </div>
      </div>
    </div>
  </BodyScrollLock>
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
      <Alert severity='error' className='bg-red-100 text-red-500'>Wprowadź dane płatności.</Alert>
    </Snackbar>

    <div className='flex flex-col'>
      <pre className='text-xs mt-8 mb-2'>Wybierz formę płatności </pre>
      <PaymentElement onChange={({ complete }) => setFormFilledOut(complete)} />
    </div>
    <LoadingButton loading={submitting} color='primary' onClick={onSubmit} className={`w-full mt-8 ${submitting ? 'bg-gray-100 text-transparent' : 'bg-blue-400 text-white'} sm:p-4 p-2  self-start border-none`}>
      Zapłać {(formDoc?.price / 100)?.toFixed(2)?.toString()?.replace(',', '.')}zł<ArrowForward className='ml-2' />
    </LoadingButton>
    <div className='inline-flex w-full gap-1 mt-4 items-center'>
      <Checkbox className='pl-0 py-0' />
      <label className='text-sm text-slate-500'><b className='text-red-400'>*</b>Oświadczam, że zapoznałem/am się z polityką prywatności.</label>
    </div>
    <div className='inline-flex w-full gap-1  items-center mb-4'>
      <Checkbox className='pl-0 py-0' />
      <p className='text-sm text-slate-500'><b className='text-red-400'>*</b>Oświadczam, że zapoznałem/am się z warunkami świadczenia usług.</p>
    </div>
  </>
}


export default FormFinalize;