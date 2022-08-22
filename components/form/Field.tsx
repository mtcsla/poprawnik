import styled from '@emotion/styled';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { ErrorMessage, Field } from 'formik';
import React from 'react';
import { FormikContextValue, useFormValue } from '../../pages/forms/[id]/form';
import { FieldDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { ErrorMessageCallback } from '../form-edit/FieldEditor';

export type UserFieldProps = {
  field: FieldDescription,
  fullWidth?: true,
  display?: true,
}

/**
 * Make sure the field is a child to formik!
*/
const UserField = ({ field, fullWidth, display }: UserFieldProps): JSX.Element => {
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
      return <UserDateField {...{ field, display }} />
    else if (field.type === 'select')
      return <UserSelectField {...{ field }} />
    else return <UserTextField {...{ field }} />
  }, []
  )

  return <FieldWrapper className='flex w-full flex-col items-start  mb-4'>
    {TypedField}
    <ErrorMessage name={field.name}>{ErrorMessageCallback}</ErrorMessage>
  </FieldWrapper>
}


interface FieldProps extends FormikContextValue { field: FieldDescription };
const UserDateField = ({ field, display }: UserFieldProps) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } = useFormValue();

  return <FormControl className='w-full' size={field.fullWidth ? 'medium' : 'small'}>
    <Field as={DatePicker}
      name={field.name}
      maxDate={field.max ? new Date(field.max) : undefined}
      minDate={field.min ? new Date(field.min) : undefined}
      value={display ? null : values[field.name]}
      onChange={(date: Date) => setFieldValue(field.name, date)}
      validate={(date: Date) => {
        if (field.required)
          if (!date)
            return 'To pole jest wymagane.';
        return null
      }}
      renderInput={(params: any) =>
        <TextField
          size={field.fullWidth ? 'medium' : 'small'} {...Object.assign(params, { error: touched[field.name] && errors[field.name] })} />}
      className='w-full' label={field.label} />
  </FormControl>

}
const UserSelectField = ({ field }: UserFieldProps) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } = useFormValue();

  return <FormControl className='w-full'
    error={(touched[field.name] && errors[field.name]) as boolean}
    size={field.fullWidth ? 'medium' : 'small'}>
    <InputLabel>{field.label}</InputLabel>
    <Field
      className='w-full'
      as={Select}
      validate={(value: string) => !value ? 'To pole jest wymagane.' : null}
      label={field.label}
      name={field.name}>
      {field.options.map(option => <MenuItem value={option}>{option}</MenuItem>)}
      <MenuItem value={''}><pre>wyczyść</pre></MenuItem>
    </Field>
  </FormControl>
}
const UserTextField = ({ field }: UserFieldProps) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } = useFormValue();
  return <>
    <Field validate={(value: string) => {
      if (field.required)
        if (!value)
          return 'To pole jest wymagane.'

      const parser = field.numberType === 'real' ? parseFloat : parseInt

      const min = field.min ? parser((field.min as string).replaceAll(',', '.')) : -1000000000000000000000000000000000000000000000;
      const max = field.max ? parser((field.max as string).replaceAll(',', '.')) : 1000000000000000000000000000000000000000000000;

      if (values.numberType === 'real') {
        if (!value.match(/^\-?[1-9][0-9]*[,.]?[0-9]+$/) && !value.match(/^\-?[1-9][0-9]*$/))
          return 'To pole musi zawierać poprawną liczbę rzeczywistą lub całkowitą.'
      }
      else if (!value.match(/^\-?[1-9][0-9]*$/))
        return 'To pole musi zawierać poprawną liczbę całkowitą.'

      if (parser(value) < min)
        return `Wartość pola musi być większa od ${min}.`
      if (parser(value) > max)
        return `Wartość pola muse być mniejsza od ${max}.`

      return null;
    }
    } size={field.fullWidth ? 'medium' : 'small'} label={field.label} placeholder={field.placeholder} helperText={field.hint}

      className='w-full' as={TextField} name={field.name} error={touched[field.name] && errors[field.name]} />
  </>
}


export default UserField;