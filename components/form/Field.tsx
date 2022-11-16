import styled from '@emotion/styled';
import { Help, InputOutlined, SelectAll } from '@mui/icons-material';
import { FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Tooltip } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { ErrorMessage, FastField as Field, getIn } from 'formik';
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

  disabled?: boolean,
  formDescription: FormDescription,

  fragmentCondition?: Expression<Condition, OperatorCondition>
}

/**
 * Make sure the field is a child to formik!
*/
const UserField = ({ element, fullWidth, display, context, formDescription, listIndex, fragmentCondition }: FieldProps<FieldDescription>): JSX.Element => {
  const FieldWrapper = styled.span`
    ${element.fullWidth ? 'flex: 1; min-width: 100%;' : 'width: 49%; max-width: 49%;'}
    @media (max-width: 700px) {
      width: 100%;
      max-width: 100%;
    }
    ${fullWidth ? 'min-width: 100%;' : ''}
  `

  const topData = useTopLevelFormData();
  const { values, setFieldTouched } = useFormValue();
  const [disabled, setDisabled] = React.useState<boolean>(false);

  const variable = React.useMemo(() => Evaluate.getNames(formDescription).find(item => item.name === element.name), [element.name]);
  const name = React.useMemo(() =>
    (listIndex != null && variable?.list != null) ? `${formDescription[variable.list].name}[${listIndex}].${element.name}` : element.name,
    [listIndex]
  );

  React.useEffect(() => {
    setFieldTouched(name, false);
  }, [disabled])

  React.useEffect(() => {
    setDisabled(
      formDescription ?
        !Evaluate.sequence({
          components: [
            element.condition,
            fragmentCondition?.components?.length ? fragmentCondition : { variable: null, comparator: null, value: { type: null, value: null }, simpleValue: true }
          ]
          , operators: ['&']
        }, values, formDescription ?? [], listIndex ?? undefined).condition()
        : false
    )
  }, [values, formDescription, listIndex]);


  const TypedField = (disabled: boolean) => {
    if (element.type === 'date')
      return <UserDateField {...{ element, display, context, formDescription, fragmentCondition, disabled, listIndex }} />
    else if (element.type === 'select')
      return <UserSelectField {...{ element, display, context, formDescription, fragmentCondition, disabled, listIndex }} />
    else return <UserTextField {...{ element, display, context, formDescription, fragmentCondition, disabled, listIndex }} />
  }

  return React.useMemo(() => <FieldWrapper className='flex w-full flex-col items-start  mb-4'>
    {TypedField(disabled)}
    {!disabled
      ? <ErrorMessage name={name}>{ErrorMessageCallback}</ErrorMessage>
      : null
    }
  </FieldWrapper>, [disabled])
}



const UserDateField = ({ element, display, formDescription, fragmentCondition, disabled, listIndex }: FieldProps<FieldDescription>) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } = useFormValue();

  const validatorFunction = React.useCallback(Validators.factory(element).date(), [element, disabled]);
  const variable = React.useMemo(() => Evaluate.getNames(formDescription).find(item => item.name === element.name), [element.name]);
  const name = React.useMemo(() =>
    (listIndex != null && variable?.list != null) ? `${formDescription[variable.list].name}[${listIndex}].${element.name}` : element.name,
    [listIndex]
  );


  return <FormControl className='w-full' size={element.fullWidth ? 'medium' : 'small'}>
    <Field as={DatePicker}
      name={name}
      id={name}
      disabled={disabled}
      maxDate={element.max ? new Date(element.max) : undefined}
      minDate={element.min ? new Date(element.min) : undefined}
      defaultValue={!display ? null : values[element.name]}
      onChange={(date: Date) => {
        setFieldValue(name, date);
      }}
      validate={!display && !disabled ? validatorFunction : undefined}
      InputAdornmentProps={{
        position: "start",
        className: 'pl-0.5'
      }}
      renderInput={(params: any) =>
        <TextField
          onBlur={() => setFieldTouched(element.name, true)}
          size={element.fullWidth ? 'medium' : 'small'} {...Object.assign(params, { error: !!(getIn(touched, name) && getIn(errors, name) && !disabled) })} />}
      className='w-full flex flex-row-reverse' label={element.label} />
  </FormControl>

}
const UserSelectField = ({ element, display, formDescription, fragmentCondition, disabled, listIndex }: FieldProps<FieldDescription>) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } = useFormValue();

  const validatorFunction = React.useCallback(Validators.factory(element).select(), [element, disabled]);
  const variable = React.useMemo(() => Evaluate.getNames(formDescription).find(item => item.name === element.name), [element.name]);
  const name = React.useMemo(() =>
    (listIndex != null && variable?.list != null) ? `${formDescription[variable.list].name}[${listIndex}].${element.name}` : element.name,
    [listIndex]
  );

  return <FormControl className='w-full'
    error={!!(getIn(touched, name) && getIn(errors, name) && !disabled) as boolean}
    disabled={disabled}
    size={element.fullWidth ? 'medium' : 'small'}>

    <InputLabel>{element.label}</InputLabel>
    <Field
      className='w-full'
      as={Select}
      disabled={disabled}
      validate={!display && !disabled ? validatorFunction : undefined}
      label={element.label}
      name={name}
      startAdornment={
        <InputAdornment position='start'>
          {element.hint
            ? <Tooltip title={element.hint}><Help color={!!(getIn(touched, name) && getIn(errors, name) && !disabled) ? 'error' : 'inherit'} /></Tooltip>
            : <SelectAll color={!!(getIn(touched, name) && getIn(errors, name) && !disabled) ? 'error' : 'inherit'} />
          }
        </InputAdornment>
      }

      id={name}

    >
      {element.options.map(option => <MenuItem value={option}>{option}</MenuItem>)}
      <MenuItem value={''}><pre>wyczyść</pre></MenuItem>
    </Field>
  </FormControl>
}
const UserTextField = ({ element, display, formDescription, fragmentCondition, disabled, listIndex }: FieldProps<FieldDescription>) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } = useFormValue();

  const validatorFunction = React.useCallback(Validators.factory(element).text(), [element, disabled])
  const variable = React.useMemo(() => Evaluate.getNames(formDescription).find(item => item.name === element.name), [element.name]);
  const name = React.useMemo(() =>
    (listIndex != null && variable?.list != null) ? `${formDescription[variable.list].name}[${listIndex}].${element.name}` : element.name,
    [listIndex]
  );


  return <>
    <Field validate={!display && !disabled ? validatorFunction : undefined} disabled={disabled}
      size={element.fullWidth ? 'medium' : 'small'}
      InputProps={{
        startAdornment:
          <InputAdornment position='start'>
            {element.hint
              ? <Tooltip title={element.hint}><Help color={!!(getIn(touched, name) && getIn(errors, name) && !disabled) ? 'error' : 'inherit'} /></Tooltip>
              : <InputOutlined color={!!(getIn(touched, name) && getIn(errors, name) && !disabled) ? 'error' : 'inherit'} />
            }
          </InputAdornment>
      }}
      id={name}
      label={element.label} placeholder={element.placeholder}
      className='w-full' as={TextField} name={name} error={!!(getIn(touched, name) && getIn(errors, name) && !disabled) as boolean} />
  </>
}


export default UserField;

