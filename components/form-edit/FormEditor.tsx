import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from '@mui/material';
import { cloneDeep } from 'lodash';
import { useRouter } from 'next/router';
import React from 'react';
import { useFormDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
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
  const [location, setLocation] = React.useState<FormEditorLocation>([null, null, null]);
  const locationProviderValue = { location, setLocation }

  const router = useRouter();

  const newStep = (type: 'step' | 'list') => {
    modifyCurrentDescription(['form_append_step', { subtitle: '', type, children: [] }]);
    setDialogOpen(false);
  }
  const selectStep = (step: string): void => {
    const newQuery = cloneDeep(router.query)
    newQuery['step'] = step;
    router.push({ pathname: router.pathname, query: newQuery })
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
          <Button onClick={() => newStep('list')} className='border-none'>
            Lista
          </Button>
        </span>
      </DialogActions>
    </Dialog>

    <span className='flex justify-end'>
      <Button size='small' className='border-none' onClick={() => setDialogOpen(true)}>dodaj krok</Button>
    </span>
    {currentDescription.length ?
      <Tabs className='border rounded-lg mb-6' onChange={(e, value) => selectStep(value)} value={parseInt(selectedStep)}>
        {currentDescription.map((step, index) =>
          <Tab label={`KROK ${index + 1}`} value={index} />
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
        location[0] != null
          ? <StepEditor />
          : null
      }
    </locationContext.Provider>
  </>
}
export default FormEditor;