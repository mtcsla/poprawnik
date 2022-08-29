import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from '@firebase/firestore';
import { Add, Article } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { firestore } from '../../../buildtime-deps/firebase';
import { useAuth } from '../../../providers/AuthProvider';
export const getStaticProps = async () => {
  return { props: {} };
}

export interface IFormData {
  author: string,
  authorName: string,
  authorPictureURL: string,

  title: string,
  description: string,

  formData: any;
  templateData: any;

  id: string
}

const YourForms = ({ }) => {
  const [forms, setForms] = React.useState<IFormData[] | null>(null)
  const [creatingForm, setCreatingForm] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [deleting, setDeleting] = React.useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = React.useState<number>(-1);

  const { userProfile } = useAuth();

  const router = useRouter();

  React.useEffect(() => {
    if (userProfile) {
      getDocs(query(collection(firestore, 'forms'), where('author', '==', userProfile.uid))).then(snasphot => {
        const newForms: IFormData[] = [];

        snasphot.forEach(doc => {
          newForms.push({ id: doc.id, ...doc.data() } as IFormData);
        })

        setForms(newForms);
      })
    }

  }, [userProfile])

  const newForm = () => {
    setCreatingForm(true);
    setError('');

    if (!userProfile) return;

    addDoc(collection(firestore, 'forms'), {
      author: userProfile.uid,
      authorName: userProfile.displayName,
      authorPictureURL: userProfile.photoURL,
      title: '',
      description: '',

      formData: [],
      templateData: {},

      visible: false
    }).then((snapshot) => {
      router.push('/account/lawyer/edit-document?id=' + snapshot.id);
    }).catch(err => {
      setError('Wystąpił błąd podczas tworzenia formularza.');
      setCreatingForm(false);
    })

  }

  const deleteForm = () => {
    setDeleting(true);
    const id = forms?.[confirmDelete].id;
    deleteDoc(doc(firestore, `forms/${id}`)).then(() => {
      setForms(forms?.filter((form) => form.id !== id) as IFormData[]);
      setDeleting(false);
      setConfirmDelete(-1);
    });
  }



  return <article className='flex flex-col w-full mb-8'>
    <h1>
      <Article className='-translate-y-0.5 mr-2' color='primary' /> Twoje pisma
    </h1>
    <p >
      Tutaj możesz tworzyć pisma, które sprzedasz w naszym serwisie
    </p>
    {userProfile && forms ? <>
      {forms.length === 0 ?
        <div className='flex flex-col'>
          <div
            className={
              "p-4 mt-2 flex items-center justify-center rounded-lg border h-32  "
            }
          >
            <div className={"flex flex-col"}>
              <pre>Brak pism</pre>
              <p className={"mt-1"}>Tutaj będą wyświetlać się pisma, które stworzysz.</p>
            </div>
          </div>
        </div>
        :

        forms.map((form: IFormData) =>
          <div
            className={"p-4 flex flex-col rounded-lg justify-between border h-32 mt-8 "}
          >
            <div className={'flex justify-between'}>
              <p className={'truncate'}>
                {form.title || <i>BRAK TYTUŁU</i>}
              </p>
              <div style={{ minWidth: 50 }} />

              <Link passHref href={`/account/lawyer/edit-document?id=${form.id}`}>
                <a>
                  <Button
                    className='p-0'
                    size={'small'}
                    sx={{ border: 'none' }}
                  >

                    Edytuj
                  </Button>
                </a>
              </Link>
            </div>
            <div className='flex justify-between w-full'>
              <p className='text-sm text-slate-600 truncate'>
                {form.description || <i>BRAK OPISU</i>}
              </p>
              <p className='text-sm ml-2 text-red-500 cursor-pointer'
                onClick={() => setConfirmDelete(forms.findIndex(findForm => findForm.id === form.id))}>
                Usuń
              </p>
            </div>
          </div>
        )

      }

      {!deleting
        ? <LoadingButton className='mt-8 p-4 bg-blue-500 text-white' onClick={newForm} disabled={deleting} loading={creatingForm}>
          <Add className='mr-2' /> Nowe pismo
        </LoadingButton>
        :
        <LoadingButton className='mt-8 p-4' onClick={newForm} disabled loading={creatingForm}>
          <Add className='mr-2' /> Nowe pismo
        </LoadingButton>
      }
      {error ? <p className='text-red-500 text-xs'>{error}</p> : null}
    </>
      :
      <>
        <Skeleton variant='rectangular' className='rounded mt-8' height={110} />
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
    <Dialog open={confirmDelete !== -1}>
      <DialogTitle><pre className='text-sm'>Potwierdzenie</pre></DialogTitle>
      <DialogContent>
        Czy na pewno chcesz usunąć pismo o nazwie <i>{forms?.[confirmDelete]?.title || "brak tytułu".toUpperCase()}</i>?
      </DialogContent>
      <DialogActions>
        <LoadingButton disabled={deleting} onClick={() => setConfirmDelete(-1)} color='error' className='border-none'>
          Anuluj
        </LoadingButton>
        <LoadingButton onClick={() => deleteForm()} loading={deleting} className='border-none'>
          Tak
        </LoadingButton>
      </DialogActions>
    </Dialog>
  </article>;
}

export default YourForms

