import styled from '@emotion/styled';
import { collection, doc, getDoc } from '@firebase/firestore';
import { Add, ArrowBack, ArrowForward, Delete, List as ListIcon, MoveDown, MoveUp } from '@mui/icons-material';
import { Alert, Button, ButtonGroup, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, Snackbar, Tooltip } from '@mui/material';
import { Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useElementSize } from 'usehooks-ts';
import { DisplayHeader } from '.';
import { firestore } from '../../../buildtime-deps/firebase';
import UserField from '../../../components/form/Field';
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
  max-width: 60rem;
	padding-bottom: 4rem;
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

const FormDisplay = () =>
{
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
	React.useEffect(() =>
	{
		dataRef.current = data;
	}, [data]);

	React.useEffect(() =>
	{
		if (!router.isReady)
			return;
		if (loading)
		{
			const formId = router.query.id as string;
			const testing = router.query.testing == 'true';
			setTesting(testing);

			setCurrentStep(0);
			router.replace(`/forms/${formId}/form?step=${0}${testing ? '&testing=true' : ''}`,)

			if (testing && !userProfile?.roles.includes('admin') && !userProfile?.roles.includes('lawyer'))
			{
				setErr404(true);
				setLoading(false);
			}

			getDoc(doc(collection(firestore, testing ? 'forms' : 'products'), formId)).then((form) =>
			{

				if (!form.exists())
				{
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

	React.useEffect(() =>
	{
		if (parseInt(router.query.step as string) != currentStep)
			setCurrentStep(0);


	}, [router.query.step])

	React.useEffect(() =>
	{
		if (!router.isReady || !(description.length) || JSON.stringify(data) === '{}')
			return;
		else
		{
			if (parseInt(router.query.step as string) < currentStep)
			{
				setCurrentStep(parseInt(router.query.step as string));
			}
		}
	}, [router.query, description, data, router.isReady]);


	//Form logic

	const updateData = (_data: FormValues<RootFormValue>) =>
	{
		setData({ ...Object.assign(data, _data) });

		if (!testing)
			localStorage.setItem(`--${router.query.id as string}-data`, JSON.stringify(data));
	}
	const nextStep = () =>
	{
		const dataRetrievalFunction = testing ? sessionStorage : localStorage;

		if (currentStep < description.length - 1)
		{
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

		<div id='fixed-parent' className="bg-white min-h-screen overflow-y-visible" style={{
			zIndex: 201, //backgroundImage: 'url(/bg-new-light.svg)', backgroundSize: 'cover' 
		}}>
			<DisplayHeader />
			<div className="min-h-72 h-fit pt-16 px-8 sm:px-12" style={{
				backgroundImage: `url(/bg-light-blue.svg)`,
				backgroundSize: 'cover'
			}} >

				<div className='flex flex-col mx-auto py-8 text-white max-w-[60rem]'>
					<div className='inline-flex items-start gap-4'>
						<Link href={`/forms/${router.query.id}`}>
							<IconButton>
								<ArrowBack className='sm:text-4xl text-2xl text-blue-300 mb-auto' />
							</IconButton>
						</Link>
						<h1 className='sm:text-5xl text-3xl' >
							{formDoc?.title}
						</h1>
					</div>
					<pre className='whitespace-normal text-white opacity-70'>
						{formDoc?.category}
					</pre>

					<span className='flex self-end items-end mt-6 text-white text-right flex-col'>
						<LinearProgressAdapitve variant={loading ? 'indeterminate' : 'determinate'} value={currentStep / description.length * 100} className='rounded-lg flex-1 w-full' />

						{
							loading
								? <></>
								: <span className='flex flex-col items-end'>

									<div className='flex items-start justify-between'>

										<pre className='text-white inline mr-1 normal-case text-right '>
											<b className='text-blue-200'>FORMULARZ:</b> KROK {currentStep + 1} z {description.length}
										</pre>
									</div>
									<p className='sm:text-lg text-blue-300 text-right'>
										{description[currentStep]?.subtitle}
									</p>
								</span>
						}
					</span>
				</div>

			</div>


			<div className='w-full px-8 sm:px-12 h-full flex'>

				<Body className='w-full h-auto my-auto mx-auto  flex flex-col'>
					{
						currentStep > 0
							? <Button onClick={router.back} className='border-none mt-8 -mb-4 hover:bg-red-100 self-end' color='error' size='small'><ArrowBack className='mr-2' /> poprzedni krok</Button>
							: null
					}

					<Snackbar open={incorrect}>
						<Alert severity='error' variant='filled'>
							Wypełnij wszystkie pola poprawnie.
						</Alert>
					</Snackbar>

					{
						loading
							? <> <div className=' flex items-center justify-center my-24'>
								<pre className='mr-8'>Pobieramy twój formularz</pre>
								<CircularProgress />
							</div>
								<Button
									className={`bg-gray-300 text-white mb-8`}
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
									render={({ values, errors, touched, setFieldError, setFieldValue, setFieldTouched, validateForm, isValid, submitForm }) =>
									{
										const currentStepDescription = React.useMemo(() => description[currentStep], [currentStep]);
										const isList = React.useMemo(() => currentStepDescription.type === 'list', [currentStep]);

										const buttonDisabled = isList &&
											(description[currentStep]?.listMinMaxItems?.min != null && (values[description[currentStep].name] as FormValues<NestedFormValue>[])?.length < (description[currentStep]?.listMinMaxItems?.min ?? 0)) ||
											(description[currentStep]?.listMinMaxItems?.max != null && (values[description[currentStep].name] as FormValues<NestedFormValue>[])?.length > (description[currentStep]?.listMinMaxItems?.max ?? 10000000000000))

										React.useEffect(
											() =>
											{
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

											{description[currentStep].type === 'list' &&
												(description[currentStep]?.listMinMaxItems?.min != null && (values[description[currentStep].name] as FormValues<NestedFormValue>[])?.length < (description[currentStep]?.listMinMaxItems?.min ?? 0))
												? <p className='text-sm text-slate-500'>{
													description[currentStep]?.listMinMaxItems?.min === 1
														? 'Ta lista musi zawierać przynajmniej jeden element.'
														: `Ta lista musi zawierać przynajmniej ${description[currentStep]?.listMinMaxItems?.min} elementów.`
												}</p>
												: null
											}
											{description[currentStep].type === 'list' &&
												(description[currentStep]?.listMinMaxItems?.max != null && (values[description[currentStep].name] as FormValues<NestedFormValue>[])?.length > (description[currentStep]?.listMinMaxItems?.max ?? 1000000000000))
												? <p className='text-sm text-slate-500'>Ta lista może zawierać maksymalnie {description[currentStep]?.listMinMaxItems?.max} elementów.</p>
												: null
											}
											<Button disabled={buttonDisabled} onClick={async () =>
											{
												const errors = await validateForm();
												if (Object.keys(errors).length === 0)
													nextStep();
												else
												{
													await submitForm();
													if (incorrectTimeout.current) clearTimeout(incorrectTimeout.current);
													setIncorrect(true);
													incorrectTimeout.current = setTimeout(() => setIncorrect(false), 5000);
												}
											}} className={`${buttonDisabled ? 'bg-gray-300 cursor-default text-white' : 'bg-blue-100 text-blue-500 '}  p-2`}>
												Następny krok
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



export const Step = ({ step, listIndex, formDescription }: { step: StepDescription, listIndex?: number, formDescription: FormDescription }) =>
{
	return <div className={`flex flex-col ${listIndex == null ? 'py-8' : ''}`}>
		{
			step.children.map(
				(fragment, index) =>
				{
					return <Fragment key={index} {...{ fragment, listIndex, formDescription, index }} />
				}
			)
		}
	</div>;
}

export const Fragment = ({ fragment, listIndex, formDescription, index }: { fragment: FragmentDescription, index: number, listIndex?: number, formDescription: FormDescription }) =>
{
	const { values, errors, touched, setFieldError, setFieldValue, setFieldTouched } = React.useContext(formikContext);
	const fields = React.useMemo(
		() => fragment.children.map((element, index) =>
		{
			return <UserField key={element.name} {...{ element, listIndex, fullWidth: element.fullWidth || undefined, formDescription, fragmentCondition: fragment.condition }} />
		}),
		[formDescription]
	)

	const obscured = React.useMemo(() =>
	{
		return !Evaluate.sequence(fragment.condition, values, formDescription ?? [], listIndex ?? undefined).condition()
			? <div style={{ zIndex: 500 }} className='bg-slate-50 flex bg-opacity-75 rounded-lg absolute top-0 left-0 right-0 bottom-0 p-4 sm:p-8 box-content' >
				<div className='flex flex-col items-center m-auto'>
					<pre>Nie dotyczy</pre>
					<p className='text-sm'>Ten fragment nie dotyczy twojej sprawy.</p>
				</div>
			</div>
			: null
	}, [values, listIndex])


	return <div className='flex flex-col bg-white my-4 rounded-lg relative  '>
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

export const List = ({ step, formDescription }: { step: StepDescription, formDescription: FormDescription }) =>
{
	const { values, errors, touched, setFieldValue, setFieldError, setFieldTouched, validateForm } = useFormValue();

	const [movingDown, setMovingDown] = React.useState<number>(-1);
	const [movingUp, setMovingUp] = React.useState<number>(-1);

	const swap = async (index1: number, index2: number, how: 'down' | 'up') =>
	{
		setMovingDown(how === 'down' ? index1 : -1);
		setMovingUp(how === 'up' ? index1 : -1);
	}
	const deleteItem = (index: number) =>
	{
		const list = values[step.name] as any[];
		list.splice(index, 1);
		setFieldValue(step.name, list);
	}

	React.useEffect(
		() => validateForm(values),
		[values[step.name]?.length]
	)

	const _swap = (index1: number, index2: number) =>
	{
		const temp = values[step.name][index1];
		setFieldValue(`${step.name}[${index1}]`, values[step.name][index2]);
		setFieldValue(`${step.name}[${index2}]`, temp);

		if (errors[step.name])
		{
			const tempErrror = errors[step.name][index1];

			setFieldError(`${step.name}[${index1}]`, errors[step.name][index2]);
			setFieldError(`${step.name}[${index2}]`, tempErrror);
		}

		if (touched[step.name])
		{
			const tempTouched = touched[step.name][index1];

			setFieldTouched(`${step.name}[${index1}]`, touched[step.name][index2]);
			setFieldTouched(`${step.name}[${index2}]`, tempTouched);
		}
	}

	const [heights, setHeights] = React.useState<{ [key: number]: number }>({});

	React.useEffect(
		() =>
		{
			if (movingUp === -1 && movingDown === -1) return;
			if (movingUp !== -1)
			{
				setTimeout(() =>
				{
					_swap(
						movingUp - 1,
						movingUp
					);
					setMovingUp(-1);
				}, 500);
			}
			if (movingDown !== -1)
			{

				setTimeout(() =>
				{
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
						<ListElement
							{
							...{
								setHeights,
								deleteSelf: () => deleteItem(index),
								movingDown,
								index,
								movingUp,
								arr,
								heights,
								step,
								swap,
								formDescription
							}
							}
						/>
				)
				: <div className='flex flex-col items-center bg-slate-100 p-8 sm:p-16 rounded-lg'>
					<pre className='whitespace-normal'>
						Lista jest pusta
					</pre>
					<p className='text-sm mt-4'>Dodaj elementy do listy.</p>
				</div>
		}
		<Button className='text-blue-500 mt-4 self-end' onClick={() => setFieldValue(
			step.name,
			[...(values[step.name] ?? []), InitialValues.fromStep(step)]
		)}>
			dodaj element
			<Add className='ml-2' />
		</Button>
	</div>
}




export default FormDisplay;

function ListElement({ movingDown, index, movingUp, arr, heights, step, swap, deleteSelf, formDescription, setHeights }:
	{
		movingDown: number, index: number, deleteSelf: () => void, movingUp: number, arr: FormValues<NestedFormValue>[], heights: { [key: number]: number; }, step: StepDescription, swap: (index1: number, index2: number, how: 'down' | 'up') => Promise<void>, formDescription: FormDescription, setHeights: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>
	}): JSX.Element
{

	const [ref, { height }] = useElementSize();
	const [deleting, setDeleting] = React.useState<boolean>(false);

	React.useEffect(
		() =>
		{
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
		<div className={'inline-flex my-6 rounded w-full p-2 bg-slate-100 items-center gap-4'}>
			<Dialog scroll="body" open={deleting}>
				<DialogTitle className='text-red-500'><pre>Usuwasz element listy</pre></DialogTitle>
				<DialogContent className='sm:min-w-[40rem]'>
					<p className='mb-4'>Czy na pewno chcesz usunąć ten element?</p>
					<div className='py-2 rounded-lg pointer-events-none'>
						<ListElement {...{ setHeights, movingDown, index, movingUp, arr, heights, step, swap, deleteSelf, formDescription }} />
					</div>
					<p className='mt-4 font-bold text-red-500'>Ta operaja jest nieodwracalna.</p>
				</DialogContent>
				<DialogActions>
					<Button color='error' onClick={() => setDeleting(false)}>Anuluj</Button>
					<Button onClick={() =>
					{
						deleteSelf();
						setDeleting(false);
					}}>Usuń</Button>
				</DialogActions>
			</Dialog>
			<pre className='whitespace-normal text-base ml-3'>{step.listItemName || 'Element'} {index + 1}</pre>
			<div className='flex-1' />
			<ButtonGroup disabled={movingDown != -1 || movingUp != -1} variant='text'>
				<Tooltip title='zamień z elementem powyżej'>
					<Button disabled={index == 0} onClick={() => { swap(index, index - 1, 'up'); }} size='small' className={`border-none ${index == 0 ? 'text-slate-200' : 'text-slate-500'}`}><MoveUp /></Button>
				</Tooltip>
				<Tooltip title='zamień z elementem poniżej'>
					<Button disabled={index == arr.length - 1} onClick={() => { swap(index, index + 1, 'down'); }} size='small' className={`border-none ${index == arr.length - 1 ? 'text-slate-200' : 'text-slate-500'}`}><MoveDown /></Button>
				</Tooltip>
				<Tooltip title='usuń'>
					<Button onClick={() => setDeleting(true)} size='small' color='error' className='border-none'><Delete /></Button>
				</Tooltip>
			</ButtonGroup>
		</div>
		<Step {...{ step, listIndex: index, formDescription }} />
	</div>;
}
