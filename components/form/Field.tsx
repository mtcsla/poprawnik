import styled from '@emotion/styled';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { ErrorMessage, Field } from 'formik';
import React from 'react';
import { FormikContextValue, FormValues, NestedFormValue, useFormValue } from '../../pages/forms/[id]/form';
import { FieldDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { ErrorMessageCallback } from '../form-edit/FieldEditor';
import { Validators } from '../utility/ValidatorFactories';

export type UserFieldProps = {
  field: FieldDescription,
  fullWidth?: true,
  display?: true,
  context?: React.Context<FormikContextValue>,
  valueDisplay?: true,
  values?: FormValues<NestedFormValue>
}

/**
 * Make sure the field is a child to formik!
*/
const UserField = ({ field, fullWidth, display, valueDisplay, context, values }: UserFieldProps): JSX.Element => {
  const FieldWrapper = styled.span`
    ${field.fullWidth ? 'flex: 1; min-width: 100%;' : 'width: 49%; max-width: 49%;'}
    @media (max-width: 700px) {
      width: 100%;
      max-width: 100%;
    }
    ${fullWidth ? 'min-width: 100%;' : ''}
  `


  const TypedField = React.useMemo(() => {
    if (field.type === 'date')
      return <UserDateField {...{ field, display, context }} />
    else if (field.type === 'select')
      return <UserSelectField {...{ field, context }} />
    else return <UserTextField {...{ field, context }} />
  }, []
  )

  return <FieldWrapper className='flex w-full flex-col items-start  mb-4'>
    {
      valueDisplay
        ? <div className='border rounded px-2 py-2 w-full flex flex-col'>
          <p className='text-sm bg-white px-1 -mt-5  text-slate-500 self-start'>{field.label}</p>
          <p className='px-1 py-0 my-0 truncate'>{values?.[field.name as string] as any}</p>
        </div>
        : <>
          {TypedField}
          <ErrorMessage name={field.name}>{ErrorMessageCallback}</ErrorMessage>
        </>
    }
  </FieldWrapper>
}


interface FieldProps extends FormikContextValue { field: FieldDescription };
const UserDateField = ({ field, display, context }: UserFieldProps) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } = context ? React.useContext(context) : useFormValue();

  const validatorFunction = React.useMemo(() => Validators.factory(field).date(), [field]);

  return <FormControl className='w-full' size={field.fullWidth ? 'medium' : 'small'}>
    <Field as={DatePicker}
      name={field.name}
      maxDate={field.max ? new Date(field.max) : undefined}
      minDate={field.min ? new Date(field.min) : undefined}
      value={display ? null : values[field.name]}
      onChange={(date: Date) => {
        setFieldValue(field.name, date, true);
      }}
      validate={validatorFunction}
      renderInput={(params: any) =>
        <TextField
          onBlur={() => setFieldTouched(field.name, true)}
          size={field.fullWidth ? 'medium' : 'small'} {...Object.assign(params, { error: !!(touched[field.name] && errors[field.name]) })} />}
      className='w-full' label={field.label} />
  </FormControl>

}
const UserSelectField = ({ field, context }: UserFieldProps) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } = context ? React.useContext(context) : useFormValue();

  const validatorFunction = React.useMemo(() => Validators.factory(field).select(), [field]);

  return <FormControl className='w-full'
    error={!!(touched[field.name] && errors[field.name]) as boolean}
    size={field.fullWidth ? 'medium' : 'small'}>
    <InputLabel>{field.label}</InputLabel>
    <Field
      className='w-full'
      as={Select}
      validate={validatorFunction}
      label={field.label}
      name={field.name}>
      {field.options.map(option => <MenuItem value={option}>{option}</MenuItem>)}
      <MenuItem value={''}><pre>wyczyść</pre></MenuItem>
    </Field>
  </FormControl>
}
const UserTextField = ({ field, context }: UserFieldProps) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } = context ? React.useContext(context) : useFormValue();

  const validatorFunction = React.useMemo(() => Validators.factory(field).text(), [field]);

  return <>
    <Field validate={validatorFunction}
      size={field.fullWidth ? 'medium' : 'small'} label={field.label} placeholder={field.placeholder} helperText={field.hint}
      className='w-full' as={TextField} name={field.name} error={!!(touched[field.name] && errors[field.name]) as boolean} />
  </>
}


export default UserField;

