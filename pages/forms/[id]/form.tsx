import styled from '@emotion/styled';
import { collection, doc, getDoc } from '@firebase/firestore';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { Alert, Button, CircularProgress, Dialog, DialogContent, DialogTitle, LinearProgress, Snackbar } from '@mui/material';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import { firestore } from '../../../buildtime-deps/firebase';
import UserStep from '../../../components/form/Step';
import LogoHeader from '../../../components/LogoHeader';
import { InitialValues } from '../../../components/utility/InitialValues';
import { ValidatorsObject } from '../../../components/utility/ValidatorsObject';
import { useAuth } from '../../../providers/AuthProvider';
import BodyScrollLock from "../../../providers/BodyScrollLock";
import { FormDescription } from '../../../providers/FormDescriptionProvider/FormDescriptionProvider';
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

const topLevelFormDataContext = React.createContext<{
  values: FormValues<RootFormValue>;
  currentListIndex: number | null;
  newElement?: boolean,
}>({ values: {}, currentListIndex: null, newElement: false });

export const useTopLevelFormData = () => React.useContext(topLevelFormDataContext);


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

  const dataRef = React.useRef<FormValues<RootFormValue>>({});
  React.useEffect(() => {
    dataRef.current = data;
  }, [data]);

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
              : InitialValues.fromDescription(formDescription)
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
          const step = localStorage.getItem(`--${router.query.id}-last-step`) ?? '0'

          router.replace(`/forms/${router.query.id}/form?step=${step}${testing ? '&testing=true' : ''}`).then(
            () => setCurrentStep(parseInt(step))
          );
          return
        }

        const lastValid = lastValidStep(description, data);
        if ((lastValid) < (parseInt(router.query.step as string) ?? 2000000000000000000000000000000000000000000000)) {
          router.replace(`/forms/${router.query.id}/form?step=${lastValid}${testing ? '&testing=true' : ''}`).then(
            () => setCurrentStep(lastValid)
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
    const dataRetrievalFunction = testing ? sessionStorage : localStorage;

    if (currentStep < description.length - 1) {
      router.push(`/forms/${router.query.id}/form?step=${currentStep + 1}${testing ? '&testing=true' : ''}`);
      return;
    }

    dataRetrievalFunction.setItem(`--${router.query.id as string}-data`, JSON.stringify(data));
    dataRetrievalFunction.setItem(`--${router.query.id as string}-last-step`, `${currentStep}`);

    router.push(`/account/lawyer/edit-document/template?id=${router.query.id}`)
  }


  const formValidators = React.useMemo(
    () =>
      ValidatorsObject.fromDescription(description),
    [description]
  )
  const currentStepValidators = React.useMemo(
    () =>
      currentStep >= description.length
        ? { validate: (values: any) => ({} as ValidatorsObject.Errors) }
        : ValidatorsObject.fromStep(description[currentStep]),
    [description, currentStep]
  )




  return <BodyScrollLock>
    <div className="bg-white sm:p-8 p-4 sm:pb-0 pb-0 flex flex-col items-center overflow-y-auto fixed top-0 bottom-0 right-0 left-0" style={{ zIndex: 201 }}>
      <Body className='w-full bg-red- min-h-full flex flex-col'>
        <Button size='small' className='bg-blue-100 rounded mb-12 border-none w-full flex items-center justify-between'>
          <ArrowBack />
          Wróć do strony pisma
        </Button>
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
            : (description.length > 0 && Object.keys(data).length > 0 && currentStep < description.length && currentStep >= 0)
              ? <Formik validate={
                values => {
                  const errors = formValidators.validate(dataRef.current, description);
                  return errors;
                }
              } validateOnMount validateOnChange initialValues={data} onSubmit={() => { }}>
                {({ values, errors, touched, setFieldValue, setFieldTouched, setFieldError, isValid, submitForm }) => {

                  const formikContextValue = { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } as FormikContextValue;
                  const setTopFieldValue = setFieldValue
                  const [buttonActive, setButtonActive] = React.useState(true);
                  const [editingElement, setEditingElement] = React.useState<number | null>(null);

                  const initialListElementValues = React.useMemo(() => {
                    if (editingElement === null)
                      return {}
                    if (editingElement === -1)
                      return InitialValues.fromStep(description[currentStep])
                    return (values[description[currentStep].name] as FormValues<NestedFormValue>[])[editingElement as number]

                  }, [editingElement])

                  React.useEffect(() => {
                    updateData(values);
                  }, [values])
                  React.useEffect(() => { if (isValid && !buttonActive) setButtonActive(true); }, [isValid])

                  return <formikContext.Provider value={formikContextValue}>
                    <topLevelFormDataContext.Provider value={{ values: dataRef.current, currentListIndex: editingElement === -1 ? (values[description[currentStep].name] as []).length - 1 : editingElement, newElement: editingElement === -1 ? true : false }}>
                      <div className='mt-8' />
                      <UserStep element={description[currentStep]} formDescription={description}
                        setEditingElement={setEditingElement} />
                      {editingElement !== null ?
                        <Dialog open={true} >

                          <DialogTitle>
                            <pre className='text-sm text-right'>
                              {editingElement as number === -1
                                ? `Dodajesz nowy element do listy`
                                : `Edytujesz element nr ${editingElement as number + 1} listy`
                              }
                            </pre>
                          </DialogTitle>
                          <SizedDialogContent>
                            {editingElement != null
                              ? <Formik
                                validate={(values) => {
                                  return currentStepValidators.validate(
                                    values,
                                    description
                                  );

                                }}
                                validateOnChange validateOnMount validateOnBlur
                                initialValues={initialListElementValues}
                                onSubmit={(vals: FormValues<NestedFormValue>) => {

                                  if (editingElement === -1) {
                                    const list = values[description[currentStep].name] as FormValues<NestedFormValue>[];
                                    list[list.length - 1] = vals;
                                    setFieldValue(description[currentStep].name, [...list]);
                                  } else {
                                    const list = values[description[currentStep].name] as FormValues<NestedFormValue>[];
                                    list[editingElement as number] = vals;
                                    setFieldValue(description[currentStep].name, [...list]);
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
                                    <UserStep formDescription={description}
                                      nested context={formikNestedContext} element={description[currentStep]} />
                                    <span className='flex justify-end mt-4 items-center'>
                                      <Button disabled={!buttonActive} className='border-none' size='small' onClick={
                                        () => {
                                          submitForm();
                                          if (!isValid)
                                            setButtonActive(false);
                                        }
                                      }>Zapisz</Button>
                                      <Button className='border-none' onClick={() => {
                                        const edited = editingElement;
                                        setEditingElement(null);
                                        if (edited === -1)
                                          setTopFieldValue(description[currentStep].name, (data[description[currentStep].name] as FormValues<NestedFormValue>[]).slice(0, -1))
                                      }} size='small' color='error'>Anuluj</Button>
                                    </span>
                                  </formikNestedContext.Provider>
                                }}
                              </Formik>
                              : null}
                          </SizedDialogContent>
                        </Dialog>
                        : null
                      }


                      <Snackbar open={!buttonActive}>
                        <Alert severity='error'>Wypełnij wszystkie pola poprawnie.</Alert>
                      </Snackbar>
                      <div className={loading ? '' : 'mt-8'} />
                      <div className={`${loading ? '' : 'mt-auto'} w-full flex pb-3`}>
                        <Button
                          disabled={!buttonActive}
                          className={`p-2.5 w-full ${buttonActive ? 'bg-blue-200  hover:bg-blue-100' : 'bg-gray-300'} mb-8  `}
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
                      </div>
                    </topLevelFormDataContext.Provider>
                  </formikContext.Provider>
                }}
              </Formik>
              : <></>

        }

      </Body>

    </div>
  </BodyScrollLock>;
}



export function lastValidStep(description: FormDescription, values: FormValues<RootFormValue>): number {
  let lastValidStep = 0;

  for (let i = 0; i < description.length; i++) {
    const errors = ValidatorsObject.fromDescription(description.slice(0, i + 1)).validate(values, description);
    if (Object.keys(errors).length === 0)
      lastValidStep = i;
    else
      break;
  }
  return lastValidStep;
}



export default FormDisplay;