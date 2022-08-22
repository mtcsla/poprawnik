import { DoneAll } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, TextField } from '@mui/material';
import { ErrorMessage, Field, Formik } from 'formik';
import { cloneDeep } from 'lodash';
import { useRouter } from 'next/router';
import React from 'react';
import { useFormDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { ErrorMessageCallback } from './FieldEditor';
import StepEditor from './StepEditor';

export const URLtoQueryObject = (url: string): { [key: string]: string } => {
  const queryString = url.slice(url.indexOf('?') + 1, url.length);
  const query = queryString.split('&');
  const queryObj: { [key: string]: string } = {}

  query.forEach((value) => {
    const q = value as `${string}=${string}`;
    const [key, val] = q.split('=');

    queryObj[key] = val;
  })

  return queryObj;
}

type FormEditorLocation = [number | null, number | null, number | null]

const locationContext = React.createContext<
  { location: FormEditorLocation, setLocation: React.Dispatch<FormEditorLocation> }
>(
  {
    location: [null, null, null],
    setLocation: (location) => { }
  }
)
export const useFormEditorLocation = () => React.useContext(locationContext);


const FormEditor = () => {
  const { currentDescription, modifyCurrentDescription } = useFormDescription();
  const [selectedStep, setSelectedStep] = React.useState('-1');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [nameDialogOpen, setNameDialogOpen] = React.useState(false);
  const [location, setLocation] = React.useState<FormEditorLocation>([null, null, null]);
  const locationProviderValue = { location, setLocation }

  const router = useRouter();

  const newStep = (type: 'step' | 'list', name?: string) => {
    modifyCurrentDescription(['form_append_step', { subtitle: '', type, children: [], name: type === 'list' ? (name || '') : '' }]);
    setDialogOpen(false);
  }
  const selectStep = (step: string): void => {
    const newQuery = cloneDeep(router.query)
    newQuery['step'] = step;
    router.replace({ pathname: router.pathname, query: newQuery })
  }
  const currentDescriptionRef = React.useRef(currentDescription)
  React.useEffect(() => { currentDescriptionRef.current = currentDescription }, [currentDescription])

  React.useEffect(() => {
    const handler = (url: string) => {
      const query = URLtoQueryObject(url);

      if (currentDescriptionRef.current) {

        const step = parseInt(query['step'] as string ?? -1);
        const fragment = parseInt(query['fragment'] as string ?? -1);
        const field = parseInt(query['field'] as string ?? -1);


        if (step.toString() != selectedStep) {
          if (step < 0 || step >= currentDescriptionRef.current.length) {
            setSelectedStep('-1');
            const newQuery = cloneDeep(query);
            delete newQuery['step']
            router.replace({ pathname: router.pathname, query: newQuery })
          }
          if (step >= 0 && step < currentDescriptionRef.current.length)
            setSelectedStep(step.toString());
        }
        setLocation([
          step === -1 ? null : step,
          fragment === -1 ? null : fragment,
          field === -1 ? null : field
        ]);
      }
    };

    router.events.on('routeChangeComplete', handler);
    return () => router.events.off('routeChangeComplete', handler);
  }, [])

  return <>
    <Dialog open={dialogOpen}>
      <DialogTitle className='font-mono uppercase text-slate-500 text-sm'>Dodajesz nowy krok</DialogTitle>
      <DialogContent>
        <p className='text-base'>
          Wybierz rodzaj kroku.
        </p>
      </DialogContent>
      <DialogActions className='flex justify-between w-72'>
        <Button onClick={() => setDialogOpen(false)} color='error' className='border-none'>
          Anuluj
        </Button>
        <span className='flex'>
          <Button onClick={() => newStep('step')} className='border-none'>
            Krok
          </Button>
          <Button onClick={() => { setNameDialogOpen(true); setDialogOpen(false) }} className='border-none'>
            Lista
          </Button>
        </span>
      </DialogActions>
    </Dialog>
    <Dialog open={nameDialogOpen}>
      <DialogTitle className='font-mono uppercase text-slate-500 text-sm'>Dodajesz listę</DialogTitle>
      <Formik initialValues={{ name: '' }}
        onSubmit={(values) => { newStep('list', values.name); setNameDialogOpen(false) }}
        validateOnChange>
        {({ values, submitForm, errors }) => {
          return <> <DialogContent style={{ width: 300 }}>
            <p className='text-sm'>
              Dodaj nazwę listy.
            </p>
            <Field as={TextField} size='small' placeholder='np. lista' error={errors.name} name='name' className='w-full mt-2' validate={(value: any) => !value
              ? 'To pole jest wymagane.'
              : !value.match(/^[a-z_0-9]*$/)
                ? 'Dozwolone są tylko małe litery alfabetu łacińskiego, liczby oraz znak "_".'
                : null
            } />
            <ErrorMessage name='name'>{ErrorMessageCallback}</ErrorMessage>
          </DialogContent>
            <DialogActions>
              <Button onClick={() => submitForm()} className='border-none'>
                Dodaj
              </Button>
              <Button onClick={() => setNameDialogOpen(false)} color='error' className='border-none'>
                Anuluj
              </Button>
            </DialogActions>
          </>
        }}
      </Formik>
    </Dialog>

    <span className='flex justify-end'>
      <Button size='small' className='border-none' onClick={() => setDialogOpen(true)}>dodaj krok</Button>
    </span>
    {currentDescription.length ?
      <Tabs className='border rounded-lg mb-6' onChange={(e, value) => selectStep(value)} value={parseInt(selectedStep)}>
        {currentDescription.map((step, index) =>
          <Tab label={step.type === 'list' ? step.name : `KROK ${index + 1}`} value={index} />
        )}
      </Tabs>
      : <div className='mb-6 border rounded-lg w-full h-12 items-center flex justify-center' >
        <pre className='text-base'>
          brak kroków
        </pre>
      </div>
    }
    <locationContext.Provider value={locationProviderValue}>
      {
        location[0] != null && location[0] === parseInt(selectedStep)
          ? <StepEditor />
          : null
      }
    </locationContext.Provider>
    {
      selectedStep === '-1' ?
        <div className='p-10 rounded-lg border flex justify-center items-center'>
          <DoneAll className='mr-3 text-4xl -translate-y-1' fontSize='inherit' color='primary' />
          <p>Wybierz z listy powyżej lub dodaj krok, aby edytować.</p>
        </div>
        : null
    }
  </>
}
export default FormEditor;