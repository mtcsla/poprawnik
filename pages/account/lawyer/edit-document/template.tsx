import { ArrowBack, ArrowDropDown, Bookmark, CalendarToday, Close, Edit, FormatAlignJustify, FormatListNumbered, List, Numbers, TextFields } from '@mui/icons-material';
import { Button, Chip, Dialog, DialogContent, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';

import { doc, getDoc } from '@firebase/firestore';
import Link from 'next/link';
import React from 'react';
import { firestore } from '../../../../buildtime-deps/firebase';
import { ConditionCalculationDisplay } from '../../../../components/form-edit/condition-calculation-editor/ConditionCalculationDisplay';
import TemplateEditor from '../../../../components/template-edit/TemplateEditor';
import BodyScrollLock from '../../../../providers/BodyScrollLock';
import { FieldDescription, FormDescription, StepDescription } from '../../../../providers/FormDescriptionProvider/FormDescriptionProvider';
import TemplateDescriptionProvider, { TextFormattingElement } from '../../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { FormValues, NestedFormValue, RootFormValue } from '../../../forms/[id]/form';

export const listContext = React.createContext<string>('');
export const existsContext = React.createContext<string[]>([]);
export const textFormattingContext = React.createContext<{
  textFormattingType: 'effect' | 'element',
  effect: TextFormattingElement['effect'];
  element: TextFormattingElement['element'];
  align: TextFormattingElement['align'];
}>({
  textFormattingType: 'effect',
  effect: 'normal',
  element: 'p',
  align: 'left',
});

const EditDocumentTemplate = () => {
  const router = useRouter();
  const id = React.useMemo(() => {
    if (!router.isReady)
      return null;
    return router.query.id
  }, [router.isReady])
  const [values, setValues] = React.useState<FormValues<RootFormValue>>({});

  const [loading, setLoading] = React.useState<boolean>(true);

  const [formDescription, setFormDescription] = React.useState<FormDescription>([]);
  const [templateDescription, setTemplateDescription] = React.useState<any>([]);

  const [valuesExpanded, setValuesExpanded] = React.useState<boolean>(false);
  const [editorOpen, setEditorOpen] = React.useState<boolean>(false);

  const [url, setUrl] = React.useState<string>('');

  React.useEffect(() => {
  }, []);

  React.useEffect(() => {
    if (!id) return;
    const newValues = JSON.parse(sessionStorage.getItem(`--${id}-data`) ?? '{}')
    setValues(newValues);

    const newUrl = `/api/template/generate.pdf?perm=owner&id=${id}&data=${encodeURIComponent(JSON.stringify(newValues))}`;
    setUrl(newUrl);
  }, [id])
  React.useEffect(() => {
    if (!router.isReady)
      return;
    if (!id) {
      router.replace('/')
      return;
    }

    getDoc(doc(firestore, `/forms/${id}`)).then(doc => {
      if (!doc.exists) {
        router.replace('/account/lawyer')
        return;
      }
      if (doc.data()?.awaitingVerification && router.query.verifying !== 'true')
        router.push('/account/lawyer/edit-document?id=' + router.query['id']);

      setFormDescription(doc.data()?.formData ?? []);
      setTemplateDescription(doc.data()?.templateData ?? []);
      setLoading(false);
    }).catch((err) => {

    })
  }, [id])

  return <>
    <Button size='small' disabled={!id} onClick={() => router.push(`/account/lawyer/edit-document?id=${id}`)} className='bg-blue-100 rounded mb-12 border-none w-full flex items-center justify-between'>
      <ArrowBack />
      Wróć do pisma
    </Button>
    {formDescription.length && id
      ? <listContext.Provider value={''}>
        <existsContext.Provider value={[]}>
          <textFormattingContext.Provider value={{ textFormattingType: 'effect', effect: 'normal', element: 'p', align: 'left' }}>
            <TemplateDescriptionProvider id={id as string} form={formDescription} initTemplate={templateDescription}>
              <div className="w-full flex-col flex pb-8 mb-2">

                <h1 className="inline-flex gap-2 mb-1"><Bookmark color='primary' /> Edytujesz wzór pisma</h1>
                <p>Wypełnij formularz przykładowymi danymi, aby szybko generować podgląd.</p>

                {Object.keys(values).length === 0 || formDescription.length === 0
                  ? <div className='border sm:p-8 p-4 bg-slate-50 mt-8 rounded-lg flex justify-center items-center'>
                    <pre>Brak przykładowych danych</pre>
                  </div>
                  : <>
                    <span className='flex mt-8 items-center justify-between'>
                      <pre>dane</pre>
                      <Button className='border-none' onClick={() => setValuesExpanded(!valuesExpanded)} size='small'>
                        <ArrowDropDown className={`${valuesExpanded ? 'rotate-180' : ''} mr-2`} />
                        {valuesExpanded ? 'zwiń' : 'rozwiń'} dane
                      </Button>
                    </span>
                    <div
                      onClick={() => { if (!valuesExpanded) setValuesExpanded(true) }}
                      className={`w-full rounded-lg relative h-auto border ${!valuesExpanded ? 'hover:border-blue-500 hover:bg-blue-100 cursor-pointer' : ''}`} style={!valuesExpanded ? { maxHeight: 200, overflowY: 'hidden' } : {}}>
                      <div className='absolute right-0 left-0 bottom-0 top-0 rounded-lg' style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 75%)',
                        display: valuesExpanded ? 'none' : 'block'
                      }} />
                      <div className='flex flex-col p-4 sm:p-8  '>
                        <ValuesDisplay values={values} description={formDescription} />
                      </div>
                    </div>
                  </>
                }
                <Link href={`/forms/${id}/form?testing=true`}>
                  <Button className='w-full mt-8 p-4 bg-blue-500 text-white hover:bg-blue-400'> {Object.keys(values).length ? 'Edytuj dane' : 'Wypełnij formularz'} <Edit className='ml-2' /></Button>
                </Link>
                <Dialog className='w-screen h-screen m-0' open={!loading && editorOpen}>
                  <DialogContent sx={{ width: '98vw' }} className='relative h-screen'>
                    <BodyScrollLock>
                      <Button style={{ top: '2.5rem', right: '1.5vw' }} className='fixed  border-none' onClick={() => setEditorOpen(false)}><Close /></Button>
                      <TemplateEditor />
                    </BodyScrollLock>
                  </DialogContent>
                </Dialog>
                {loading
                  ? null
                  :
                  <>
                    <pre className='mt-8 mb-4'>Wzór pisma</pre>
                    <div onClick={() => setEditorOpen(true)} className='w-full hover:border-blue-500 cursor-pointer overflow-x-hidden h-96 border rounded-lg  relative overflow-y-hidden'>
                      <div className='absolute right-0 left-0 bottom-0 top-0 rounded-lg' style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 75%)',
                        zIndex: 200,
                      }} />
                      <div className='absolute top-0 left-0 right-0 bottom-0'>
                        <div className='relative top-0 bottom-0 left-0 right-0' style={{ maxWidth: '100vw' }}>
                          {!editorOpen
                            ?
                            <TemplateEditor display />
                            : null
                          }
                        </div>
                      </div>
                    </div>
                  </>
                }
                <Link href={url} passHref>
                  <a className='w-full' target='_blank'>
                    <Button disabled={!Object.keys(values).length}
                      className={`p-4 mt-8 bg-blue-500 w-full text-white hover:bg-blue-400 ${!Object.keys(values).length ? 'bg-gray-300 hover:bg-gray-300' : ''}`}>
                      Podgląd pisma
                      <FormatAlignJustify className='ml-2' />
                    </Button>
                  </a>
                </Link>
              </div>
            </TemplateDescriptionProvider>

          </textFormattingContext.Provider>
        </existsContext.Provider>
      </listContext.Provider> : null
    }
  </>;
}

const ValuesDisplay = ({ values, description, nested }: { values: FormValues<RootFormValue> | FormValues<NestedFormValue>; description: FormDescription | StepDescription; nested?: boolean }) => {
  return nested
    ? <div className='inline-flex flex-wrap gap-3'>{(description as StepDescription).children.map((fragment) =>
      fragment.children.map((field) =>
        <VariableNameAndValue field={field} value={values[field.name] as NestedFormValue} inList />
      )
    )}</div>
    :
    <>{
      (description as FormDescription).map(
        (step, index) => step.type === 'list' ? <div className='flex flex-col mb-4'>
          <span className='flex items-center justify-between flex-wrap'>
            <pre className='text-base '>Krok {index + 1}</pre>
            <Chip size='small' color='warning' label={step.name} />
          </span>
          <p className='text-sm mt-2 mb-4'>{step.subtitle}</p>
          <pre className='text-sm justify-end flex items-center'><List className='mr-2' color='primary' /> Ten krok jest listą</pre>
          {(values[step.name] as FormValues<NestedFormValue>[]).map(
            (value, index) => <div className='flex mt-4 flex-col'>
              <pre className='mb-2 text-sm'>{step.listItemName || 'Wartość'} {index + 1}</pre>
              <ValuesDisplay nested values={value as FormValues<NestedFormValue>} description={step} /></div>
          )}

        </div> : <div className='flex flex-col mb-4'>
          <pre className='text-base '>Krok {index + 1}</pre>
          <p className='text-sm mt-2 mb-4'>{step.subtitle}</p>
          <span className='w-full inline-flex flex-wrap gap-3'>
            {step.children.map(
              fragment => fragment.children.map(
                field => <VariableNameAndValue field={field} value={values[field.name] as NestedFormValue} />
              )
            )}
          </span>
        </div>
      )}</>

}

const VariableInfo = ({ field, value, inList }: { field: FieldDescription, value: NestedFormValue, inList?: boolean }) => {
  return <div style={{ minWidth: 200 }} className='bg-white flex flex-col p-4 border rounded-lg'>
    <Chip label={<>
      {field.type === 'date'
        ? <CalendarToday className='mr-2' />
        : field.type === 'select'
          ? <FormatListNumbered className='mr-2' />
          : field.valueType === 'text'
            ? <TextFields className='mr-2' />
            : <Numbers className='mr-2' />
      }
      {field.name}
    </>} className='w-full' size='small' color={inList ? 'error' : 'primary'} />
    <pre className='text-sm items-center mt-2 justify-between flex'>
      {field.type === 'date'
        ? <><CalendarToday className='mr-2' /> data </>
        : field.type === 'select'
          ? <><FormatListNumbered className='mr-2' /> wybór </>
          : field.valueType === 'text'
            ? <><TextFields className='mr-2' /> tekst</>
            : <><Numbers className='mr-2' /> liczba</>
      }
    </pre>
    <p className='my-1 text-sm'>{field.description}</p>
    <pre className='mb-1'>wartość:</pre>
    {value == null || value == ''
      ? <pre className='p-1  text-sm text-center rounded bg-slate-100'>brak</pre>
      : <p className='p-1 text-sm text-center rounded bg-slate-100'>{field.type === 'date' ? new Date(value as string)?.toLocaleDateString('pl-PL') : value}</p>
    }
    <pre className='my-1'>warunek:</pre>
    {field.condition.components.length === 0
      ? <pre className='rounded-lg text-center p-3 border'>brak</pre>
      : <ConditionCalculationDisplay sequence={field.condition} first type='condition' />
    }

    <pre className='my-1'>wymagane:</pre>
    <pre className='rounded-lg text-center p-3 border'>{
      !field.required
        ? 'nie'
        : field.condition.components.length > 0
          ? 'warunkowo'
          : 'tak'

    }</pre>

  </div>
}
const VariableNameAndValue = ({ field, value, inList }: { field: FieldDescription, value: NestedFormValue, inList?: boolean }) =>
  <Tooltip title={<VariableInfo {...{ field, value, inList }} />}>
    <div style={{ minWidth: 200 }} className='flex-1  p-3 rounded  inline-flex gap-3 flex-wrap border  items-center'>
      <Chip label={<>
        {field.type === 'date'
          ? <CalendarToday className='mr-2' />
          : field.type === 'select'
            ? <FormatListNumbered className='mr-2' />
            : field.valueType === 'text'
              ? <TextFields className='mr-2' />
              : <Numbers className='mr-2' />
        }
        {field.name}
      </>} size='small' color={inList ? 'error' : 'primary'} />
      <div className='self-stretch flex-1 bg-slate-200 rounded-lg' />
      {
        (value == null || value == '') ? <pre style={{ minWidth: 100 }} className='text-base p-1  text-center flex-1  rounded bg-slate-100'>Brak</pre>
          :
          <pre style={{ minWidth: 100 }} className='normal-case font-normal text-base truncate self-start flex-1  p-1 rounded bg-slate-100 text-center text-slate-600'>
            {
              field.type === 'date' ? new Date(value as any)?.toLocaleDateString('pl-PL') : value
            }
          </pre>
      }
    </div>
  </Tooltip>





export default EditDocumentTemplate;
