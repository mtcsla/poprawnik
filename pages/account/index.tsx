import { doc, getDoc, setDoc } from '@firebase/firestore';
import { AccountBox, Delete, PhotoCamera } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Alert, Avatar, Button, Skeleton, TextField, Tooltip } from '@mui/material';
import React from 'react';
import { firestore } from '../../buildtime-deps/firebase';
import SocialMedia from '../../components/pages/account/SocialMedia';
import Workplace from '../../components/pages/account/Workplace';
import { useAuth } from '../../providers/AuthProvider';

export interface IUserDoc {
  description: string;
  bankNumber: string;
  socialMedia: {
    linkedin: string;
    facebook: string;
  };
  workplace: {
    name: string;
    position: string;
  };
  invoicing: {
    name: string;
    address: string;
    taxId: string;
  }
}

const Account = () => {
  const { user, userProfile } = useAuth();

  const userDocRef = React.useMemo(() => doc(firestore, `/users/${userProfile?.uid}`), [userProfile]);
  const [userDoc, setUserDoc] = React.useState<IUserDoc | null>(null);

  //userDoc data params
  const [loading, setLoading] = React.useState<boolean>(true);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<boolean>(false);

  const [editingDesc, setEditingDesc] = React.useState<boolean>(false);
  const [desc, setDesc] = React.useState<string>(userDoc?.description || '');

  const [editingBank, setEditingBank] = React.useState<boolean>(false);
  const [bankNumber, setBankNumber] = React.useState<string>(userDoc?.bankNumber || '');

  React.useEffect(() => {
    getDoc(userDocRef).then(
      data => {
        setUserDoc(data.data() as IUserDoc);
        setLoading(false);
        setDesc(data.data()?.description || "");
        setBankNumber(data.data()?.bankNumber || "");
      }).catch(err => console.error(err));

  }, []);

  const updateUserDoc = (overwriteProperty: {
    [key: string]: any
  }, success: () => void) => {

    setSaving(true);
    if (userDoc) {
      setDoc(userDocRef, Object.assign(userDoc, overwriteProperty)).then(() => { setSaving(false); success(); }).catch((err) => {
        console.error(err);
      });
      setUserDoc(Object.assign(userDoc, overwriteProperty));
    }
  }



  return <article className="w-full flex items-stretch flex-col ">
    <h1>
      <AccountBox color='primary' className='-translate-y-1' fontSize='large' /> Twoje informacje
    </h1>
    <p className='mb-6'>Zarządzaj swoimi danymi.</p>
    {(user && userProfile) && !loading ? <>
      <div className='flex flex-col w-full items-stretch'>
        <span className='flex w-full items-center justify-between'>

          <Tooltip title="Zmień zdjęcie profilowe" placement='bottom-start'>
            <Avatar className='z-0 cursor-pointer' src={user?.photoURL ?? ''}></Avatar>
          </Tooltip>

          <PhotoCamera className='ml-3 text-slate-400' />

          <div className='flex-1 border-b ml-4 mr-4' />
          <span className='flex flex-col items-end'>
            <pre className='text-xs'>Imię i nazwisko</pre>
            <p className='text-sm mt-2'>{user?.displayName}</p>
          </span>
        </span>

        <Invoicing {...{ loading, saving, editing, setEditing, updateUserDoc, userDoc }} />

        <p className='text-sm mt-6'>Zanim będziesz móc napisać artykuł lub stworzyć wzór pisma z formularzem bądź kalkulator, musisz wypełnić wszystkie poniższe pola oraz ustawić zdjęcie profilowe.</p>
        <span className='flex items-center justify-between mt-6'>
          <pre className='text-xs '>Twój opis</pre>
          {editingDesc
            ? <LoadingButton disabled={saving} loading={saving} onClick={() => updateUserDoc({ description: desc }, () => { setEditingDesc(false); setEditing(false); })} size='small' className='border-none'>
              zapisz
            </LoadingButton>
            : <Button disabled={saving || editing} onClick={() => { setEditingDesc(true); setEditing(true) }} size='small' className='border-none'>
              edytuj
            </Button>
          }
        </span>
        {editingDesc ?
          <>
            <textarea defaultValue={userDoc?.description || ''} maxLength={500} className='mt-2 rounded border p-3 text-sm' onChange={(event) => { setDesc(event.target.value) }} style={{ minHeight: 150 }} />
            <p className='text-xs mt-3'>{desc.length} / 500 znaków</p>
          </>
          : <div className='mt-2 border p-3' style={{ minHeight: 150 }}><p className='text-sm whitespace-normal rounded truncate'>{userDoc?.description || ''}</p></div>
        }

        <Workplace {...{ loading, saving, editing, setEditing, updateUserDoc, userDoc }} />
        <SocialMedia {...{ loading, saving, editing, setEditing, updateUserDoc, userDoc }} />

        <span className='flex items-center justify-between mt-6'>
          <pre className='text-xs '>Numer konta bankowego<i>*</i></pre>
          {editingBank
            ? <LoadingButton disabled={saving || !!(bankNumber && (bankNumber.length < 26 || bankNumber.length > 26 || (isNaN(bankNumber as any)) || isNaN(parseInt(bankNumber))))}
              loading={saving} onClick={() => updateUserDoc({ bankNumber }, () => { setEditingBank(false); setEditing(false); })} size='small' className='border-none'>
              zapisz
            </LoadingButton>
            : <Button disabled={saving || editing} onClick={() => { setEditingBank(true); setEditing(true) }} size='small' className='border-none'>
              edytuj
            </Button>
          }
        </span>
        {editingBank
          ? <span className='w-full flex flex-col'>
            <TextField defaultValue={bankNumber} error={!!(bankNumber && (bankNumber.length < 26 || bankNumber.length > 26 || (isNaN(bankNumber as any)) || isNaN(parseInt(bankNumber))))}
              size='small' onChange={({ target }) => setBankNumber(target.value)} className='mt-2' />
            {bankNumber && (bankNumber.length < 26 || bankNumber.length > 26 || (isNaN(bankNumber as any)) || isNaN(parseInt(bankNumber))) ? <p className='text-red-500 text-xs'>Numer konta bankowego musi składać się z 26 cyfr.</p> : null}
          </span>
          : <p className='border p-2 w-full mt-2 rounded text-sm'>{userDoc?.bankNumber ? userDoc.bankNumber : 'BRAK'}</p>
        }
        <p className='text-xs text-slate-400'><i>*</i> na ten numer konta będziemy przelewać Ci pieniądze, które zarobisz w naszym serwisie</p>
      </div>
      <Button disabled={saving || editing} variant='outlined' className='flex justify-between mt-6 mb-6 border-none' color='error'>Usuń konto <Delete /></Button>
    </> :
      <>
        <span className='flex items-stretch w-full'>
          <Skeleton variant='circular' className='mr-3 ' height={50} width={55} />
          <Skeleton variant='rectangular' className='w-full' height={50} />
        </span>
        <Skeleton variant='text' height={20} className='w-full mt-3' />
        <Skeleton variant='rectangular' className='w-full mt-3' height={100} />
        <Skeleton variant='rectangular' className='w-full mt-3' height={100} />
      </>}
  </article>
}

export interface ISubFormProps { loading: boolean, editing: boolean, saving: boolean, setEditing: React.Dispatch<boolean>, updateUserDoc: (overwriteProperty: { [key: string]: any }, success: () => void) => void, userDoc: IUserDoc | null }





const Invoicing = ({ loading, editing, saving, setEditing, updateUserDoc, userDoc }: ISubFormProps) => {
  const [editingInvoicing, setEditingInvoicing] = React.useState<boolean>(false);
  const [companyName, setCompanyName] = React.useState<string>(userDoc?.invoicing?.name || "");
  const [taxId, setTaxId] = React.useState<string>(userDoc?.invoicing?.taxId || "");
  const [address, setAddress] = React.useState<string>(userDoc?.invoicing?.address || "");

  return <>
    <span className='flex items-center justify-between mt-6'><pre className='text-xs '>Dane do faktur<i>*</i></pre> <i className='text-sm'>(opcjonalnie)</i></span>

    <Alert severity='info' action={<Button disabled={saving || editing} className='border-none -translate-y-0.5' size='small'>dodaj</Button>} className='text-sm mt-2'>Brak danych do faktur.</Alert>
    {false ? <>
      <span className='w-full flex items-center justify-between'>
        <TextField size='small' className='mt-2 flex-1' label='Nazwa spółki' />
        <div className='h-0 w-2' />
        <TextField size='small' className='mt-2 flex-1' label='Numer NIP' />
      </span>
      <TextField size='small' className='mt-2' label='Adres spółki' placeholder='np. ul. Jedwabna 17, 95-202 Pabianice' />
    </> : null}
    <p className='text-xs mt-1 text-slate-400'><i>*</i> na te dane będziemy wystawiać faktury za zakupy w naszym serwisie</p>
  </>
}


export default Account;