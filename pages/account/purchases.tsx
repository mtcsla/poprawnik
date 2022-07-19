import { collection, getDocs, orderBy, query } from '@firebase/firestore';
import { ShoppingBag } from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import React from "react";
import { firestore } from '../../buildtime-deps/firebase';
import { useAuth } from "../../providers/AuthProvider";

export interface IPurchase {
  id: string;
  productName: string;
  status: 'unpaid' | 'pending' | 'paid' | 'cancelled';
  price: number;
  date: Date,

  get: () => string
}

const Purchases = () => {
  const [purchasesList, setPurchasesList] = React.useState<IPurchase[] | null>(null);
  const { user } = useAuth();

  React.useEffect(() => {
    getDocs(query(collection(firestore, `users/${user?.uid}/purchases`), orderBy('date', 'desc'))).then(purchases => {
      const purchasesData: IPurchase[] = [];
      purchases.forEach(purchase => purchasesData.push(purchase.data() as IPurchase));

      setPurchasesList(purchasesData);
    })
  }, [])


  return <article className="w-full h-full flex items-stretch flex-col ">

    <h1>
      <ShoppingBag color='primary' className='-translate-y-1' /> Twoje zakupy
    </h1>
    <p>Tutaj możesz uzyskać dostęp do zakupionych produktów.</p>
    {purchasesList ? <>
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