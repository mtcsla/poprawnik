import { collection, getDocs, orderBy, query } from '@firebase/firestore';
import { Delete, Download, Refresh, ShoppingBag } from '@mui/icons-material';
import { Button, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import React from "react";
import { firestore } from '../../buildtime-deps/firebase';
import { useAuth } from "../../providers/AuthProvider";

const Purchases = () => {
  const [purchasesList, setPurchasesList] = React.useState<any[] | null>(null);

  const { userProfile } = useAuth();
  const router = useRouter();

  const getPurchases = () => {
    setPurchasesList(null);
    getDocs(query(collection(firestore, `user-data/${userProfile?.uid}/purchased-documents`), orderBy('date', 'desc'))).then(purchases => {
      const purchasesData: any[] = purchases.docs.map(purchase => ({ ...purchase.data(), id: purchase.id }));

      setPurchasesList(purchasesData);
    });
  }

  React.useEffect(() => {
    if (userProfile?.uid) getPurchases();
  }, [])


  return <article className="w-full pb-12 flex items-stretch flex-col ">
    <h1>
      <ShoppingBag color='primary' className='-translate-y-1' /> Twoje zakupy
    </h1>
    <p className='mb-8'>Tutaj możesz uzyskać dostęp do zakupionych pism.</p>
    <div className='inline-flex mb-12 w-full gap-3 flex-wrap-reverse justify-between items-center '>
      <p>
        Jeśli pismo, które zakupiłeś nie pojawi się na liście w przeciągu 10 minut pomimo odświeżenia strony
        powiadom nas o tym wysyłając wiadomość na adres <a href="mailto:pomoc@poprawnik.pl" className='font-bold text-blue-500'>pomoc@poprawnik.pl</a>.
      </p>
      <div className='flex flex-col ml-auto items-end'>
        <p className='text-sm text-slate-500'>
          Nie widzisz swojego pisma?
        </p>
        <Button onClick={getPurchases} disabled={!purchasesList} className={`border-none  text-white ${!purchasesList ? 'bg-gray-300' : 'bg-blue-400 hover:bg-blue-500'}`}>
          Odśwież <Refresh className='ml-2' />
        </Button>
      </div>
    </div>
    {purchasesList ? <>
      {purchasesList.length
        ?
        purchasesList.map((purchase, index, arr) => <><div className={`${router.query.redirected === 'true' && index == 0 ? 'bg-blue-100 text-blue-500' : 'bg-slate-100 text-black'} relative rounded-lg flex-col h-36 flex justify-between p-4`}>
          {router.query.redirected == 'true' && index == 0
            ?
            <pre style={{ fontSize: '0.8rem', top: '-1.3rem' }} className=' inline-flex gap-2 items-center font-bold right-0 absolute text-blue-500'>
              Nowy
            </pre>
            : null
          }

          <div className='flex items-center flex-wrap'>
            <pre className="text-lg text-inherit">{purchase.product_name}</pre>
            <pre className="text-sm ml-auto">{purchase.date.toDate().toLocaleDateString('pl-PL')}</pre>
          </div>
          <div className='flex items-center justify-between flex-wrap'>
            <p className='text-sm'><b className='font-normal text-slate-500'>Zapłacono:</b> <b className='text-inherit'>{(purchase.product_price / 100).toFixed(2).toString().replace('.', ',')}zł</b></p>
            <div className='inline-flex bg-white rounded items-center gap-2 ml-auto'>
              <Button className='border-none bg-white'><Download /></Button>
              <Button className='border-none bg-white' color='error'><Delete /></Button>
            </div>
          </div>

        </div>
          {index < arr.length - 1
            ?
            <div className='w-full border-slate-100 my-4' />
            : null
          }
        </>)
        :
        <div
          className={
            "p-4 flex items-center justify-center rounded-lg border h-32 mt-4"
          }
        >
          <div className={"flex flex-col"}>
            <pre>brak zakupów</pre>
            <p className={"mt-1"}>Nie dokonałeś/aś jeszcze żadnych zakupów w naszym serwisie.</p>
          </div>
        </div>
      }
    </> : <>
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
    </>}
  </article>
}

export default Purchases;