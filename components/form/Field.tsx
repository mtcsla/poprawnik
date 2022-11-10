import styled from '@emotion/styled';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { ErrorMessage, Field } from 'formik';
import React from 'react';
import { FormikContextValue, FormValues, NestedFormValue, useFormValue, useTopLevelFormData } from '../../pages/forms/[id]/form';
import { FieldDescription, FormDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { Expression } from '../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { Condition, OperatorCondition } from '../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider';
import { ErrorMessageCallback } from '../form-edit/FieldEditor';
import { Evaluate } from '../utility/Evaluate';
import { Validators } from '../utility/ValidatorFactories';


export type FieldProps<Type> = {
  fullWidth?: true,
  display?: true,
  context?: React.Context<FormikContextValue>,
  valueDisplay?: true,

  listElementValues?: FormValues<NestedFormValue>
  listIndex?: number,


  element: Type,
  formDescription: FormDescription
  fragmentCondition?: Expression<Condition, OperatorCondition>
}

/**
 * Make sure the field is a child to formik!
*/
const UserField = ({ element, fullWidth, display, valueDisplay, context, listElementValues, formDescription, fragmentCondition }: FieldProps<FieldDescription>): JSX.Element => {
  const FieldWrapper = styled.span`
    ${element.fullWidth ? 'flex: 1; min-width: 100%;' : 'width: 49%; max-width: 49%;'}
    @media (max-width: 700px) {
      width: 100%;
      max-width: 100%;
    }
    ${fullWidth ? 'min-width: 100%;' : ''}
  `


  const TypedField = React.useMemo(() => {
    if (element.type === 'date')
      return <UserDateField {...{ element, display, context, formDescription, fragmentCondition }} />
    else if (element.type === 'select')
      return <UserSelectField {...{ element, display, context, formDescription, fragmentCondition }} />
    else return <UserTextField {...{ element, display, context, formDescription, fragmentCondition }} />
  }, []
  )

  return <FieldWrapper className='flex w-full flex-col items-start  mb-4'>
    {
      valueDisplay
        ? <div className='border rounded px-2 py-2 w-full flex flex-col'>
          <p className='text-sm bg-slate-50 px-1 -mt-5  text-slate-500 self-start'>{element.label}</p>
          <p className='px-1 py-0 my-0 truncate'>
            {
              (listElementValues?.[element.name as string] as string)?.length === 0 || listElementValues?.[element.name as string] == null
                ? <pre className='pl-0.5 inline text-sm'>Brak</pre>
                : (
                  element.type === 'date'
                    ? (listElementValues?.[element.name] as Date)?.toLocaleDateString('pl-PL') ?? ''
                    : listElementValues?.[element.name as string] as any
                )
            }</p>
        </div>
        : <>
          {TypedField}
          <ErrorMessage name={element.name}>{ErrorMessageCallback}</ErrorMessage>
        </>
    }
  </FieldWrapper>
}



const UserDateField = ({ element, display, context, formDescription, fragmentCondition }: FieldProps<FieldDescription>) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } = context ? React.useContext(context) : useFormValue();

  const topData = useTopLevelFormData();
  const [disabled, setDisabled] = React.useState<boolean>(false);

  React.useEffect(() => {
    setDisabled(
      formDescription ?
        !Evaluate.sequence({
          components: [
            element.condition,
            fragmentCondition?.components?.length ? fragmentCondition : { variable: null, comparator: null, value: { type: null, value: null }, simpleValue: true }
          ]
          , operators: ['&']
        }, topData.values, formDescription ?? [], topData.currentListIndex ? topData.currentListIndex : undefined).condition()
        : false
    )
  }, [topData.values, formDescription, topData.currentListIndex]);

  const validatorFunction = React.useMemo(() => Validators.factory(element).date(), [element]);

  return <FormControl className='w-full' size={element.fullWidth ? 'medium' : 'small'}>
    <Field as={DatePicker}
      name={element.name}
      disabled={disabled}
      maxDate={element.max ? new Date(element.max) : undefined}
      minDate={element.min ? new Date(element.min) : undefined}
      value={display ? null : values[element.name]}
      onChange={(date: Date) => {
        setFieldValue(element.name, date);
      }}
      validate={display ? validatorFunction : undefined}
      renderInput={(params: any) =>
        <TextField
          onBlur={() => setFieldTouched(element.name, true)}
          size={element.fullWidth ? 'medium' : 'small'} {...Object.assign(params, { error: !!(touched[element.name] && errors[element.name]) })} />}
      className='w-full' label={element.label} />
  </FormControl>

}
const UserSelectField = ({ element, context, display, formDescription, fragmentCondition }: FieldProps<FieldDescription>) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } = context ? React.useContext(context) : useFormValue();

  const validatorFunction = React.useMemo(() => Validators.factory(element).select(), [element]);

  const topData = useTopLevelFormData();
  const [disabled, setDisabled] = React.useState<boolean>(false);


  React.useEffect(() => {
    setDisabled(
      formDescription ?
        !Evaluate.sequence(
          {
            components: [
              element.condition,
              fragmentCondition?.components?.length ? fragmentCondition : { variable: null, comparator: null, value: { type: null, value: null }, simpleValue: true }
            ]
            , operators: ['&']
          }, topData.values, formDescription ?? [], topData.currentListIndex ? topData.currentListIndex : undefined).condition()
        : false
    )
  }, [topData.values, formDescription, topData.currentListIndex]);


  return <FormControl className='w-full'
    error={!!(touched[element.name] && errors[element.name]) as boolean}
    disabled={disabled}
    size={element.fullWidth ? 'medium' : 'small'}>

    <InputLabel>{element.label}</InputLabel>
    <Field
      className='w-full'
      as={Select}
      disabled={disabled}
      onChange={(e: SelectChangeEvent) => setFieldValue(element.name, e.target.value)}
      validate={display ? validatorFunction : undefined}
      label={element.label}
      name={element.name}>
      {element.options.map(option => <MenuItem value={option}>{option}</MenuItem>)}
      <MenuItem value={''}><pre>wyczyść</pre></MenuItem>
    </Field>
  </FormControl>
}
const UserTextField = ({ element, context, display, formDescription, fragmentCondition }: FieldProps<FieldDescription>) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } = context ? React.useContext(context) : useFormValue();

  const validatorFunction = React.useMemo(() => Validators.factory(element).text(), [element])

  const topData = useTopLevelFormData();
  const [disabled, setDisabled] = React.useState<boolean>(false);

  React.useEffect(() => {
    setDisabled(
      formDescription
        ? !Evaluate.sequence({
          components: [
            element.condition,
            fragmentCondition?.components?.length ? fragmentCondition : { variable: null, comparator: null, value: { type: null, value: null }, simpleValue: true }
          ]
          , operators: ['&']
        }, topData.values, formDescription ?? [], topData.currentListIndex ? topData.currentListIndex : undefined).condition()
        : false
    );
  }, [topData.values, formDescription, topData.currentListIndex]);


  return <>
    <Field validate={display ? validatorFunction : undefined} disabled={disabled}
      size={element.fullWidth ? 'medium' : 'small'}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFieldValue(element.name, e.target.value)}
      label={element.label} placeholder={element.placeholder} helperText={element.hint}
      className='w-full' as={TextField} name={element.name} error={!!(touched[element.name] && errors[element.name]) as boolean} />
  </>
}


export default UserField;

