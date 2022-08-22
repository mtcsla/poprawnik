import { doc, getDoc } from '@firebase/firestore';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { Button, CircularProgress, LinearProgress } from '@mui/material';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import { firestore } from '../../../buildtime-deps/firebase';
import UserStep, { UserStepProps } from '../../../components/form/Step';
import LogoHeader from '../../../components/LogoHeader';
import { useAuth } from '../../../providers/AuthProvider';
import BodyScrollLock from "../../../providers/BodyScrollLock";
import { FormDescription, StepDescription } from '../../../providers/FormDescriptionProvider/FormDescriptionProvider';

export type FormikContextValue = {
  values: { [key: string]: string | Date | number | { [key: string]: string | Date | number }[] }
  errors: { [key: string]: string | null }
  touched: { [key: string]: boolean }
  setFieldValue: (name: string, value: any) => void,
  setFieldError: (name: string, value: string | null) => void,
  setFieldTouched: (name: string, value: boolean) => void,
}
const formikContext = React.createContext<FormikContextValue>({
  values: {},
  errors: {},
  touched: {},
  setFieldError: (name, value) => { },
  setFieldValue: (name, value) => { },
  setFieldTouched: (name, value) => { },
})
export const useFormValue = () => React.useContext(formikContext);

const FormDisplay = () => {
  const { userProfile, user } = useAuth();
  const router = useRouter();

  const [test, setTest] = React.useState<boolean>(false);
  const [description, setDescription] = React.useState<FormDescription | null>(null)
  const [formDoc, setFormDoc] = React.useState<any>(null);

  const [data, setData] = React.useState<any>(null)
  const [step, setStep] = React.useState<number>(0);


  React.useEffect(() => {
    if (!router.isReady)
      return;
    (async () => {
      const isPublished = await (await getDoc(doc(firestore, `published-forms/${router.query.id as string}`))).data()

      if (userProfile?.roles?.includes('admin') || userProfile?.roles?.includes('lawyer') || isPublished) {
        const formDoc = (isPublished ? isPublished :
          await (await getDoc(doc(firestore, `forms/${router.query.id as string}`))).data())
        setFormDoc(formDoc);
        setDescription(formDoc?.formData as FormDescription);
      }
      else {
        router.replace(`/forms/${router.query.id as string}`)
      }
    })();
  }, [router.isReady]);
  React.useEffect(() => {
    if (router.isReady && description && !data) {
      const savedDataString = sessionStorage.getItem(`data-${router.query.id as string}`);

      const newData = savedDataString ? JSON.parse(savedDataString) : stepsToFormData(description);

      setData(newData);
      setStep(newData.step ?? 0);
    }
  }, [router.isReady, description])

  return <BodyScrollLock>
    <div
      style={{/* background: 'linear-gradient(161deg, rgba(22,25,38,1) 0%, rgba(3,3,122,1) 83%, rgba(6,75,149,1) 100%)',*/ zIndex: 1250 }}
      className="w-screen flex justify-center bg-white overflow-y-auto pb-8  h-screen top-0 left-0 right-0 bottom-0 fixed">
      <div style={{ maxWidth: 900 }} className='flex-1 h-full bg-white flex flex-col p-8 items-center'>
        <div className='flex w-full flex-col'>
          <div className='flex mb-2 flex-wrap w-full items-center'>
            <div className='-ml-5'>
              <LogoHeader border={false} social={false} />
            </div>
            <LinearProgress className='rounded-lg w-full flex-1'
              variant={!description || !data || !formDoc ? 'indeterminate' : 'determinate'}
              style={{ minWidth: 280, height: 30 }}
              value={step / (description?.length ?? 1) * 100} />
          </div>
          {!description || !data || !formDoc
            ? <></>
            : <>
              <span className='inline-flex items-start justify-between gap-4 flex-wrap'>
                <span className='text-sm flex-1 text-left whitespace-normal'>
                  <pre className='font-bold inline'>Krok {step + 1} z {description.length}{description[step].subtitle ? ':' : ''}</pre>
                  <p className='inline ml-1 font-normal normal-case text-black'>{description[step].subtitle ? description[step].subtitle : null}</p>
                </span>

                <pre className='text-sm flex-1 text-right whitespace-normal'><b>{formDoc?.title}</b></pre>
              </span>
              <Button disabled={step === 0} className='mb-3 border-none self-start p-0 mt-2' size='small' color='error'> Poprzedni krok<ArrowBack className='ml-2' /></Button>
            </>
          }
        </div>
        {!description || !data || !formDoc
          ? <> <span className='h-full items-center justify-center inline-flex gap-6'>
            <CircularProgress size={50} />
            <pre className='whitespace-normal text-right font-bold'>pobieramy twój formularz</pre>
          </span>
            <Button disabled className='w-full mt-auto'>dalej <ArrowForward className='ml-2' /></Button>
          </>
          : <div className='w-full flex flex-col h-full mt-8'>
            <Formik onSubmit={() => { }} initialValues={data.formData}>
              {({ values, errors, touched, setFieldValue, setFieldError, setFieldTouched }) => {
                return <formikContext.Provider value={{ values, errors, touched, setFieldError, setFieldTouched, setFieldValue } as FormikContextValue}>
                  <UserStep {...{ step: description[step] } as UserStepProps} />
                  <div className='mb-8 mt-auto' />
                  <Button className='w-full p-3  bg-blue-500 text-white hover:bg-blue-400'>dalej <ArrowForward className='ml-2' /></Button>
                  <p className='text-sm mt-1 pb-8 self-end'>Trustree © 2021-2022</p>
                </formikContext.Provider>
              }}
            </Formik>
          </div>
        }
      </div>
    </div>
  </BodyScrollLock>;
}

export default FormDisplay;

export type FormValues = { [key: string]: Date | number | string | null | FormValues[] }

const stepToInitData = (step: StepDescription) => {
  const stepVars: FormValues = {}

  step.children.forEach(fragment =>
    fragment.children.forEach(field => stepVars[field.name] = field.valueType === 'date' ? null : '')
  )

  return stepVars;
}

const stepsToFormData = (steps: FormDescription) => {
  let formData: FormValues = {};

  steps.forEach(step => {
    if (step.type === 'list')
      formData[step.name] = [] as FormValues[]
    else
      formData = Object.assign(formData, stepToInitData(step))
  })

  return { step: 0, formData };
}
