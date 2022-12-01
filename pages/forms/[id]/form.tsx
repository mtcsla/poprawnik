import styled from '@emotion/styled';
import { collection, doc, getDoc } from '@firebase/firestore';
import { Add, ArrowBack, ArrowForward, Delete, List as ListIcon, MoveDown, MoveUp } from '@mui/icons-material';
import { Alert, Button, ButtonGroup, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Snackbar, Tooltip } from '@mui/material';
import { Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useElementSize } from 'usehooks-ts';
import { firestore } from '../../../buildtime-deps/firebase';
import UserField from '../../../components/form/Field';
import LogoHeader from '../../../components/LogoHeader';
import { Evaluate } from '../../../components/utility/Evaluate';
import { InitialValues } from '../../../components/utility/InitialValues';
import { ValidatorsObject } from '../../../components/utility/ValidatorsObject';
import { useAuth } from '../../../providers/AuthProvider';
import { FormDescription, FragmentDescription, StepDescription } from '../../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { IFormData } from '../../account/lawyer/index';

export type FormikContextValue = {
  values: { [key: string]: any };
  touched: { [key: string]: any };
  errors: { [key: string]: any };
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  setFieldTouched: (field: string, value: any, shouldValidate?: boolean) => void;
  setFieldError: (field: string, value: any) => void;
  validateForm: (values: any) => void;
}

const formikValue = {
  values: {},
  touched: {},
  errors: {},
  setFieldValue: () => { },
  setFieldTouched: () => { },
  setFieldError: () => { },
  validateForm: () => { },
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


    dataRetrievalFunction.setItem(`--${router.query.id as string}-data`, JSON.stringify({ ...dataRef.current, '§valuesValid': true }));
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

  const [incorrect, setIncorrect] = React.useState<boolean>(false);
  const incorrectTimeout = React.useRef<NodeJS.Timeout | null>(null);

  return <>
    <div id='fixed-parent' className="bg-white min-h-screen" style={{ zIndex: 201, backgroundImage: 'url(/bg-new-light.svg)', backgroundSize: 'cover' }}>
      <div className='w-full h-full flex sm:px-8 sm:py-8'>
        <Body className='w-full h-auto my-auto mx-auto  flex flex-col'>

          <Snackbar open={incorrect}>
            <Alert severity='error' variant='filled'>
              Wypełnij wszystkie pola poprawnie.
            </Alert>
          </Snackbar>

          <span className='inline-flex gap-2 text-2xl sm:text-3xl self-end'>
            <Link href={`/forms/${router.query.id}`}>
              <ArrowBack color='primary' className='translate-y-2.5 cursor-pointer' />
            </Link>
            <h1 className='self-end font-bold mb-2 mt-2 whitespace-normal text-right text-black'>{formDoc?.title}</h1>
          </span>
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
              currentStep > 0
                ? <Button onClick={router.back} fullWidth className='border-none bg-red-50 hover:bg-red-100 mb-4 w-full self-start' color='error' size='small'><ArrowBack className='mr-2' /> poprzedni krok</Button>
                : null
            }
            {
              loading
                ? <></>
                : <span className='flex flex-col'>

                  <div className='flex items-start justify-between'>

                    <pre className='inline mr-1 normal-case text-slate-500'>
                      KROK {currentStep + 1} z {description.length}
                    </pre>
                  </div>
                  <p className='sm:text-lg'>
                    {description[currentStep]?.subtitle}
                  </p>
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
              : (description && description.length > 0 && Object.keys(data).length > 0 && currentStep < description.length && currentStep >= 0)
                ? <Formik
                  initialValues={data}
                  onSubmit={() => { }}
                  validateOnBlur
                  validateOnChange
                  validateOnMount
                  render={({ values, errors, touched, setFieldError, setFieldValue, setFieldTouched, validateForm, isValid, submitForm }) => {
                    const currentStepDescription = React.useMemo(() => description[currentStep], [currentStep]);
                    const isList = React.useMemo(() => currentStepDescription.type === 'list', [currentStep]);


                    React.useEffect(
                      () => {
                        validateForm();
                      }, [currentStep]
                    )

                    React.useEffect(
                      () => { dataRef.current = values; }, [values]
                    )

                    return <formikContext.Provider value={{ values, errors, touched, setFieldError, setFieldValue, setFieldTouched, validateForm }}>
                      {isList

                        ? <List {...{ step: currentStepDescription, formDescription: description }} />
                        : <Step {...{ step: currentStepDescription, formDescription: description }} />
                      }
                      <Button onClick={async () => {
                        const errors = await validateForm();
                        if (Object.keys(errors).length === 0)
                          nextStep();
                        else {
                          await submitForm();
                          if (incorrectTimeout.current) clearTimeout(incorrectTimeout.current);
                          setIncorrect(true);
                          incorrectTimeout.current = setTimeout(() => setIncorrect(false), 5000);
                        }
                      }} className='bg-blue-400 p-2 sm:p-4 text-white hover:bg-blue-300'>
                        Dalej
                        <ArrowForward className='ml-2' />
                      </Button>

                    </formikContext.Provider>
                  }}
                />
                : <></>

          }

        </Body>
      </div>
    </div>
  </ >;
}



export const Step = ({ step, listIndex, formDescription }: { step: StepDescription, listIndex?: number, formDescription: FormDescription }) => {
  return <div className={`flex flex-col ${listIndex == null ? 'py-8' : ''}`}>
    {
      step.children.map(
        (fragment, index) => {
          return <Fragment key={index} {...{ fragment, listIndex, formDescription, index }} />
        }
      )
    }
  </div>;
}

export const Fragment = ({ fragment, listIndex, formDescription, index }: { fragment: FragmentDescription, index: number, listIndex?: number, formDescription: FormDescription }) => {
  const { values, errors, touched, setFieldError, setFieldValue, setFieldTouched } = React.useContext(formikContext);
  const fields = React.useMemo(
    () => fragment.children.map((element, index) => {
      return <UserField key={element.name} {...{ element, listIndex, fullWidth: element.fullWidth || undefined, formDescription, fragmentCondition: fragment.condition }} />
    }),
    [formDescription]
  )

  const obscured = React.useMemo(() => {
    return !Evaluate.sequence(fragment.condition, values, formDescription ?? [], listIndex ?? undefined).condition()
      ? <div style={{ zIndex: 500 }} className='bg-slate-50 flex bg-opacity-75 rounded-lg absolute top-0 left-0 right-0 bottom-0 p-4 sm:p-8 box-content' >
        <div className='flex flex-col items-center m-auto'>
          <pre>Nie dotyczy</pre>
          <p className='text-sm'>Ten fragment nie dotyczy twojej sprawy.</p>
        </div>
      </div>
      : null
  }, [values, listIndex])


  return <div className='flex flex-col my-4 bg-slate-50 rounded-lg relative p-4 sm:p-8 '>
    {
      obscured
    }
    <pre className='text-xs'>fragment {index + 1}</pre>
    <h2 className='my-1 mb-4 lg:text-2xl text-xl'>{fragment.title}</h2>
    <p className='mb-8 lg:text-base text-sm'>{fragment.subtitle}</p>
    <div style={{ gap: '2%' }} className='inline-flex flex-wrap'>
      {
        fields
      }
    </div>
  </div>
}

export const List = ({ step, formDescription }: { step: StepDescription, formDescription: FormDescription }) => {
  const { values, errors, touched, setFieldValue, setFieldError, setFieldTouched, validateForm } = useFormValue();

  const [movingDown, setMovingDown] = React.useState<number>(-1);
  const [movingUp, setMovingUp] = React.useState<number>(-1);

  const swap = async (index1: number, index2: number, how: 'down' | 'up') => {
    setMovingDown(how === 'down' ? index1 : -1);
    setMovingUp(how === 'up' ? index1 : -1);
  }
  const deleteItem = (index: number) => {
    const list = values[step.name] as any[];
    list.splice(index, 1);
    setFieldValue(step.name, list);
  }

  React.useEffect(
    () => validateForm(values),
    [values[step.name]?.length]
  )

  const _swap = (index1: number, index2: number) => {
    const temp = values[step.name][index1];
    setFieldValue(`${step.name}[${index1}]`, values[step.name][index2]);
    setFieldValue(`${step.name}[${index2}]`, temp);

    if (errors[step.name]) {
      const tempErrror = errors[step.name][index1];

      setFieldError(`${step.name}[${index1}]`, errors[step.name][index2]);
      setFieldError(`${step.name}[${index2}]`, tempErrror);
    }

    if (touched[step.name]) {
      const tempTouched = touched[step.name][index1];

      setFieldTouched(`${step.name}[${index1}]`, touched[step.name][index2]);
      setFieldTouched(`${step.name}[${index2}]`, tempTouched);
    }
  }

  const [heights, setHeights] = React.useState<{ [key: number]: number }>({});

  React.useEffect(
    () => {
      if (movingUp === -1 && movingDown === -1) return;
      if (movingUp !== -1) {
        setTimeout(() => {
          _swap(
            movingUp - 1,
            movingUp
          );
          setMovingUp(-1);
        }, 500);
      }
      if (movingDown !== -1) {

        setTimeout(() => {
          _swap(
            movingDown,
            movingDown + 1
          );
          setMovingDown(-1);
        }, 500);
      }
    },
    [movingUp, movingDown]
  )

  return <div className='flex flex-col py-8'>
    <pre className='flex'><ListIcon className='mr-2 translate-y-0.5' color='primary' /> Ten krok jest listą</pre>

    <p className='mt-2 mb-6 sm:text-lg'>
      {step.listMessage}
    </p>
    {
      values[step.name]?.length
        ?
        (values[step.name] as FormValues<NestedFormValue>[]).map(
          (value, index, arr) =>

            <ListElement {...{ setHeights, deleteSelf: () => deleteItem(index), movingDown, index, movingUp, arr, heights, step, swap, formDescription }} />

        )
        : <div className='flex flex-col items-center bg-slate-100 p-8 sm:p-16 rounded-lg'>
          <pre className='whitespace-normal'>
            Lista jest pusta
          </pre>
          <p className='text-sm'>Dodaj elementy do listy.</p>
        </div>
    }
    <Button className='text-blue-500  self-end' onClick={() => setFieldValue(
      step.name,
      [...(values[step.name] ?? []), InitialValues.fromStep(step)]
    )}>dodaj element <Add className='ml-2' /></Button>
  </div>
}




export default FormDisplay;

function ListElement({ movingDown, index, movingUp, arr, heights, step, swap, deleteSelf, formDescription, setHeights }:
  {
    movingDown: number, index: number, deleteSelf: () => void, movingUp: number, arr: FormValues<NestedFormValue>[], heights: { [key: number]: number; }, step: StepDescription, swap: (index1: number, index2: number, how: 'down' | 'up') => Promise<void>, formDescription: FormDescription, setHeights: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>
  }): JSX.Element {

  const [ref, { height }] = useElementSize();
  const [deleting, setDeleting] = React.useState<boolean>(false);

  React.useEffect(
    () => {
      setHeights(prev => ({ ...prev, [index]: height ?? 0 }))
    },
    [height]
  )

  return <div ref={ref} style={{
    transform: `translateY(${(movingDown === index || movingUp === index + 1) && index !== arr.length - 1
      ? `${heights[index + 1]}px`
      : (movingUp === index || movingDown === index - 1) && index !== 0
        ? `-${heights[index - 1]}px`
        : '0px'})`
  }} className={`w-full flex-col ${((movingDown === index || movingUp === index + 1) && index != arr.length - 1) || ((movingUp === index || movingDown === index - 1) && index != 0) ? 'transition_transform' : ''}`}>
    <div className={'inline-flex w-full items-center gap-4 h-4'}>
      <Dialog open={deleting}>
        <DialogTitle className='text-red-500'><pre>Usuwasz element listy</pre></DialogTitle>
        <DialogContent>
          <p className='mb-4'>Czy na pewno chcesz usunąć ten element?</p>
          <div className='py-2 rounded-lg bg-red-50 pointer-events-none'>
            <ListElement {...{ setHeights, movingDown, index, movingUp, arr, heights, step, swap, deleteSelf, formDescription }} />
          </div>
          <p className='mt-4 font-bold text-red-500'>Ta operaja jest nieodwracalna.</p>
        </DialogContent>
        <DialogActions>
          <Button color='error' onClick={() => setDeleting(false)}>Anuluj</Button>
          <Button onClick={() => {
            deleteSelf();
            setDeleting(false);
          }}>Usuń</Button>
        </DialogActions>
      </Dialog>
      <pre className='ml-3 whitespace-normal text-sm'>{step.listItemName || 'Element'} {index + 1}</pre>
      <div className='flex-1' />
      <ButtonGroup disabled={movingDown != -1 || movingUp != -1} variant='text'>
        <Tooltip title='zamień z elementem powyżej'>
          <Button disabled={index == 0} onClick={() => { swap(index, index - 1, 'up'); }} size='small' className='border-none'><MoveUp /></Button>
        </Tooltip>
        <Tooltip title='zamień z elementem poniżej'>
          <Button disabled={index == arr.length - 1} onClick={() => { swap(index, index + 1, 'down'); }} size='small' className='border-none'><MoveDown /></Button>
        </Tooltip>
        <Tooltip title='usuń'>
          <Button onClick={() => setDeleting(true)} size='small' color='error' className='border-none'><Delete /></Button>
        </Tooltip>
      </ButtonGroup>
    </div>
    <Step {...{ step, listIndex: index, formDescription }} />
  </div>;
}
