import { collection, getDocs, orderBy, query } from '@firebase/firestore';
import { Delete, Download, ShoppingBag } from '@mui/icons-material';
import { Button, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import React from "react";
import { firestore } from '../../buildtime-deps/firebase';
import { useAuth } from "../../providers/AuthProvider";

const Purchases = () => {
  const [purchasesList, setPurchasesList] = React.useState<any[] | null>(null);

  const { userProfile } = useAuth();
  const router = useRouter();


  React.useEffect(() => {
    getDocs(query(collection(firestore, `user-data/${userProfile?.uid}/purchased-documents`), orderBy('date', 'desc'))).then(purchases => {
      const purchasesData: any[] = purchases.docs.map(purchase => ({ ...purchase.data(), id: purchase.id }));

      setPurchasesList(purchasesData);
    })
  }, [])


  return <article className="w-full pb-12 flex items-stretch flex-col ">

    <h1>
      <ShoppingBag color='primary' className='-translate-y-1' /> Twoje zakupy
    </h1>
    <p className='mb-8'>Tutaj możesz uzyskać dostęp do zakupionych produktów.</p>
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
            <p className='text-sm'><b className='font-normal text-slate-500'>Zapłacono:</b> <b className='text-inherit'>{purchase.product_price.toFixed(2).toString().replace('.', ',')}zł</b></p>
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