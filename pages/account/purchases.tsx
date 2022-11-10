import { collection, getDocs, orderBy, query } from '@firebase/firestore';
import { Delete, Download, ShoppingBag } from '@mui/icons-material';
import { Button, Skeleton } from '@mui/material';
import React from "react";
import { firestore } from '../../buildtime-deps/firebase';
import { useAuth } from "../../providers/AuthProvider";

const Purchases = () => {
  const [purchasesList, setPurchasesList] = React.useState<any[] | null>(null);
  const { user } = useAuth();

  React.useEffect(() => {
    getDocs(query(collection(firestore, `user-data/${user?.uid}/purchased-documents`), orderBy('date', 'desc'))).then(purchases => {
      const purchasesData: any[] = purchases.docs.map(purchase => ({ ...purchase.data(), id: purchase.id }));

      setPurchasesList(purchasesData);
    })
  }, [])


  return <article className="w-full h-full flex items-stretch flex-col ">

    <h1>
      <ShoppingBag color='primary' className='-translate-y-1' /> Twoje zakupy
    </h1>
    <p className='mb-8'>Tutaj możesz uzyskać dostęp do zakupionych produktów.</p>
    {purchasesList ? <>
      {purchasesList.length
        ?
        purchasesList.map((purchase, index, arr) => <><div className="bg-slate-100 rounded-lg flex-col h-36 flex justify-between p-4">
          <div className='flex items-center flex-wrap'>
            <pre className="text-lg text-black">{purchase.product_name}</pre>
            <pre className="text-sm ml-auto">{purchase.date.toDate().toLocaleDateString('pl-PL')}</pre>
          </div>
          <div className='flex items-center justify-between flex-wrap'>
            <p className='text-sm text-slate-500'>Zapłacono: <b>{purchase.product_price.toFixed(2).toString().replace('.', ',')}zł</b></p>
            <div className='inline-flex items-center gap-2 ml-auto'>
              <Button className='border-none bg-white'><Download /></Button>
              <Button className='border-none bg-white' color='error'><Delete /></Button>
            </div>
          </div>

        </div>
          {index < arr.length - 1
            ?
            <div className='w-full border-t border-slate-100 my-4' />
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