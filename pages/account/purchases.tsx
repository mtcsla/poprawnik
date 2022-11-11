import { collection, doc, getDocs, orderBy, query, updateDoc } from '@firebase/firestore';
import { Delete, Download, Refresh, ShoppingBag } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import React from "react";
import { firestore } from '../../buildtime-deps/firebase';
import { useAuth } from "../../providers/AuthProvider";

const Purchases = () => {
  const [purchasesList, setPurchasesList] = React.useState<any[] | null>(null);

  const { userProfile } = useAuth();
  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<string>('');


  const getPurchases = () => {
    setPurchasesList(null);
    getDocs(query(collection(firestore, `user-data/${userProfile?.uid}/purchased-documents`), orderBy('date', 'desc'))).then(purchases => {
      const purchasesData: any[] = purchases.docs.map(purchase => ({ ...purchase.data(), id: purchase.id }));

      setPurchasesList(purchasesData);
    });
  }

  const paymentIntentId: string = React.useMemo(() => {
    if (router.isReady)
      return router.query.payment_intent as string;
    else
      return '';
  }, [router.isReady, router.query])



  const [deleting, setDeleting] = React.useState<boolean>(false);
  const [deleteError, setDeleteError] = React.useState<string>('');

  const deletePurchase = (id: string) => {
    setDeleting(true);
    updateDoc(doc(firestore, `user-data/${userProfile?.uid}/purchased-documents/${id}`), { contents: '' }).then(() => {
      purchasesList![purchasesList!.findIndex(purchase => purchase.id === id)].contents = '';
      setDeleting(false);
      setDeleteDialogOpen('');
      setDeleteError('');
    }).catch(
      err => {
        console.log(err);
        setDeleteError('Wystąpił błąd podczas usuwania dokumentu. Spróbuj ponownie później.');
        setDeleting(false);
      }
    )
  }

  React.useEffect(() => {
    if (userProfile?.uid) getPurchases();
  }, [])


  return <article className="w-full pb-12 flex items-stretch flex-col ">
    <Dialog open={!!deleteDialogOpen}>
      <DialogTitle>
        <pre className='text-sm'>
          Czy na pewno chcesz usunąć ten zakup?
        </pre>
      </DialogTitle>
      <DialogContent style={{ maxWidth: 700 }}>
        <p>Usuniemy treść Twojego pisma z naszego systemu, ale zachowamy zapis transakcji. Ta akcja jest nieodwracalna, jeśli usuniesz pismo, nie będzie można go już więcej pobrać.</p>
        <p className='text-xs text-right mt-4 text-red-500'>{deleteError}</p>
      </DialogContent>
      <DialogActions>
        <LoadingButton loading={deleting} className='border-none' onClick={() => deletePurchase(deleteDialogOpen)} size='small'>Usuń</LoadingButton>
        <Button className='border-none' onClick={() => setDeleteDialogOpen('')} size='small' color='error'>Anuluj</Button>
      </DialogActions>
    </Dialog>
    <h1>
      <ShoppingBag color='primary' className='-translate-y-1' /> Twoje zakupy
    </h1>
    <p className='mb-8'>Tutaj możesz uzyskać dostęp do zakupionych pism.</p>
    <div className='inline-flex mb-12 w-full gap-3 flex-wrap-reverse justify-between items-center '>
      <p>
        Jeśli pismo, które zakupiłeś/aś nie pojawi się na liście w przeciągu 10 minut pomimo odświeżenia strony
        powiadom nas o tym wysyłając wiadomość na adres e-mail <a href="mailto:pomoc@poprawnik.pl" className='font-bold text-blue-500'>pomoc@poprawnik.pl</a>.
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
        purchasesList.map((purchase, index, arr) => <><div className={`${paymentIntentId === purchase.paymentIntentId ? 'bg-blue-100 text-blue-500' : purchase.contents ? 'bg-slate-100 text-black' : 'bg-slate-200 text-slate-400'} relative rounded-lg flex-col h-36 flex justify-between p-4`}>
          {paymentIntentId === purchase.paymentIntentId
            ? <pre style={{ fontSize: '0.8rem', top: '-1.3rem' }} className=' inline-flex gap-2 items-center font-bold right-0 absolute text-blue-500'>
              Nowy
            </pre>
            : null
          }

          <div className='flex items-center flex-wrap'>
            <div className='flex flex-col'>
              <h3 className="text-xl text-inherit whitespace-normal">{purchase.product_name}</h3>
              <pre className='text-xs'>{purchase.product_category}</pre>
            </div>
            <div className='ml-auto flex items-end flex-col'>
              <pre className="text-sm">{purchase.date.toDate().toLocaleDateString('pl-PL')}</pre>
              {!purchase.contents
                ? <p className='text-xs'>Usunięto</p>
                : null
              }
            </div>
          </div>
          <div className='flex items-center justify-between flex-wrap'>
            <p className='text-sm'><b className='font-normal text-slate-500'>Zapłacono:</b> <b className='text-inherit'>{(purchase.product_price / 100).toFixed(2).toString().replace('.', ',')}zł</b></p>
            <div className='inline-flex bg-white rounded items-center gap-2 ml-auto'>
              <LoadingButton className='border-none bg-white' disabled={!purchase.contents} ><Download /></LoadingButton>
              <Button className='border-none bg-white' disabled={!purchase.contents} color='error' onClick={() => setDeleteDialogOpen(purchase.id)}><Delete /></Button>
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