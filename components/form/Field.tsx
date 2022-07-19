import { TextField } from '@mui/material';
import { Field } from 'formik';
import { FieldDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';

export type UserFieldProps = {
  field: FieldDescription,
  values: { [key: string]: string | Date | number }
  errors: { [key: string]: string | null }
  touched: { [key: string]: boolean }
}
/**
 * Make sure the field is a child to formik!
*/
const UserField = ({ field, values, errors, touched }: UserFieldProps): JSX.Element => {
  const TypedField = () => {
    if (field.type === 'date')
      return <UserDateField {...{ field, values, errors, touched }} />
    else if (field.type === 'select')
      return <UserSelectField {...{ field, values, errors, touched }} />
    else return <UserTextField {...{ field, values, errors, touched }} />
  }

  return <span className='flex w-full flex-col items-start  mb-4' style={field.fullWidth ? { flex: 1, minWidth: '100%' } : { width: '49%' }}>
    <TypedField />
  </span>
}


const UserDateField = ({ field, values, errors, touched }: UserFieldProps) => {
  return <>
  </>
}
const UserSelectField = ({ field, values, errors, touched }: UserFieldProps) => {
  return <> </>
}
const UserTextField = ({ field, values, errors, touched }: UserFieldProps) => {
  return <>
    <Field size={field.fullWidth ? 'medium' : 'small'} label={field.label} placeholder={field.placeholder} helperText={field.hint}
      className='w-full' as={TextField} name={field.name} error={touched[field.name] && errors[field.name]} />
  </>
}


export default UserField;