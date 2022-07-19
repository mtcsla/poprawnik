import { FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';
import { FieldDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { ErrorMessageCallback } from '../form-edit/FieldEditor';
const EditorField = ({ field, editor }: { field: FieldDescription, editor?: boolean }) => {
  const [editorTouched, setEditorTouched] = React.useState<boolean>(false);
  const [value, setValue] = React.useState('');
  const [dateValue, setDateValue] = React.useState<Date | null>(null);


  return <>
    <div className='w-full flex items-start'>

      <span className={(field.fullWidth ? 'min-w-full ' : '') + 'flex-col flex flex-1'}>

        {field.type === 'text' ? <TextField
          helperText={field.hint}
          label={field.label}
          className='w-full'
          placeholder={field.placeholder}
          size={field.fullWidth ? 'medium' : 'small'}

          onBlur={() => setEditorTouched(true)}

          value={value}
          error={(!value && editorTouched && field.required) as boolean}
          onChange={e => setValue(e.target.value)}
        /> :
          field.type === 'date' ?
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker value={dateValue} label={field.label} onChange={value => setDateValue(value as Date)}
                renderInput={(params) =>
                  <TextField onBlur={() => setEditorTouched(true)}
                    helperText={field.hint} size={field.fullWidth ? 'medium' : 'small'} {...Object.assign(params, { error: !dateValue && editorTouched && field.required })} />}
              />
            </LocalizationProvider>
            : field.type === 'select' ?
              <FormControl size={field.fullWidth ? 'medium' : 'small'} error={!value && editorTouched && field.required}>

                <InputLabel>{field.label}</InputLabel>
                <Select placeholder='wybierz...' onBlur={() => setEditorTouched(true)} onChange={(value) => setValue(value.target?.value as string)} label={field.label}>
                  {field.options.map((option) =>
                    <MenuItem value={option}>{option}</MenuItem>)
                  }
                </Select>
                {field.hint ?
                  <FormHelperText>{field.hint}</FormHelperText>
                  : null
                }

              </FormControl> : null
        }{field.type !== 'date' ?
          (!value && editorTouched && field.required ?
            ErrorMessageCallback('To pole jest wymagane.')
            : null
          ) :
          (!dateValue && editorTouched && field.required ?
            ErrorMessageCallback('To pole jest wymagane.')
            : null
          )
        }
        {!field.required ? <p className='text-xs w-full text-slate-500 text-right'>Pole opcjonalne.</p> : null}
      </span>

      {
        !field.fullWidth && editor ?
          <>
            <div className='w-4' />
            <div className='flex-1 h-10 bg-slate-50 rounded border' />
          </> : null
      }
    </div>
  </>
}

export default EditorField;
