import styled from '@emotion/styled';
import { collection, doc, getDoc } from '@firebase/firestore';
import { ArrowBack, ArrowForward, Article } from '@mui/icons-material';
import { Alert, Button, CircularProgress, Dialog, DialogContent, DialogTitle, LinearProgress, Snackbar } from '@mui/material';
import { Formik } from 'formik';
import Link from 'next/link';
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
  padding: 1rem !important;
  @media (min-width: 400px) {
    padding: 2rem !important;
  }
  max-width: 900px;
  @media (min-width: 1700px) {
    max-width: 1100px;
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
  const [formDoc, setFormDoc] = React.useState<IFormData>();
  const [data, setData] = React.useState<FormValues<RootFormValue>>({});
  const [err404, setErr404] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [testing, setTesting] = React.useState(false);

  const dataRef = React.useRef<FormValues<RootFormValue>>({});
  React.useEffect(() => {
    dataRef.current = data;
  }, [data]);

  React.useEffect(() => {
    if (!router.isReady)
      return;
    if (loading) {
      const formId = router.query.id as string;
      const testing = router.query.testing == 'true';
      setTesting(testing);

      setCurrentStep(0);
      router.replace(`/forms/${formId}/form?step=${0}${testing ? '&testing=true' : ''}`,)

      if (testing && !userProfile?.roles.includes('admin') && !userProfile?.roles.includes('lawyer')) {
        setErr404(true);
        setLoading(false);
      }

      getDoc(doc(collection(firestore, testing ? 'forms' : 'products'), formId)).then((form) => {

        if (!form.exists()) {
          setErr404(true);
          setLoading(false);
          return;
        };


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
        setFormDoc(formDocData);
        setLoading(false);
      });

    }
  }, [router.isReady])
  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    if (parseInt(router.query.step as string) != currentStep)
      setCurrentStep(0);


  }, [router.query.step])

  React.useEffect(() => {
    if (!router.isReady || !(description.length) || JSON.stringify(data) === '{}')
      return;
    else {
      if (parseInt(router.query.step as string) < currentStep) {
        setCurrentStep(parseInt(router.query.step as string));
      }
    }
  }, [router.query, description, data, router.isReady]);



  //Form logic

  const updateData = (_data: FormValues<RootFormValue>) => {
    setData({ ...Object.assign(data, _data) });

    if (!testing)
      localStorage.setItem(`--${router.query.id as string}-data`, JSON.stringify(data));
  }
  const nextStep = () => {
    const dataRetrievalFunction = testing ? sessionStorage : localStorage;

    if (currentStep < description.length - 1) {
      setCurrentStep(currentStep + 1);
      document.getElementById('fixed-parent')?.scrollTo({ top: 0, behavior: 'smooth' });

      router.push(`/forms/${router.query.id}/form?step=${currentStep + 1}${testing ? '&testing=true' : ''}`);

      return;
    }

    dataRetrievalFunction.setItem(`--${router.query.id as string}-data`, JSON.stringify({ ...data, '§valuesValid': true }));
    dataRetrievalFunction.setItem(`--${router.query.id as string}-last-step`, `${currentStep}`);

    if (testing)
      router.push(`/account/lawyer/edit-document/template?id=${router.query.id}`)
    else
      router.push(`/forms/${router.query.id}/checkout`);
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
    <div id='fixed-parent' className="bg-white overflow-y-auto fixed top-0 bottom-0 right-0 left-0" style={{ zIndex: 201, /*backgroundImage: 'url(/bg-new-light.svg)',*/ backgroundSize: 'cover' }}>
      <div className='w-full h-full flex sm:px-8 sm:py-8'>
        <Body className='w-full h-auto my-auto mx-auto bg-white  flex flex-col'>
          <Link href={`/forms/${router.query.id}`}>
            <a className='text-sm text-slate-500 hover:text-black gap-1 inline-flex items-center'>
              <Article /> Do strony pisma
            </a>
          </Link>

          <p className='text-sm self-end whitespace-normal text-right'>Wypełniasz formularz pisma:</p>
          <h1 className='self-end text-xl sm:text-2xl mb-0 whitespace-normal text-right text-black'>{formDoc?.title}</h1>
          <pre className='text-xs self-end text-right mb-6'>{formDoc?.newCategory || formDoc?.category}</pre>
          <span className='flex flex-col'>
            <div className="flex justify-between mb-4 flex-wrap items-center">
              <span className='-ml-5 -mt-4'>
                <LogoHeader
                  border={false}
                  noBackground
                  social={false}
                />
              </span>
              <LinearProgressAdapitve variant={loading ? 'indeterminate' : 'determinate'} value={currentStep / description.length * 100} className='rounded-lg flex-1 w-full h-9' />
            </div>
            {
              loading
                ? <></>
                : <span className='flex flex-col'>

                  <div className='flex items-start justify-between'>

                    <p className='text-slate-700'>
                      <pre className='inline mr-1 text-slate-500'>
                        krok {currentStep + 1} <span className='normal-case'>z</span> {description.length}{description[currentStep]?.subtitle ? ': ' : ''}
                      </pre>
                      {description[currentStep]?.subtitle}
                    </p>
                  </div>
                  {currentStep > 0
                    ?
                    <Button onClick={() => router.back()} className='mt-2 px-0 border-none self-start' size='small' color='error'><ArrowBack className='mr-2' /> Poprzedni krok</Button>
                    : null
                  }
                </span>
            }
          </span>
          {
            loading
              ? <> <div className=' flex items-center justify-center my-24'>
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
                        <div className={loading ? '' : 'mt-12'} />
                        <div className={`${loading ? '' : ''} w-full flex`}>
                          <Button
                            disabled={!buttonActive}
                            className={`p-2.5 w-full ${buttonActive ? 'bg-blue-400 text-white  hover:bg-blue-500' : 'bg-gray-300'}`}
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
    </div>
  </BodyScrollLock >;
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