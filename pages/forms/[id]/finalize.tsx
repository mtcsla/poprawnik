import { collection, doc, getDoc } from '@firebase/firestore';
import { ArrowBack, ArrowForward, Info, MonetizationOn } from '@mui/icons-material';
import { Avatar, Button, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { firestore } from '../../../buildtime-deps/firebase';
import { useAuth } from '../../../providers/AuthProvider';
import BodyScrollLock from '../../../providers/BodyScrollLock';
import { FormValues, RootFormValue } from './form';

import {
  Elements,
  PaymentElement
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import publicKeys from "../../../public_keys.json";
const stripePromise = loadStripe(publicKeys.stripe);

const FormFinalize = () => {
  const [data, setData] = React.useState<FormValues<RootFormValue> | null>(null);
  const [formDoc, setFormDoc] = React.useState<any | null>(null);

  const [loading, setLoading] = React.useState<boolean>(true);

  const router = useRouter();


  //  const stripe = useStripe();
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
          setFormDoc(docSnapshot.data() as any);
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


  const [paymentMethod, setPaymentMethod] = React.useState<'blik' | 'p24'>('p24')
  const [formFilledOut, setFormFilledOut] = React.useState<boolean>(false);

  const [error, setError] = React.useState<string>('');
  const [clientSecret, setClientSecret] = React.useState<string>('')
  const { userProfile } = useAuth();

  React.useEffect(
    () => {
      if (!userProfile)
        router.replace(`/login?redirect=${`/forms/${router.query.id}/finalize`}`)
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
  )

  return <BodyScrollLock>
    <div className="top-0 sm:px-8 overflow-y-auto bottom-0 flex flex-col left-0 right-0 fixed bg-white" style={{ /*backgroundImage: 'url(/bg-new-light.svg)',*/ backgroundSize: 'cover', zIndex: 201 }}>
      <div className='w-full h-full justify-center'>
        <div className='mx-auto p-8 min-h-full flex flex-col h-fit w-full bg-white justify-between ' style={{ maxWidth: 800 }}>
          <div className='flex-col flex'>
            <Link href={`/forms/${router.query.id}/form`}>
              <Button color='error' className='w-full bg-red-400 text-white self-start border-none'><ArrowBack className='mr-2' /> Wróć do formularza</Button>
            </Link>
            <p className='text-sm text-slate-500 mt-2'>
              Po opłaceniu pisma nie będzie możliwości zmiany jego treści, więc jeśli chcesz coś zmienić lub sprawdzić poprawność danych, wróć do formularza.
            </p>
          </div>

          <div className='flex flex-col'>
            <pre className='text-xs'>Kupujesz pismo</pre>
            <pre className='font-bold mb-4 text-black'>{formDoc?.title}</pre>

            <pre className='text-sm self-end'>Jesteś zalogowany jako</pre>
            <span className='inline-flex gap-4 self-end my-2 items-center'>
              <Avatar src={userProfile?.photoURL} />

              <span className='flex flex-col'>
                <p>{userProfile?.displayName}</p>
                <pre className='text-sm'>Użytkownik</pre>
              </span>
            </span>


            <h2>
              <MonetizationOn color='primary' className='mr-2 -translate-y-0.5' />
              Opłać pismo
            </h2>
            <p>Zapłać za pismo, a my wygenerujemy je i dodamy do Twojego konta.</p>
          </div>

          <div className='flex flex-col'>
            {userProfile && clientSecret && formDoc ?
              <>
                <pre className='text-xs mt-8 mb-2'>Wybierz formę płatności </pre>



                <Elements stripe={stripePromise} options={{ clientSecret, locale: 'pl' }}>
                  <PaymentElement onChange={({ complete }) => setFormFilledOut(complete)} options={{
                  }} />
                </Elements>
              </>
              : error
                ? <p className='p-2 mt-8 sm:p-4 border-red-500 rounded-lg bg-red-50 text-red-500 border'>{error}</p>
                : null
            }
          </div>
          {userProfile && clientSecret && formDoc
            ? null
            : <CircularProgress className='text-xl h-full self-center m-12' />
          }
          <Button disabled={!formFilledOut} color='primary' className={`w-full ${formFilledOut ? 'bg-blue-400 text-white' : 'bg-gray-500 cursor-not-allowed text-white'} sm:p-4 p-2 self-start border-none mt-4`}>
            Zapłać {(formDoc?.price / 100)?.toFixed(2)?.toString()?.replace(',', '.')}zł<ArrowForward className='ml-2' />
          </Button>
          {false ?
            <p className='bg-amber-50 text-amber-500 border-amber-500 p-2 rounded-lg mt-2 sm:mt-4 sm:p-4'>
              <Info className='mr-2 -translate-y-0.5' />
              Strona zbudowana w trybie testowym - płatności wyłączone.
            </p>
            : null
          }

        </div>
      </div>
    </div>
  </BodyScrollLock>
}

export default FormFinalize;