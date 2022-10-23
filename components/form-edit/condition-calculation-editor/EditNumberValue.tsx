import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Field, Formik } from 'formik';
import React from 'react';
import { existsContext } from '../../../pages/account/lawyer/edit-document/template';
import { FieldType, FieldValueType, NameType, useFormDescription, valueTypeToPolish } from '../../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { useTemplateDescription } from '../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { useTemplateEditorContextForConditionsAndCalculations } from '../../template-edit/TemplateEditor';
import { Evaluate } from '../../utility/Evaluate';
import { useFormEditorLocation } from '../FormEditor';
import { ConditionCalculationDisplay } from './ConditionCalculationDisplay';
import ConditionCalculationEditor, { ConditionCalculationSequence, ConditionValue } from './ConditionCalculationEditorProvider';



export const EditNumberValue = ({ type, inputType, save, cancel, initValue, nested, options }: {
  type: FieldValueType;
  inputType?: FieldType;
  options?: string[];
  initValue: ConditionValue;
  save: (value: ConditionValue) => void;
  cancel: () => void;
  nested?: true
}) => {

  const formDescription = useFormDescription();
  const templateDescription = useTemplateDescription();


  const isInTemplate = React.useMemo(() => !!templateDescription.description.length, [templateDescription, formDescription])
  const listIndex = useTemplateEditorContextForConditionsAndCalculations();
  const allowedNotRequired = React.useContext(existsContext);

  const { description, names } = React.useMemo(() => {
    if (isInTemplate)
      return {
        description: templateDescription.form,
        names: Evaluate.getNames(templateDescription.form) as NameType[]
      }
    else return {
      description: formDescription.description,
      names: formDescription.names
    }
  }, [templateDescription, formDescription])

  const { location } = useFormEditorLocation();
  const [step, fragment, field] = location as [number, number, number];

  const [editingCalcualtion, setEditingCalculation] = React.useState<boolean>(false);

  const globalVariableNames = React.useMemo(() => names.filter(item =>
    (!isInTemplate ? (item.step < step || (item.step === step && item.fragment < fragment)) : true)
    && item.list == null && item.valueType === type && !item.name.endsWith('~') && ((item.required && !item.fragmentConditional && !item?.condition?.components?.length) || allowedNotRequired.includes(item.name))
  ).map((item) => <MenuItem value={item.name} className='flex items-center justify-between'>
    <Chip color='info' label={item.name} /> {valueTypeToPolish(item.valueType)}
  </MenuItem>), [names, step, fragment, isInTemplate]);

  const listVariableNames = React.useMemo(() => names.filter(item =>
    (item.list === (listIndex ?? step) && (isInTemplate ? true : item.fragment < fragment)) && item.valueType === type && ((item.required && !item.fragmentConditional && !item?.condition?.components?.length) || allowedNotRequired.includes(item.name))
  ).map((item) => <MenuItem value={item.name} className='flex items-center justify-between'>
    <Chip color='error' label={item.name} /> {valueTypeToPolish(item.valueType)}
  </MenuItem>), [names, step, fragment, isInTemplate]);

  const listNames = React.useMemo(() => description.filter(
    (item, index) => item.type === 'list' && (isInTemplate ? true : index < step)
  ).map((item, index) => <MenuItem value={`${item.name}~`} className='flex items-center justify-between'>
    <span className='inline-flex gap-3 items-center'>
      długość listy <Chip color='warning' label={item.name} />
    </span>
    liczba
  </MenuItem>
  ), [description.length, step, isInTemplate]);

  const emptyList = <MenuItem disabled><pre>brak</pre></MenuItem>;

  return <Dialog open>
    <DialogTitle>
      <pre className='text-sm'>Edytujesz wartość</pre>
      <p className='text-sm'>Wybierz rodzaj wartości oraz wartość.</p>
    </DialogTitle>
    <Formik initialValues={initValue} onSubmit={() => { }}>
      {({ values, setFieldValue }) => {

        const [loaded, setLoaded] = React.useState(false);
        React.useEffect(() => {
          if (loaded)
            setFieldValue('value', null);
          else
            setLoaded(true);
        }, [values.type]);

        return <>
          <DialogContent style={{ minWidth: 475, maxWidth: 475 }} className='pt-2 inline-flex flex-col gap-3'>

            <FormControl>
              <InputLabel>rodzaj wartości</InputLabel>
              <Field as={Select} name='type' label='rodzaj wartości' className='flex justify-between'>
                <MenuItem value='variable'>zmienna</MenuItem>
                <MenuItem value='constant'>stała</MenuItem>
                <MenuItem value='calculation' disabled={nested || type != 'number'}>obliczenia</MenuItem>
              </Field>
            </FormControl>

            {values.type === 'variable'
              ? <FormControl>
                <InputLabel>zmienna</InputLabel>
                <Field value={values.value} as={Select} name='value' label='zmienna' className='flex justify-between'>
                  {type === 'number'
                    ?
                    [<MenuItem disabled className='opacity-100'>Listy</MenuItem>].concat(
                      listNames.length ? listNames : emptyList)
                    : null}
                  <MenuItem disabled className='opacity-100'>Zmienne globalne</MenuItem>
                  {globalVariableNames.length ? globalVariableNames : emptyList}
                  {(!isInTemplate ? description[step].type === 'list' : listIndex != null && listIndex >= 0)
                    ?
                    [
                      <MenuItem disabled className='opacity-100'>Zmienne listowe</MenuItem>
                    ].concat(listVariableNames.length ? listVariableNames : emptyList)
                    : null}
                </Field>
              </FormControl>
              : values.type === 'constant'
                ? inputType === 'select' && options
                  ?
                  <>
                    <FormControl>
                      <InputLabel>stała</InputLabel>
                      <Field as={Select} value={values.value} name='value' label='stała' >
                        {options.map(option => <MenuItem value={option}>{option}</MenuItem>)}
                      </Field>
                    </FormControl>
                  </>
                  : <Field as={type === 'date' ? DatePicker : TextField}
                    onChange={(value: any) => setFieldValue('value', type === 'date' ? value : value.target.value)}
                    value={values.value}
                    label='stała'
                    placeholder={`wprowadź ${type === 'text'
                      ? 'tekst'
                      : type == 'number'
                        ? 'liczbę'
                        : 'datę'}`} name='value'
                    renderInput={type === 'date' ? (props: any) => <TextField {...props} /> : undefined}
                  />
                : values.type
                  ? <>
                    {
                      !(values.value as ConditionCalculationSequence)?.components?.length
                        ? <div className='rounded border p-3.5'><pre>Brak</pre></div>
                        : <ConditionCalculationDisplay type='calculation' first sequence={values.value as ConditionCalculationSequence} />
                    }
                    <Button onClick={() => setEditingCalculation(true)} className='self-end border-none' size='small'>zmień</Button>
                    {
                      editingCalcualtion
                        ? <ConditionCalculationEditor
                          initValue={values.value as ConditionCalculationSequence}
                          type='calculation'
                          exit={() => setEditingCalculation(false)}
                          save={calculation => { setFieldValue('value', calculation); setEditingCalculation(false) }}

                        />
                        : null
                    }
                  </>
                  : <TextField disabled placeholder='wartość' />}
          </DialogContent>
          <DialogActions>
            <Button size='small' className='border-none' disabled={!values.type || !values.value || (values.type === 'constant' && type === 'date' && isNaN((values.value as Date)?.getSeconds()))} onClick={() => save(values)}>Gotowe</Button>
            <Button size='small' className='border-none' color='error' onClick={cancel}>Anuluj</Button>
          </DialogActions>
        </>;
      }}
    </Formik>
  </Dialog>;
};
