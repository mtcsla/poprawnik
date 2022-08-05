import { Add, ArrowBack, Edit } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, TextField } from '@mui/material';
import { cloneDeep } from 'lodash';
import { useRouter } from "next/router";
import React from "react";
import { getDefaultFragment, useFormDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import Fragment from '../form/EditorFragment';
import FieldEditor from "./FieldEditor";
import { useFormEditorLocation } from './FormEditor';

//a przed nią biezy baraaaaaaaaaaaaaaaaaanek a nad nią lata motyyyyyylek

const FragmentEditor = () => {
  const { location } = useFormEditorLocation();
  const { description, currentDescription, modifyDescription, modifyCurrentDescription, updateFirestoreDoc } = useFormDescription();
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false)


  const [saving, setSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);

  const router = useRouter();

  const [step, fragment, field] = location;


  React.useEffect(() => {
    if (router.isReady) {
      const newDescription = cloneDeep(currentDescription);
      if (router.query.new == '1')
        newDescription[step as number].children.push(getDefaultFragment());
      modifyDescription(['form_set_description', newDescription]);
    }
  }, [router.isReady])

  const cancelEdit = () => {
    const newQuery = cloneDeep(router.query);

    delete newQuery['field'];
    delete newQuery['fragment'];
    delete newQuery['new'];

    router.back();
  }
  const newField = () => {
    const newQuery = cloneDeep(router.query);

    newQuery.new = '1'
    newQuery.field = description[step as number].children[fragment as number].children.length.toString()

    router.push({ pathname: router.pathname, query: newQuery });
  }


  const deleteFragment = () => {
    const newDescription = cloneDeep(currentDescription);

    newDescription[step as number].children = newDescription[step as number].children.filter((v, i) => i != fragment)

    setSaving(true);
    modifyCurrentDescription(['form_set_description', newDescription,]);
    updateFirestoreDoc(newDescription).then(() => {
      setSaving(false);
      router.back()
      router.replace({ pathname: router.pathname, query: { id: router.query.id, step: step as number } });
    }).catch(() => {
      setSaving(false);
      setError(true);
      setTimeout(() => setError(false), 5000)
    })

  }



  return description[step as number]?.children[fragment as number] ? <div
    style={{ zIndex: 60 }}
    className="mount flex fixed top-0 left-0 w-screen h-screen bg-white"
  >

    <Snackbar open={error}>
      <Alert severity='error'>Nie udało się zapisać fragmentu. Spróbuj ponownie.</Alert>
    </Snackbar>
    <Dialog open={dialogOpen}>
      <DialogTitle>
        <pre className="text-sm">
          Anulujesz {router.query.new == '1' ? 'dodawanie' : 'edycję'} fragmentu
        </pre>
      </DialogTitle>
      <DialogContent className="text-sm">
        Fragment {router.query.new == '1' ? 'nie zostanie dodany' : 'wróci do stanu poprzedniego'}. Zmiany zostaną utracone.
      </DialogContent>
      <DialogActions>
        <Button size='small' onClick={cancelEdit} className='mr-2 border-none'>
          OK
        </Button>
        <Button size='small' color='error' onClick={() => setDialogOpen(false)} className='border-none'>
          wróć
        </Button>
      </DialogActions>

    </Dialog>
    <Dialog open={deleteDialogOpen}>
      <DialogTitle>
        <pre className="text-sm">
          Usuwasz fragment
        </pre>
      </DialogTitle>
      <DialogContent className="text-sm">
        Fragment zostanie usunięty. Wszelkie odwołania do pól zawartych we fragmencie w obliczeniach i warunkach zostaną zamienione na wartości obojętne.
      </DialogContent>
      <DialogActions>
        <Button size='small' onClick={deleteFragment} className='mr-2 border-none'>
          OK
        </Button>
        <Button size='small' color='error' onClick={() => setDeleteDialogOpen(false)} className='border-none'>
          wróć
        </Button>
      </DialogActions>

    </Dialog>

    <div className="flex-1 h-full flex-col sm:p-8 md:p-12 justify-center flex">
      <Fragment editor={true} fragment={description[step as number].children[fragment as number]} />
      <Button className="mt-8 self-end border-none" size='small' onClick={newField}>
        <Add className='mr-2' />
        dodaj pole
      </Button>
    </div>
    <div className="flex-1 h-full bg-slate-50 sm:p-8 md:p-12 border-l flex-col flex items-start justify-center">
      <span className="w-full flex flex-col">
        <h1 className="flex items-center truncate"><Edit className="mr-2" color='primary' /> Edytujesz fragment </h1>
        <p>Dodaj pola, tytuł oraz opis.</p>

        <TextField
          value={description[step as number].children[fragment as number].title || ''}
          onChange={(e) => modifyDescription(['fragment_set_title', [step as number, fragment as number, e.target.value]])}
          label='tytuł' className="mt-4 mr-4 flex-1 bg-white w-full" />
        <TextField value={description[step as number].children[fragment as number].subtitle || ''}
          onChange={(e) => modifyDescription(['fragment_set_subtitle', [step as number, fragment as number, e.target.value]])}
          label='opis' className='mt-4 flex-1 bg-white w-full' />
      </span>

      <div className='flex flex-col mt-8 w-full'>
        <LoadingButton disabled={description[step as number]?.children[fragment as number]?.children?.length < 1} loading={saving} className="bg-white w-full mb-4" onClick={
          () => {
            setSaving(true)
            modifyCurrentDescription(
              [
                'form_set_description',
                description,
              ],
            )
            updateFirestoreDoc(description)
              .then(() => {
                setSaving(false);
                router.back();
              }).
              catch(() => {
                setSaving(false);
                setError(true);
                setTimeout(() => setError(false), 5000)
              })
          }
        }>Zapisz</LoadingButton>
        {
          router?.query?.new == '1' ? null :
            <LoadingButton loading={saving} color='error' size='small' onClick={() => setDeleteDialogOpen(true)} className="bg-white w-full mb-4">Usuń fragment</LoadingButton>
        }
        <Button className="border-none self-end" size='small' color='error' onClick={() => setDialogOpen(true)}>
          <ArrowBack className='mr-2' />
          Anuluj
        </Button>
      </div>
    </div>
    {
      typeof field === 'number' ? <FieldEditor /> : null
    }
  </div> : null;
}

export default FragmentEditor;
