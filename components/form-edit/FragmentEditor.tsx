import { Add, ArrowBack, Edit, Visibility } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, TextField } from '@mui/material';
import { cloneDeep } from 'lodash';
import { useRouter } from "next/router";
import React from "react";
import { FormDescription, getDefaultFragment, useFormDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { useFormTemplateDescription } from '../../providers/FormDescriptionProvider/FormTemplateDescriptionProvider';
import { Expression, TemplateDescription } from '../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import Fragment from '../form/EditorFragment';
import Changes from "./Changes";
import { ConditionCalculationDisplay } from "./condition-calculation-editor/ConditionCalculationDisplay";
import ConditionCalculationEditor, { Condition, OperatorCondition } from "./condition-calculation-editor/ConditionCalculationEditorProvider";
import FieldEditor from "./FieldEditor";
import { useFormEditorLocation } from './FormEditor';

//a przed nią biezy baraaaaaaaaaaaaaaaaaanek a nad nią lata motyyyyyylek

const FragmentEditor = () => {
  const { location } = useFormEditorLocation();
  const { description, currentDescription, modifyDescription, modifyCurrentDescription, updateFirestoreDoc } = useFormDescription();
  const templateDescriptionObject = useFormTemplateDescription();

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false)
  const [editingCondition, setEditingCondition] = React.useState<boolean>(false)


  const [saving, setSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);

  const [conditionToAdd, setConditionToAdd] = React.useState<Expression<Condition, OperatorCondition>>({ components: [], operators: [] });

  const router = useRouter();

  const [step, fragment, field] = location;


  React.useEffect(() => {
    if (router.isReady) {
      const newDescription = cloneDeep(currentDescription);
      const newTemplate = cloneDeep(templateDescriptionObject.currentDescription);
      if (router.query.new == '1')
        newDescription[step as number].children.push(getDefaultFragment());

      modifyDescription(['form_set_description', newDescription]);
      templateDescriptionObject.setDescription(newTemplate);
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
    newQuery.field = description[step as number].children[fragment as number]?.children.length.toString()

    router.push({ pathname: router.pathname, query: newQuery });
  }


  const deleteFragment = (newForm: FormDescription, newTemplate: TemplateDescription) => {
    /* const newDescription = cloneDeep(currentDescription);
    const lastDescription = cloneDeep(currentDescription);

    setSaving(true);
    modifyCurrentDescription(['form_set_description', FormNormalize.conditions(newDescription, location, true)]);
    updateFirestoreDoc(newDescription).then(() => {
      setSaving(false);
      router.back()
      router.replace({ pathname: router.pathname, query: { id: router.query.id, step: step as number } });
    }).catch(() => {
      modifyCurrentDescription(['form_set_description', lastDescription])
      setSaving(false);
      setError(true);
      setTimeout(() => setError(false), 5000)
    })*/

    setSaving(true);
    updateFirestoreDoc(newForm, newTemplate).then(() => {
      modifyCurrentDescription(['form_set_description', newForm]);
      templateDescriptionObject.setCurrentDescription(newTemplate);
      setSaving(false);
      router.back()
    }).catch(
      (err) => {
        setSaving(false);
        setError(true);
        setTimeout(() => setError(false), 5000)
      }
    );
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
    <Dialog open={deleteDialogOpen || !!conditionToAdd?.components?.length}>
      <DialogTitle>
        <pre className="text-sm">
          {deleteDialogOpen
            ? 'Usuwasz fragment'
            : 'Dodajesz warunek'
          }
        </pre>
      </DialogTitle>
      <DialogContent style={{ maxWidth: 800 }} className="text-sm">
        {deleteDialogOpen
          ? 'Fragment zostanie usunięty. Wszelkie odwołania do pól zawartych we fragmencie w warunkach zostaną zamienione na wartości obojętne, a obliczenia zawierające odwołania do pól zawartych we fragmencie zostaną usunięte.'
          : 'Warunek zostanie dodany. Wszelkie obliczenia zawierające odwołania do pól zawartych we fragmencie zostaną usunięte.'
        }
        <Changes
          deletionType="fragment"
          deletePath={[step as number, fragment as number, null]}
          requiredChange={deleteDialogOpen ? false : true}
          message={
            deleteDialogOpen
              ? "Zmiany zostaną zapisane, ta operacja jest nieodwracalna."
              : "Zmiany wejdą w życie dopiero po zapisaniu fragmentu."
          }
          onCancel={() => { setDeleteDialogOpen(false); setConditionToAdd({ components: [], operators: [] }) }}
          onSubmit={(newForm, newTemplate) => {
            if (deleteDialogOpen)
              deleteFragment(newForm, newTemplate)
            else {
              templateDescriptionObject.setDescription(newTemplate);
              modifyDescription(['fragment_set_condition', [step as number, fragment as number, conditionToAdd]]);
              setConditionToAdd({ components: [], operators: [] });
              setEditingCondition(false);
            }
          }}
          saving={saving}
        />
      </DialogContent>

    </Dialog>

    <div className="flex-1 h-full relative overflow-y-auto flex-col sm:p-8 md:p-12 flex">
      <pre className="top-12 left-12 absolute flex whitespace-nowrap items-center"><Visibility className="mr-2" /> Podgląd fragmentu</pre>
      <span className='m-auto w-full flex flex-col'>
        <Fragment editor={true} fragment={description[step as number].children[fragment as number]} />
        <Button className="mt-8 self-end border-none" size='small' onClick={newField}>
          <Add className='mr-2' />
          dodaj pole
        </Button>
      </span>
    </div>
    <div className="flex-1 bg-slate-50 h-full sm:p-8 md:p-12 border-l flex-col flex items-start justify-center">

      <span className="w-full flex flex-col">
        <h1 className="flex items-center truncate"><Edit className="mr-2" color='primary' /> Edytujesz fragment </h1>
        <p>Dodaj pola, tytuł oraz opis.</p>

        <TextField
          value={description[step as number].children[fragment as number]?.title || ''}
          onChange={(e) => modifyDescription(['fragment_set_title', [step as number, fragment as number, e.target.value]])}
          label='tytuł' className="mt-4 mr-4 flex-1 bg-white w-full" />
        <TextField value={description[step as number].children[fragment as number]?.subtitle || ''}
          onChange={(e) => modifyDescription(['fragment_set_subtitle', [step as number, fragment as number, e.target.value]])}
          label='opis' className='mt-4 flex-1 bg-white w-full' />
      </span>

      <span className="items-center mt-6 justify-between mb-4 flex w-full">
        <pre className="text-base" >Pola fragmentu aktywne</pre>
        <div className="border-b flex-1 ml-4 mr-4" />
        <p className="uppercase text-sm font-bold">{!description[step as number].children[fragment as number]?.condition?.components?.length ? 'zawsze' : 'warunkowo'}</p>
      </span>

      {description[step as number].children[fragment as number]?.condition?.components?.length ?
        <ConditionCalculationDisplay first type='condition' sequence={description[step as number].children[fragment as number]?.condition ?? { operators: [], components: [] }} />
        : null
      }
      <Button className="self-end border-none px-0" onClick={() => setEditingCondition(true)} size='small'>Zmień</Button>

      {editingCondition ?
        <ConditionCalculationEditor
          type='condition'
          exit={() => setEditingCondition(false)}
          save={condition => {
            if (
              currentDescription[step as number].children[fragment as number]?.condition?.components?.length
              || description[step as number].children[fragment as number]?.condition?.components?.length
            ) {
              modifyDescription(['fragment_set_condition', [step as number, fragment as number, condition as Expression<Condition, OperatorCondition>]])
              setEditingCondition(false);
            }
            else {
              setConditionToAdd(condition as Expression<Condition, OperatorCondition>);
            }
          }}
          initValue={description[step as number].children[fragment as number]?.condition ?? { operators: [], components: [] }}
        />
        : null
      }

      <div className='flex flex-col mt-8 w-full'>
        <LoadingButton disabled={description[step as number]?.children[fragment as number]?.children?.length < 1} loading={saving} className={`border-none w-full mb-4 ${saving ? 'bg-gray-100' : 'bg-blue-100'}`} onClick={
          () => {

            setSaving(true)
            updateFirestoreDoc(description, templateDescriptionObject.description)
              .then(() => {
                setSaving(false);
                router.back();

                modifyCurrentDescription(['form_set_description', description])
                templateDescriptionObject.setCurrentDescription(templateDescriptionObject.description)
              }).
              catch(() => {
                setSaving(false);
                setError(true);
                setTimeout(() => setError(false), 5000)
              })
          }
        }>
          Zapisz
        </LoadingButton>

        {
          router?.query?.new == '1' ? null :
            <Button disabled={saving} color='error' size='small' onClick={() => setDeleteDialogOpen(true)} className={`border-none ${saving ? 'bg-gray-100' : 'bg-red-100'} w-full mb-4`}>Usuń fragment</Button>
        }
        <Button disabled={saving} className="border-none self-end" size='small' color='error' onClick={() => setDialogOpen(true)}>
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
