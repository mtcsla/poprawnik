import styled from '@emotion/styled';
import { collection, doc, getDoc } from '@firebase/firestore';
import { ArrowForward } from '@mui/icons-material';
import { Alert, Button, CircularProgress, Dialog, DialogContent, DialogTitle, LinearProgress, Snackbar } from '@mui/material';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import { firestore } from '../../../buildtime-deps/firebase';
import UserStep from '../../../components/form/Step';
import LogoHeader from '../../../components/LogoHeader';
import { Validators } from '../../../components/utility/ValidatorFactories';
import { useAuth } from '../../../providers/AuthProvider';
import BodyScrollLock from "../../../providers/BodyScrollLock";
import { FormDescription, StepDescription } from '../../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { IFormData } from '../../account/lawyer/index';

export type FormikContextValue = {
  values: { [key: string]: any };
  touched: { [key: string]: any };
  errors: { [key: string]: any };
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  setFieldTouched: (field: string, value: any, shouldValidate?: boolean) => void;
  setFieldError: (field: string, value: any) => void;
}

const formikValue = {
  values: {},
  touched: {},
  errors: {},
  setFieldValue: () => { },
  setFieldTouched: () => { },
  setFieldError: () => { }
}

const formikContext = React.createContext<FormikContextValue>(formikValue);
export const useFormValue = () => React.useContext(formikContext);

const Body = styled.div`
  @media (min-width: 800px) {
    max-width: 800px;
  }
  @media (min-width: 1700px) {
    max-width: 1000px;
  }
`

const LinearProgressAdapitve = styled(LinearProgress)`
  margin-top: -1rem;
  @media (max-width: 720px) {
    min-width: 100%;
    margin-top: 0 !important;
  }
`
const SizedDialogContent = styled(DialogContent)`
  @media (min-width: 800px) {
    width: 70vw;
    max-width: 800px;
  }
  @media (max-width: 799px) {
    width: 98vw;
  }
`

export type RootFormValue = NestedFormValue | FormValues<NestedFormValue>[]
export type NestedFormValue = string | number | Date | null;

export type FormValues<Type> = {
  [key: string]: Type
}

const FormDisplay = () => {
  const router = useRouter();
  const { userProfile } = useAuth();

  //Initialization logic
  const [description, setDescription] = React.useState<FormDescription>([]);
  const [data, setData] = React.useState<FormValues<RootFormValue>>({});
  const [err404, setErr404] = React.useState(false);

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!router.isReady)
      return;
    if (loading) {
      const formId = router.query.id as string;

      getDoc(doc(collection(firestore, 'forms'), formId)).then((form) => {
        if (!form.exists()) {
          setErr404(true);
          setLoading(false);
          return;
        };

        getDoc(doc(collection(firestore, 'published-forms'), formId)).then((published) => {
          if (!published.exists())
            if (!userProfile?.roles.includes('admin') && !userProfile?.roles.includes('lawyer')) {
              setErr404(true);
              setLoading(false);
            }

          const formDocData = form.data() as IFormData;
          const formDescription = formDocData.formData as FormDescription;

          const dataRetrievalFunction = testing ? sessionStorage : localStorage;
          const retrievedData = dataRetrievalFunction.getItem(`--${formId}-data`);

          setData(
            retrievedData
              ? JSON.parse(retrievedData)
              : descriptionToInitialValues(formDescription)
          );
          setDescription(formDescription);
          setLoading(false);
        })
      });

    }
  }, [router.isReady])


  React.useEffect(() => {
    if (!router.isReady || !(description.length) || JSON.stringify(data) === '{}')
      return;
    else {
      if (router.query.id) {
        if (!router.query.step
          || parseInt(router.query.step as string) >= description.length
        ) {
          router.replace(`/forms/${router.query.id}/form?step=${localStorage.getItem(`--${router.query.id}-last-step`) ?? 0}${testing ? '&testing=true' : ''}`).then(
            () => setCurrentStep(parseInt(router.query.step as string))
          );
          return
        }

        const lastValid = lastValidStep(description, data);
        if ((lastValid) < parseInt(router.query.step as string)) {
          router.replace(`/forms/${router.query.id}/form?step=${lastValid}${testing ? '&testing=true' : ''}`).then(
            () => setCurrentStep(parseInt(router.query.step as string))
          );
          return
        }

        setCurrentStep(parseInt(router.query.step as string));
      }
    }

  }, [router.query, description, data, router.isReady]);


  const testing = React.useMemo(() => {
    if (router.isReady)
      return router.query.testing === 'true';
  }, [router.query, router.isReady])

  //Form logic
  const [currentStep, setCurrentStep] = React.useState(0);

  const updateData = (_data: FormValues<RootFormValue>) => {
    setData({ ...Object.assign(data, _data) });

    if (!testing)
      localStorage.setItem(`--${router.query.id as string}-data`, JSON.stringify(data));
  }
  const nextStep = () => {
    if (currentStep < description.length - 1)
      router.push(`/forms/${router.query.id}/form?step=${currentStep + 1}${testing ? '&testing=true' : ''}`);
  }



  const form = React.useMemo(() => {
    if (description.length > 0 && Object.keys(data).length > 0)
      return <Formik validateOnChange validateOnMount initialValues={data} onSubmit={() => { }}>
        {({ values, errors, touched, setFieldValue, setFieldTouched, setFieldError, isValid, submitForm }) => {

          const formikContextValue = { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } as FormikContextValue;
          const [buttonActive, setButtonActive] = React.useState(true);
          const [editingElement, setEditingElement] = React.useState<number | null>(null);

          const initialListElementValues = React.useMemo(() => {
            if (editingElement === null)
              return {}
            if (editingElement === -1)
              return stepToInitialValues(description[currentStep])
            return (values[description[currentStep].name] as FormValues<NestedFormValue>[])[editingElement as number]

          }, [editingElement])

          React.useEffect(() => {
            updateData(values);
          }, [values])
          React.useEffect(() => { if (isValid && !buttonActive) setButtonActive(true); }, [isValid])

          return <formikContext.Provider value={formikContextValue}>
            <div className='mt-8' />
            <UserStep step={description[currentStep]}
              setEditingElement={setEditingElement} />

            <Dialog open={editingElement !== null}>

              <DialogTitle>
                <pre className='text-sm text-right'>
                  {editingElement as number === -1
                    ? `Dodajesz nowy element do listy`
                    : `Edytujesz element nr ${editingElement as number + 1} listy`
                  }
                </pre>
              </DialogTitle>
              <SizedDialogContent>
                <Formik validateOnChange validateOnMount initialValues={initialListElementValues} onSubmit={(vals: FormValues<NestedFormValue>) => {
                  if (editingElement === -1) {
                    const list = values[description[currentStep].name] as FormValues<NestedFormValue>[];
                    setFieldValue(description[currentStep].name, [...list, vals]);
                  } else {
                    const list = values[description[currentStep].name] as FormValues<NestedFormValue>[];
                    list[editingElement as number] = vals;
                    setFieldValue(description[currentStep].name, list);
                  }
                  setEditingElement(null);
                }}>
                  {({ values, errors, touched, setFieldValue, setFieldError, setFieldTouched, submitForm, isValid }) => {
                    const formikContextValue = { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } as FormikContextValue;
                    const formikNestedContext = React.useMemo(() => React.createContext(formikContextValue), []);

                    const [buttonActive, setButtonActive] = React.useState(true);

                    React.useEffect(() => {
                      if (!buttonActive && isValid)
                        setButtonActive(true);
                    }, [isValid])


                    return <formikNestedContext.Provider value={formikContextValue}>
                      <UserStep
                        nested context={formikNestedContext} step={description[currentStep]} />
                      <span className='flex justify-end mt-4 items-center'>
                        <Button disabled={!buttonActive} className='border-none' size='small' onClick={
                          () => {
                            submitForm();
                            if (!isValid)
                              setButtonActive(false);
                          }
                        }>Zapisz</Button>
                        <Button className='border-none' onClick={() => setEditingElement(null)} size='small' color='error'>Anuluj</Button>
                      </span>
                    </formikNestedContext.Provider>
                  }}
                </Formik>
              </SizedDialogContent>
            </Dialog>


            <Snackbar open={!buttonActive}>
              <Alert severity='error'>Wypełnij wszystkie pola poprawnie.</Alert>
            </Snackbar>
            <div className={loading ? '' : 'mt-8'} />
            <Button
              disabled={!buttonActive}
              className={`p-2.5 ${buttonActive ? 'bg-blue-500  hover:bg-blue-400' : 'bg-gray-300'} text-white mb-8  ${loading ? '' : 'mt-auto'}`}
              onClick={() => {
                if (!isValid) {
                  submitForm();
                  setButtonActive(false);
                }
                else {
                  nextStep();
                }
              }}>
              dalej
              <ArrowForward className='ml-4' />
            </Button>
          </formikContext.Provider>
        }}
      </Formik>;
    else return <></>
  },
    [description, currentStep, loading]
  );



  return <BodyScrollLock>
    <div className="bg-white sm:p-8 p-4 sm:pb-0 pb-0 flex flex-col items-center overflow-y-auto fixed top-0 bottom-0 right-0 left-0" style={{ zIndex: 201 }}>
      <Body className='w-full bg-red- min-h-full flex flex-col'>
        <span className='flex flex-col'>
          <div className="flex justify-between mb-4 flex-wrap items-center">
            <span className='-ml-5 -mt-4'>
              <LogoHeader
                border={false}
                social={false}
              />
            </span>
            <LinearProgressAdapitve variant={loading ? 'indeterminate' : 'determinate'} value={currentStep / description.length * 100} className='rounded-lg flex-1 w-full h-9' />
          </div>
          {
            loading
              ? <></>
              : <div className='flex items-start justify-between'>
                <p className='text-slate-700'>
                  <pre className='inline mr-1 text-slate-500'>
                    krok {currentStep + 1} <span className='normal-case'>z</span> {description.length}{description[currentStep]?.subtitle ? ': ' : ''}
                  </pre>
                  {description[currentStep]?.subtitle}
                </p>
              </div>
          }
        </span>
        {
          loading
            ? <> <div className=' flex items-center justify-center m-auto'>
              <pre className='mr-8'>Pobieramy twój formularz</pre>
              <CircularProgress />
            </div>
              <Button
                className={`p-2.5  bg-gray-300 text-white mb-8`}
              >
                dalej
                <ArrowForward className='ml-4' />
              </Button>
            </>
            : form
        }

      </Body>

    </div>
  </BodyScrollLock>;
}

export function stepToInitialValues(step: StepDescription) {
  const initValues = {} as FormValues<NestedFormValue>;

  step.children.forEach((fragment) => {
    fragment.children.forEach(({ name, type, valueType }) => {
      initValues[name] = type === 'date' ? null : '' as NestedFormValue;
    })
  })

  return initValues;
}

export function descriptionToInitialValues(description: FormDescription) {
  let data = {} as FormValues<RootFormValue>;


  description.forEach((step) => {
    if (step.type === 'list')
      data[step.name] = [] as FormValues<NestedFormValue>[];
    else
      data = { ...data, ...stepToInitialValues(step) };
  });

  return data;
}

export function stepToValidators(step: StepDescription) {
  const validators = {} as {
    [key: string]: (value: any) => string | null;
  };

  step.children.forEach((fragment) =>
    fragment.children.forEach((field) => {
      const { text, select, date } = Validators.factory(field);
      validators[field.name] = field.type === 'text' ? text() : field.type === 'select' ? select() : date();
    })
  )

  return validators;
}
export function descriptionToValidators(description: FormDescription) {
  let validators = {} as { [key: string]: (value: any) => string | null };

  description.forEach((step) => {
    if (step.type === 'list') {
      validators[step.name] = (value: FormValues<NestedFormValue>[]) => {
        return null;
      }
    }
    else
      validators = { ...validators, ...stepToValidators(step) };
  });

  return validators;
}

export function validateValues(values: FormValues<RootFormValue>, validators: { [key: string]: (value: any) => string | null }) {
  let errors = {} as { [key: string]: string };

  Object.keys(validators).forEach((key) => {
    const error = validators[key](values[key]);

    if (error)
      errors = { ...errors, [key]: error };
  });

  return errors;
}

function lastValidStep(description: FormDescription, values: FormValues<RootFormValue>) {
  let lastValidStep = 0;

  for (let i = 0; i < description.length; i++) {
    const errors = validateValues(values, descriptionToValidators(description.slice(0, i + 1)));
    if (Object.keys(errors).length === 0)
      lastValidStep = i;
    else
      break;
  }
  return lastValidStep;
}



export default FormDisplay;