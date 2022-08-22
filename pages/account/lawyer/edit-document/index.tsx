import { doc, getDoc, updateDoc } from '@firebase/firestore';
import { Bookmark, DoneAll, Warning } from "@mui/icons-material";
import { LoadingButton } from '@mui/lab';
import { Button, Skeleton, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import React from "react";
import { IFormData } from "..";
import { firestore } from "../../../../buildtime-deps/firebase";
import { useAuth } from '../../../../providers/AuthProvider';

const EditForm = () => {
  const [form, setForm] = React.useState<IFormData | null>(null);
  const { userProfile } = useAuth();
  const router = useRouter();

  const [title, setTitle] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');

  const [editing, setEditing] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [editingDescription, setEditingDescription] = React.useState<boolean>(false);
  const [editingTitle, setEditingTitle] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (userProfile && router.isReady) {
      getDoc(doc(firestore, `forms/${router.query.id}`)).then(snapshot => {
        if (!snapshot.data()) {
          router.push('/account/lawyer');
        }

        setForm({ id: snapshot.id, ...snapshot.data() } as IFormData);
        setTitle(snapshot.data()?.title);
        setDescription(snapshot.data()?.description);
      }).catch(err => {
        router.push('/account/lawyer')
      });
    }

  }, [userProfile, router.isReady])

  const updateProperty = (
    override: { [key: string]: string },
    onSuccess: () => void) => {
    setLoading(true);

    updateDoc(doc(firestore, `forms/${form?.id}`), override).then((snapshot) => {
      setLoading(false);
      setEditing(false);
      setForm(Object.assign(form as IFormData, override) as IFormData);
      onSuccess();
    })
  }




  return <article className="w-full flex flex-col items-stretch mb-8">
    <h1 className="mb-4"><Bookmark className="mr-2 -translate-y-0.5" color='primary' />Edytujesz pismo</h1>
    {form && userProfile ? <>
      <span className="flex items-center justify-between">
        <pre className="text-sm">nazwa pisma</pre>
        {!editingTitle
          ? <LoadingButton size='small' className='border-none' disabled={editing}
            onClick={() => { setEditing(true); setEditingTitle(true); }}>
            zmień
          </LoadingButton>
          : <LoadingButton loading={loading} size='small' className='border-none'
            onClick={() => updateProperty({ title }, () => setEditingTitle(false))}>
            zapisz
          </LoadingButton>
        }
      </span>
      {!editingTitle
        ? <p className="p-4 border rounded-lg">{form.title || 'BRAK'}</p>
        : <TextField size='small' defaultValue={title} onChange={({ target }) => setTitle(target.value)} />
      }

      <span className="flex items-center justify-between mt-3">
        <pre className="text-sm">opis</pre>
        {!editingDescription
          ? <LoadingButton size='small' className='border-none' disabled={editing}
            onClick={() => { setEditing(true); setEditingDescription(true); }}>
            zmień
          </LoadingButton>
          : <LoadingButton loading={loading} size='small' className='border-none'
            onClick={() => updateProperty({ description }, () => setEditingDescription(false))}>
            zapisz
          </LoadingButton>
        }
      </span>
      {!editingDescription
        ? <p className="p-4 border rounded-lg" style={{ minHeight: 150 }}>{form.description || 'BRAK'}</p>
        : <textarea className='border rounded-lg p-4' defaultValue={description} maxLength={750} style={{ minHeight: 150 }}
          onChange={({ target }) => setDescription(target.value)} />
      }
      <h1 className='mt-4 inline-flex gap-2'><Warning color='primary' className='translate-y-0.5' /> Ważne</h1>
      <p className='text-sm mb-4'>
        Najpierw wykonaj w całości formularz pisma, a dopiero potem zabierz się za jego wzór.
      </p>
      <pre className='mt-2 mb-2 text-sm inline-flex gap-4 items-center justify-between'>
        Formularz
        <div className='border-b flex-1' />
        <Button size='small' className='border-none'
          onClick={() => router.push(`/account/lawyer/edit-document/form?id=${form.id}`)}>
          edytuj
        </Button>
      </pre>
      <pre className='mt-2 mb-2 text-sm inline-flex gap-4 items-center justify-between'>
        Wzór pisma
        <div className='border-b flex-1' />
        <Button size='small' className='border-none'
          disabled={JSON.stringify(form.formData) === '[]'} onClick={() => router.push(`/account/lawyer/edit-document/template?id=${form.id}`)}>
          edytuj
        </Button>
      </pre>

      <Button className='mt-4 p-4 bg-blue-500 hover:bg-blue-400 text-white'>
        <DoneAll className='mr-2' />
        Oddaj do weryfikacji
      </Button>

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

  </article>;
}

export default EditForm;
