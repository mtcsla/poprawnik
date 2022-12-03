import { Add, Delete, List, PersonOutline, Remove } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogContent, DialogTitle, Snackbar, TextField } from '@mui/material';
import { cloneDeep } from 'lodash';
import { useRouter } from 'next/router';
import React from 'react';
import BodyScrollLock from '../../providers/BodyScrollLock';
import { FormAction, FormDescription, useFormDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { useFormTemplateDescription } from '../../providers/FormDescriptionProvider/FormTemplateDescriptionProvider';
import { TemplateDescription } from '../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import EditorFragment from '../form/EditorFragment';
import Changes from './Changes';
import { useFormEditorLocation } from './FormEditor';
import FragmentEditor from './FragmentEditor';
export type StepEditorProps = {
  number: number
}
const StepEditor = () => {
  const { description, updateFirestoreDoc, currentDescription, modifyDescription, modifyCurrentDescription } = useFormDescription();
  const templateDescriptionObject = useFormTemplateDescription();

  const { location, setLocation } = useFormEditorLocation();
  const [step, fragment, field] = location;

  const [editing, setEditing] = React.useState<null | 'subtitle' | 'listMessage' | 'listItemName' | 'listMinMaxItems'>(null);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false);

  const subtitleTextArea = React.useRef<HTMLTextAreaElement>();

  const listMessageTextArea = React.useRef<HTMLTextAreaElement>();

  const listItemNameInput = React.useRef<{ value: string }>({ value: '' });
  const listMinMaxItemsInput = React.useRef<{ value: { min: null | number, max: null | number } }>({ value: { min: null, max: null } });
  const [listMinMaxItems, setListMinMaxItems] = React.useState<{ min: null | number, max: null | number }>({ min: null, max: null });

  const router = useRouter();

  const [verifying, setVerifying] = React.useState(false);
  React.useEffect(() => {
    if (router.isReady)
      setVerifying(router.query.verifying === 'true');
  }, [router.isReady])

  const save = (item: 'subtitle' | 'listMessage' | 'listItemName' | 'listMinMaxItems') => {
    setSaving(true);
    const last = currentDescription[step as number][item];
    const newDescription: FormDescription = cloneDeep(currentDescription);

    let ref: React.MutableRefObject<any>;
    let method: FormAction[0];
    switch (item) {
      case 'subtitle':
        method = 'step_set_subtitle';
        ref = subtitleTextArea;
        break;
      case 'listMessage':
        method = 'step_set_list_message';
        ref = listMessageTextArea;
        break;
      case 'listItemName':
        method = 'step_set_list_item_name';
        ref = listItemNameInput;
        break;
      case 'listMinMaxItems':
        method = 'step_set_list_min_max_items';
        ref = listMinMaxItemsInput;
        break;
      default:
        throw new Error('Invalid item');
    }
    newDescription[step as number][item] = (ref?.current?.value
      ??
      (item === 'listMinMaxItems' ? { min: null, max: null } : '')
    ) as never;


    modifyCurrentDescription?.([
      method, [step as number, ref?.current?.value as string ??
        (item === 'listMinMaxItems' ? { min: null, max: null } : '')
      ] as any,
    ]);

    updateFirestoreDoc(newDescription).
      then(
        () => {
          setSaving(false);
          setEditing(null);
        }).
      catch(
        () => {
          setError(true);
          modifyCurrentDescription?.([method, [step as number, last as any]] as any);
          setSaving(false);
          setEditing(null)
          setTimeout(() => setError(false), 5000)
        }
      )
  }
  const deleteStep = (newForm: FormDescription, newTemplate: TemplateDescription) => {
    setSaving(true);
    updateFirestoreDoc(newForm, newTemplate).then(() => {
      modifyCurrentDescription(['form_set_description', newForm]);
      templateDescriptionObject.setCurrentDescription(newTemplate);
      setSaving(false);
      router.back()
    }).catch(
      () => {
        setSaving(false);
        setError(true);
        setTimeout(() => setError(false), 5000)
      }
    );
  }
  const newFragment = () => {
    router.push({
      pathname: router.pathname,
      query: Object.assign(
        router.query,
        {
          fragment: currentDescription[step as number].children.length,
          new: 1
        }
      )
    })

  }


  return currentDescription[step as number] ? <>
    <Snackbar open={error} color="error" message="Zapisywanie nie powiodło się."></Snackbar>

    <Dialog open={deleteDialogOpen}>
      <DialogTitle>
        <pre className='text-sm'>Usuwasz krok</pre>
      </DialogTitle>
      <DialogContent style={{ maxWidth: 800 }} className="text-sm">
        Krok zostanie usunięty. Wszelkie odwołania do pól zawartych w kroku w warunkach zostaną zamienione na wartości obojętne, a obliczenia zawierające wartości pól zawartych w kroku zostaną usunięte.
        <Changes
          deletionType="step"
          deletePath={[step as number, null, null]}
          requiredChange={false}
          message="Zmiany zostaną zapisane, ta operacja jest nieodwracalna."
          onCancel={() => setDeleteDialogOpen(false)}
          onSubmit={(newForm, newTemplate) => deleteStep(newForm, newTemplate)}

          saving={saving}
        />
      </DialogContent>
    </Dialog>

    {currentDescription[step as number].type === 'list'
      ? <pre className='text-sm justify-end flex items-center'><List className='mr-2' color='primary' /> Ten krok jest listą</pre>
      : null}
    <span className='flex items-center justify-between'>
      <pre className='text-xs mt-2'>Krótki opis</pre>
      {editing !== 'subtitle' ?
        <Button size='small' disabled={!!editing || verifying} className='border-none mt-4 px-0' onClick={() => setEditing('subtitle')}>edytuj</Button>
        : <span className='flex items-center'>
          <Button size='small' className='border-none mt-4 px-0 mr-4' disabled={saving} color='error' onClick={() => setEditing(null)}>anuluj</Button>
          <LoadingButton size='small' loading={saving} onClick={() => save('subtitle')} className='border-none mt-4 px-0'>zapisz</LoadingButton>
        </span>}
    </span>
    <p className='text-sm'>Jedno bądź dwa zdania w skrócie opisujące krok.</p>
    {editing === 'subtitle'
      ? <div className='w-full flex flex-col'>
        <textarea maxLength={150} readOnly={saving} defaultValue={currentDescription[step as number].subtitle} ref={subtitleTextArea as any} className='p-4 bg-slate-50 rounded mt-4' />
      </div>
      : <div className='text-sm p-4 w-full bg-slate-50 rounded mt-4' style={{ minHeight: 70 }}>{currentDescription[step as number].subtitle}</div>
    }
    {currentDescription[step as number].type === 'list' ? <>
      <span className='flex justify-between items-center'>
        <pre className='text-xs mt-6'>Nazwa wartości</pre>
        {editing !== 'listItemName' ?
          <Button size='small' disabled={!!editing || verifying} className='border-none mt-4 px-0' onClick={() => setEditing('listItemName')}>edytuj</Button>
          : <span className='flex items-center'>
            <Button size='small' className='border-none mt-4 px-0 mr-4' disabled={saving} color='error' onClick={() => setEditing(null)}>anuluj</Button>
            <LoadingButton size='small' loading={saving} onClick={() => save('listItemName')} className='border-none mt-4 px-0'>zapisz</LoadingButton>
          </span>}
      </span>
      <p className='text-sm mt-2'>Jeżeli np. każda z wartości listy reprezentuje jednego uczestnika postępowania, napisz "uczestnik postępowania".</p>
      <span className='flex items-center justify-between'>
        <span className='flex items-center mt-4'>
          <PersonOutline className='mr-2 text-lg -translate-y-0.5' color={'info'} /> <p className='text-sm'>Nazwa wartości</p></span> <div className='flex-1' />
        {
          editing === 'listItemName'
            ? <span className='flex flex-col items-end'>
              <TextField
                defaultValue={currentDescription[step as number].listItemName}
                onChange={e => listItemNameInput.current = { value: e.target.value }}
                size='small'
                style={{ maxWidth: 200 }}
              />

            </span>
            : currentDescription[step as number].listItemName
              ? <pre className='text-xs'>{currentDescription[step as number].listItemName}</pre>
              : <pre className='text-xs'>brak</pre>
        }

      </span>

      <span className='flex justify-between items-center'>
        <pre className='text-xs mt-6'>Minimalna i maksymalna liczba wartości</pre>
        {editing !== 'listMinMaxItems' ?
          <Button size='small' disabled={!!editing || verifying} className='border-none mt-4 px-0' onClick={() => {
            setEditing('listMinMaxItems');
            setListMinMaxItems(currentDescription[step as number].listMinMaxItems ?? { min: null, max: null })
          }}>edytuj</Button>
          : <span className='flex items-center'>
            <Button size='small' className='border-none mt-4 px-0 mr-4' disabled={saving} color='error' onClick={() => setEditing(null)}>anuluj</Button>
            <LoadingButton size='small' disabled={
              listMinMaxItems.max === null || listMinMaxItems.min === null
              || (listMinMaxItems.max as number) < (listMinMaxItems.min as number)
            } loading={saving} onClick={() => save('listMinMaxItems')} className='border-none mt-4 px-0'>zapisz</LoadingButton>
          </span>}
      </span>
      <p className='text-sm mt-2'>Jeżeli zostawisz pole minimalnej liczby wartości puste, lista będzie mogła mieć 0 wartości, czyli nie będzie wymagane jej wypełnienie.</p>
      <span className='flex items-center justify-between'>
        <span className='flex items-center mt-4'>
          <Remove className='mr-2 text-lg -translate-y-0.5' color={'info'} /> <p className='text-sm'>Minimalna liczba wartości</p></span> <div className='flex-1' />
        {
          editing === 'listMinMaxItems'
            ? <span className='flex flex-col items-end'>
              <TextField
                defaultValue={currentDescription[step as number]?.listMinMaxItems?.min ?? ''}
                onChange={e => {
                  listMinMaxItemsInput.current = {
                    value: {
                      min: parseInt(e.target.value),
                      max: listMinMaxItemsInput.current?.value?.max
                    }
                  };
                  setListMinMaxItems(listMinMaxItemsInput.current.value);
                }}
                size='small'
                style={{ maxWidth: 200 }}
              />

            </span>
            : currentDescription[step as number]?.listMinMaxItems?.min != null
              ? <pre className='text-xs'>{currentDescription[step as number]?.listMinMaxItems?.min}</pre>
              : <pre className='text-xs'>brak</pre>
        }

      </span>
      <span className='flex items-center justify-between'>
        <span className='flex items-center mt-4'>
          <Add className='mr-2 text-lg -translate-y-0.5' color={'info'} /> <p className='text-sm'>Maksymalna liczba wartości</p></span> <div className='flex-1' />
        {
          editing === 'listMinMaxItems'
            ? <span className='flex flex-col items-end'>
              <TextField
                defaultValue={currentDescription[step as number]?.listMinMaxItems?.max ?? ''}
                onChange={e => {
                  listMinMaxItemsInput.current = {
                    value: {
                      min: listMinMaxItemsInput.current?.value?.min,
                      max: parseInt(e.target.value),
                    }
                  };
                  setListMinMaxItems(listMinMaxItemsInput.current.value);
                }}
                size='small'
                style={{ maxWidth: 200 }}
              />

            </span>
            : currentDescription[step as number]?.listMinMaxItems?.max != null
              ? <pre className='text-xs'>{currentDescription[step as number]?.listMinMaxItems?.max}</pre>
              : <pre className='text-xs'>brak</pre>
        }

      </span>
      <span className='flex items-center justify-between'>
        <pre className='text-xs mt-4'>Tekst wskazówki</pre>
        {editing !== 'listMessage' ?
          <Button size='small' disabled={!!editing || verifying} className='border-none mt-4 px-0' onClick={() => setEditing('listMessage')}>edytuj</Button>
          : <span className='flex items-center'>
            <Button size='small' className='border-none mt-4 px-0 mr-4' disabled={saving} color='error' onClick={() => setEditing(null)}>anuluj</Button>
            <LoadingButton size='small' loading={saving} onClick={() => save('listMessage')} className='border-none mt-4 px-0'>zapisz</LoadingButton>
          </span>}
      </span>
      <p className='text-sm'>Wskazówka dotycząca wypełniania listy, np. <i>Dodaj do listy wszystkich spadkobierców testamentowych</i>.</p>
      {editing === 'listMessage'
        ? <div className='w-full flex flex-col'>
          <textarea maxLength={150} readOnly={saving} defaultValue={currentDescription[step as number].listMessage} ref={listMessageTextArea as any} className='p-4 bg-slate-50 rounded mt-4' />
        </div>
        : <div className='text-sm p-4 w-full bg-slate-50 rounded mt-4' style={{ minHeight: 70 }}>{currentDescription[step as number].listMessage}</div>
      }

    </> : null
    }

    <div className='flex mt-6 items-center justify-between mb-2'>
      <pre className='text-xs mt-2'>Fragmenty</pre>

      <Button size='small' disabled={verifying} className='border-none px-0' onClick={() => { setEditing(null); newFragment(); }}>Dodaj fragment</Button>
    </div>
    {currentDescription[step as number].children.length ?
      currentDescription[step as number].children.map((fragment, index) =>

        <Button onClick={() => {
          setEditing(null);
          router.push({ pathname: router.pathname, query: Object.assign(router.query, { fragment: index.toString() }) })
        }} className='w-full normal-case text-left rounded mb-8  hover:bg-blue-200  cursor-pointer p-4 '>
          <div className='text-black w-full pointer-events-none'>
            <EditorFragment fragment={fragment} editor={false} />
          </div>
        </Button>)
      : <div className='rounded bg-slate-50 h-16 mb-8 mt-2 flex items-center justify-center p-4'>
        <pre>Brak fragmentów</pre>
      </div>
    }


    {verifying
      ? null
      : <LoadingButton disabled={!!editing} loading={saving} color='error' className={`mt-2 p-4 bg-red-100 border-none`} onClick={() => setDeleteDialogOpen(true)}>
        <Delete className='mr-2' />Usuń krok
      </LoadingButton>
    }
    {typeof fragment === 'number' ? <BodyScrollLock><FragmentEditor /></BodyScrollLock> : null}
  </> : null;
}

export default StepEditor;