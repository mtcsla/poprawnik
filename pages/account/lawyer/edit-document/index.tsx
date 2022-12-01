import { collection, doc, getDoc, getDocs, updateDoc } from '@firebase/firestore';
import { ArrowBack, Bookmark, CancelPresentation, DoneAll, Warning } from "@mui/icons-material";
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select, Skeleton, TextField } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import React from "react";
import { IFormData } from "..";
import { firestore } from "../../../../buildtime-deps/firebase";
import { useAuth } from '../../../../providers/AuthProvider';

const EditForm = () => {
  const [form, setForm] = React.useState<IFormData | null>(null);
  const { userProfile } = useAuth();
  const router = useRouter();

  const [allCategories, setAllCategories] = React.useState<string[]>([]);

  const [title, setTitle] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [price, setPrice] = React.useState<number | null>(null);
  const [category, setCategory] = React.useState<string>('');
  const [newCategory, setNewCategory] = React.useState<string>('');

  const [finalPrice, setFinalPrice] = React.useState<number | null>(null);

  const [editing, setEditing] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [verifying, setVerifying] = React.useState<boolean>(false);

  const [editingDescription, setEditingDescription] = React.useState<boolean>(false);
  const [editingTitle, setEditingTitle] = React.useState<boolean>(false);
  const [editingPrice, setEditingPrice] = React.useState<boolean>(false);
  const [editingCategory, setEditingCategory] = React.useState<boolean>(false);

  const [invalidMessages, setInvalidMessages] = React.useState<[React.ReactNode, React.ReactNode]>(['', '']);
  const [errorDialogOpen, setErrorDialogOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    const newErrors: [React.ReactNode, React.ReactNode] = ['', ''];
    if (
      !title
      || !description
      || !price
      || !category
    ) {
      newErrors[0] = <p className='text-red-500 mb-2'>
        Aby oddać pismo do weryfikacji, musisz dodać tytuł, opis, proponowaną cenę i kategorię.
      </p>
    }
    if (
      category === 'new'
      && !newCategory
    ) {
      newErrors[1] = <p className='text-red-500 mb-2'>
        Kategoria jest ustawiona jako "nowa kategoria", ale nie podano jej nazwy.
      </p>
    }
    setInvalidMessages(newErrors);
  }, [
    title,
    description,
    price,
    category,
    newCategory,
  ])



  const [completeDialogOpen, setCompleteDialogOpen] = React.useState<boolean>(false);
  const [completeError, setCompleteError] = React.useState<string>('');
  const sendToVerification = () => {
    setLoading(true);
    updateDoc(doc(firestore, 'forms', router.query.id as string), {
      awaitingVerification: true,
      reasonForRejection: '',
    }).then(() => {
      setLoading(false);
      setCompleteDialogOpen(false);
      router.push('/account/lawyer');
    }).catch(() => {
      setLoading(false);
      setCompleteError('Wystąpił błąd podczas wysyłania formularza do weryfikacji. Spróbuj ponownie później.');
    })
  }

  const [throwOutDialogOpen, setThrowOutDialogOpen] = React.useState<boolean>(false);
  const [throwOutError, setThrowOutError] = React.useState<string>('');
  const [throwOutReason, setThrowOutReason] = React.useState<string>('');
  const throwOut = (reasonForRejection: string) => {
    setLoading(true);
    updateDoc(doc(firestore, 'forms', router.query.id as string), {
      awaitingVerification: false,
      reasonForRejection,
    }).then(() => {
      router.push('/account/verifier');
      setLoading(true);
      setThrowOutError('');
    }).catch(
      () => {
        setLoading(false);
        setThrowOutError('Wystąpił błąd podczas odrzucania formularza. Spróbuj ponownie później.');
      }
    );
  }
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);


  React.useEffect(() => {
    if (userProfile && router.isReady) {
      setVerifying(router.query.verifying === 'true')
      getDoc(doc(firestore, `forms/${router.query.id}`)).then(async snapshot => {
        if (!snapshot.data()) {
          router.push('/account/lawyer');
        }
        const categories = (await
          getDocs(
            collection(
              firestore,
              `categories`
            )
          )
        ).docs.map(
          doc => doc.id
        ) ?? [];

        setAllCategories(categories);
        setForm({ id: snapshot.id, ...snapshot.data() } as IFormData);
        setTitle(snapshot.data()?.title ?? '');
        setDescription(snapshot.data()?.description ?? '');
        setPrice(snapshot.data()?.price ?? null);
        setCategory(snapshot.data()?.category ?? '');
        setNewCategory(snapshot?.data()?.category === 'new' ? (snapshot.data()?.newCategory ?? '') : '');

      }).catch(err => {
        console.log(err);
        router.push('/account/lawyer')
      });
    }

  }, [userProfile, router.isReady])

  const updateProperty = (
    override: { [key: string]: string | number | null },
    onSuccess: () => void) => {
    setLoading(true);

    updateDoc(doc(firestore, `forms/${form?.id}`), override).then((snapshot) => {
      setLoading(false);
      setEditing(false);
      setForm(Object.assign(form as IFormData, override) as IFormData);
      onSuccess();
    })
  }

  const [publishDialogOpen, setPublishDialogOpen] = React.useState<boolean>(false);
  const [publishingError, setPublishingError] = React.useState<string>('');

  const publish = (price: number) => {
    setLoading(true);
    axios.post(
      `/api/payments/addProduct?id=${form?.id ?? ''}&price=${price}`,
    ).then(
      () => {
        setLoading(false);
        setPublishDialogOpen(false);
        router.push('/account/verifier');
      }
    ).catch(
      (err) => {
        setLoading(false);
        setPublishingError('Wystąpił błąd podczas zatwierdzania pisma. Spróbuj ponownie później.');
        console.log(err);
      }
    )

  }

  return <article className="w-full flex flex-col items-stretch mb-8">
    <Button size='small' onClick={() => router.push(verifying ? '/account/verifier' : `/account/lawyer`)} className='bg-blue-100 rounded mb-12 border-none w-full flex items-center justify-between'>
      <ArrowBack />
      Wróć do {verifying ? 'panelu weryfikacji' : 'twoich pism'}
    </Button>
    <h1 className="mb-4"><Bookmark className="mr-2 -translate-y-0.5" color='primary' />{verifying ? 'Weryfikujesz' : 'Edytujesz'} pismo</h1>
    {form && userProfile ? <>
      <span className="flex items-center justify-between">
        <pre className="text-sm">nazwa pisma</pre>
        {!editingTitle
          ? <LoadingButton size='small' className='border-none' disabled={editing || verifying || form.awaitingVerification}
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
        ? <p className="p-4 bg-slate-50 rounded">{form.title || 'BRAK'}</p>
        : <TextField defaultValue={title} onChange={({ target }) => setTitle(target.value)} />
      }
      <span className="flex items-center mt-2 justify-between">
        <pre className="text-sm">sugerowana cena (bez VAT)</pre>
        {!editingPrice
          ? <LoadingButton size='small' className='border-none' disabled={editing || verifying || form.awaitingVerification}
            onClick={() => { setEditing(true); setEditingPrice(true); }}>
            zmień
          </LoadingButton>
          : <LoadingButton loading={loading} size='small' className='border-none'
            onClick={() => {
              updateProperty({ price }, () => setEditingPrice(false))
            }}>

            zapisz
          </LoadingButton>
        }
      </span>
      {!editingPrice
        ? <p className="p-4 bg-slate-50 rounded">{form.price || 'BRAK'}</p>
        //@ts-ignore
        : <TextField type='number' defaultValue={price} onChange={({ target }) => setPrice(parseFloat(target.value) !== NaN ? parseFloat(target.value) : null)} />
      }


      <span className="flex items-center mt-2 justify-between">
        <pre className="text-sm">kategoria pisma</pre>
        {!editingCategory
          ? <LoadingButton size='small' className='border-none' disabled={editing || verifying || form.awaitingVerification}
            onClick={() => { setEditing(true); setEditingCategory(true); }}>
            zmień
          </LoadingButton>
          : <LoadingButton loading={loading} size='small' className='border-none'
            onClick={() => {
              updateProperty({ category, newCategory }, () => setEditingCategory(false))
            }}>
            zapisz
          </LoadingButton>
        }
      </span>
      {!editingCategory
        ? <p className="p-4 bg-slate-50 rounded">{(form.category === 'new' ? 'nowa kategoria' : form.category) || 'BRAK'}</p>
        //@ts-ignore
        : <FormControl className='w-full'>
          <Select defaultValue={category} value={category} onChange={(e) => setCategory(e.target.value)}>
            <MenuItem value='new'>nowa kategoria</MenuItem>
            {
              allCategories.map((category) => <MenuItem value={category}>{category}</MenuItem>)
            }
          </Select>
        </FormControl>
      }
      {category === 'new' ? <>
        <span className="flex items-center mt-2 mb-2 justify-between">
          <pre className="text-sm">nazwa nowej kategorii</pre>
        </span>
        {!editingCategory
          ? <p className="p-4 bg-slate-50 rounded">{newCategory || 'BRAK'}</p>
          //@ts-ignore
          : <TextField placeholder='np. Prawo spadkowe' defaultValue={newCategory} onChange={({ target }) => setNewCategory(target.value)} />
        }
      </> : null}

      <span className="flex items-center justify-between mt-3">
        <pre className="text-sm">opis</pre>
        {!editingDescription
          ? <LoadingButton size='small' className='border-none' disabled={editing || verifying || form.awaitingVerification}
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
        ? <p className="p-4 bg-slate-50 rounded" style={{ minHeight: 150 }}>{form.description || 'BRAK'}</p>
        : <textarea className='bg-slate-50 rounded p-4' defaultValue={description} maxLength={750} style={{ minHeight: 150 }}
          onChange={({ target }) => setDescription(target.value)} />
      }
      {verifying
        ? <div className='mt-4' />
        : <>
          <h1 className='mt-4 inline-flex gap-2'><Warning color='primary' className='translate-y-0.5' /> Ważne</h1>
          <p className='text-sm mb-4'>
            Najpierw wykonaj w całości formularz pisma, a dopiero potem zabierz się za jego wzór.
          </p>
        </>}
      <pre className='mt-2 mb-2 text-sm inline-flex gap-4 items-center justify-between'>
        Formularz
        <div className='border-b flex-1' />
        <Button size='small' className='border-none' disabled={verifying ? false : editing || form.awaitingVerification}
          onClick={() => router.push(`/account/lawyer/edit-document/form?id=${form.id}${verifying ? '&verifying=true' : ''}`)}>
          {
            verifying
              ? 'sprawdź'
              : 'edytuj'
          }

        </Button>
      </pre>
      <pre className='mt-2 mb-2 text-sm inline-flex gap-4 items-center justify-between'>
        Wzór pisma
        <div className='border-b flex-1' />
        <Button size='small' className='border-none'
          disabled={
            JSON.stringify(form.formData) === '[]' || (verifying ? false : editing || form.awaitingVerification)

          } onClick={() => router.push(`/account/lawyer/edit-document/template?id=${form.id}${verifying ? '&verifying=true' : ''}`)}>
          {
            verifying
              ? 'sprawdź'
              : 'edytuj'
          }
        </Button>
      </pre>
      <Dialog open={completeDialogOpen}>
        <DialogTitle>
          <pre className='text-sm'>Oddajesz pismo do weryfikacji</pre>
        </DialogTitle>
        <DialogContent>
          <p className='text-sm'>Czy na pewno chcesz oddać pismo do weryfikacji?</p>
          {completeError
            ? <p className='text-sm text-red-500 mt-2'>{completeError}</p>
            : null
          }

        </DialogContent>
        <DialogActions>
          <LoadingButton loading={loading} onClick={() => { sendToVerification(); }} className='border-none'>tak</LoadingButton>
          <Button color='error' disabled={loading} onClick={() => setCompleteDialogOpen(false)} className='border-none'>Anuluj</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={publishDialogOpen}>
        <DialogTitle>
          <pre className='text-sm'>Zatwierdzasz i publikujesz pismo</pre>
        </DialogTitle>
        <DialogContent className='flex flex-col'>
          <p className='text-sm mb-4'>Tę operację może odwrócić tylko administrator serwisu.</p>
          <TextField type='number' label='cena ostateczna (bez VAT)' onChange={e => {
            const newFinalPrice = parseFloat(e.target.value)
            //@ts-ignore;
            setFinalPrice(newFinalPrice != NaN ? newFinalPrice : null);
          }} />
          <p className='text-xs text-red-500 mt-4'>{publishingError}</p>
        </DialogContent>
        <DialogActions>
          <LoadingButton loading={loading} disabled={finalPrice == null} onClick={() => { publish(finalPrice!); }} className='border-none'>tak</LoadingButton>
          <Button color='error' disabled={loading} onClick={() => setPublishDialogOpen(false)} className='border-none'>Anuluj</Button>

        </DialogActions>
      </Dialog>
      <Dialog open={errorDialogOpen}>

        <DialogTitle>
          <pre className='text-sm text-red-500'>Dane pisma zawierają błędy</pre>
        </DialogTitle>
        <DialogContent>
          <p className='text-sm mb-2'>Nie możesz zatwierdzić pisma, dopóki nie poprawisz błędów:</p>

          {
            invalidMessages
          }
        </DialogContent>

        <DialogActions>
          <Button color='error' disabled={loading} onClick={() => setErrorDialogOpen(false)} className='border-none'>Wróć</Button>
        </DialogActions>
      </Dialog>

      {verifying
        ? <>
          <Button onClick={() => setPublishDialogOpen(true)} className={`mt-4 p-4 ${false ? 'bg-gray-300' : 'bg-blue-400'} text-white`}>
            <DoneAll className='mr-2' />
            Zatwierdź
          </Button>
          <Button onClick={() => setThrowOutDialogOpen(true)} className={`mt-4 p-4 ${false ? 'bg-gray-300' : 'bg-red-400'} text-white`}>
            <CancelPresentation className='mr-2' />
            Odeślij do poprawki
          </Button>
        </>
        : <Button onClick={() => {
          if (
            invalidMessages[0] || invalidMessages[1]
          )
            setErrorDialogOpen(true);
          else
            setCompleteDialogOpen(true);
        }} disabled={form.awaitingVerification} className={`mt-4 p-4 ${form.awaitingVerification ? 'bg-gray-300 text-white' : 'bg-blue-500 text-white hover:bg-blue-400'} `}>
          <DoneAll className='mr-2' />
          {form.awaitingVerification
            ? 'Oddano do weryfikacji'
            : 'Oddaj do weryfikacji'
          }
        </Button>
      }
      {form.reasonForRejection
        ? <><div className='p-4 bg-red-50 text-red-500 mt-8 border-red-500 bg-slate-50 rounded flex flex-col'>
          <pre className='text-sm text-red-400'>Twoje pismo zostało odrzucone</pre>
          <p className='mt-4 font-bold text-sm'>
            {form.reasonForRejection}
          </p>
          <p className='mt-2 text-sm'>
            Popraw pismo i wyślij ponownie do weryfikacji.
          </p>
        </div>
        </>

        : null
      }
      <Dialog open={throwOutDialogOpen}>
        <DialogTitle><pre className='text-sm'>Odrzucasz pismo</pre></DialogTitle>
        <DialogContent className='flex flex-col'>
          <p className='text-sm mb-4'>
            Podaj powód odrzucenia pisma i sugerowane poprawki. Autor otrzyma powiadomienie o odrzuceniu pisma.
          </p>
          <textarea className='w-full bg-slate-50 rounded p-4' onChange={(e) => setThrowOutReason(e.target.value || '')} style={{
            minHeight: 150
          }} />
          {
            throwOutError
              ? <p className='text-sm mt-4 text-red-500'>{throwOutError}</p>
              : null
          }
        </DialogContent>
        <DialogActions>
          <LoadingButton className='border-none' loading={loading} disabled={!throwOutReason} size='small' onClick={() => throwOut(throwOutReason)}>
            Gotowe
          </LoadingButton>
          <Button disabled={loading} size='small' color='error' onClick={() => setThrowOutDialogOpen(false)} className='border-none'>
            Anuluj
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
    }

  </article >;
}

export default EditForm;
