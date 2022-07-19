import { List } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Button, Snackbar } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';
import { useFormDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import EditorFragment from '../form/EditorFragment';
import { useFormEditorLocation } from './FormEditor';
import FragmentEditor from './FragmentEditor';
export type StepEditorProps = {
  number: number
}
const StepEditor = () => {
  const { description, currentDescription, modifyDescription, modifyCurrentDescription } = useFormDescription();

  const { location, setLocation } = useFormEditorLocation();
  const [step, fragment, field] = location;

  const [editing, setEditing] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>()
  const router = useRouter();

  const save = () => {
    setSaving(true);
    const lastSubtitle = description[step as number].subtitle;
    modifyCurrentDescription?.([
      'step_set_subtitle', [step as number, textareaRef?.current?.value as string ?? ''],
      {
        then:
          () => {
            setSaving(false);
            setEditing(false);
          },
        catch:
          () => {
            setError(true);
            modifyDescription?.(['step_set_subtitle', [step as number, lastSubtitle]])

            setSaving(false);
            setEditing(false)
            setTimeout(() => setError(false), 5000)
          }
      }
    ])
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

    {currentDescription[step as number].type === 'list'
      ? <pre className='text-sm justify-end flex items-center'><List className='mr-2' color='primary' /> Ten krok jest listą</pre>
      : null}
    <span className='flex items-center justify-between'>
      <pre className='text-xs mt-2'>Krótki opis</pre>
      {!editing ?
        <Button size='small' className='border-none mt-4' onClick={() => setEditing(true)}>edytuj</Button>
        : <span className='flex items-center'>
          <Button size='small' className='border-none mt-4' disabled={saving} color='error' onClick={() => setEditing(false)}>anuluj</Button>
          <LoadingButton size='small' loading={saving} onClick={save} className='border-none mt-4'>zapisz</LoadingButton>
        </span>}


    </span>
    <p className='text-sm'>Jedno bądź dwa zdania w skrócie opisujące krok.</p>
    {editing
      ? <div className='w-full flex flex-col'>
        <textarea maxLength={150} readOnly={saving} defaultValue={currentDescription[step as number].subtitle} ref={textareaRef as any} className='p-4 border rounded mt-4' />
      </div>
      : <div className='text-sm p-4 w-full border rounded mt-4' style={{ minHeight: 70 }}>{currentDescription[step as number].subtitle}</div>
    }

    <div className='flex mt-6 items-center justify-between'>
      <pre className='text-xs mt-2'>Fragmenty</pre>

      <Button size='small' className='border-none' onClick={newFragment}>Dodaj fragment</Button>
    </div>
    {currentDescription[step as number].children.length ?
      currentDescription[step as number].children.map((fragment, index) =>

        <div onClick={() => {
          router.push({ pathname: router.pathname, query: Object.assign(router.query, { fragment: index.toString() }) })
        }} className='w-full hover:border-blue-500 hover:border hover:bg-blue-50 rounded-lg cursor-pointer p-4 '>
          <div className='w-full pointer-events-none'>
            <EditorFragment fragment={fragment} editor={false} />
          </div>
        </div>)
      : <div className='rounded border h-16 mt-2 flex items-center justify-center p-4'>
        <pre>Brak fragmentów</pre>
      </div>
    }


    <Button color='error' className='mt-6'>Usuń krok</Button>
    {typeof fragment === 'number' ? <FragmentEditor /> : null}
  </> : null;
}

export default StepEditor;