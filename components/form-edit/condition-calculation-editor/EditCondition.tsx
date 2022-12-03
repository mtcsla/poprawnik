import { Button, ButtonGroup, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Field, Formik } from 'formik';
import { isDate } from 'mathjs';
import React from 'react';
import BodyScrollLock from '../../../providers/BodyScrollLock';
import { FieldType, FieldValueType, NameType, useFormDescription, valueTypeToPolish } from '../../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { useTemplateDescription } from '../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { useListSteps } from '../../template-edit/TemplateEditor';
import { Evaluate } from '../../utility/Evaluate';
import { useFormEditorLocation } from '../FormEditor';
import { ConditionCalculationDisplay } from './ConditionCalculationDisplay';
import { comparatorsForNotRequiredValuesPolish, comparatorsPolish, comparatorsText, Condition, ConditionCalculationSequence, getEmptyCondition, useSequence } from './ConditionCalculationEditorProvider';
import { EditNumberValue } from "./EditNumberValue";



export const EditCondition = ({ path, add, cancel, initValue }: { path: number[]; add?: true; cancel: () => void; initValue?: Condition; }) => {

  const formDescription = useFormDescription();
  const templateDescription = useTemplateDescription();

  const { location } = useFormEditorLocation();
  const [step, fragment, field] = location as [number, number, number];
  const { sequence, modifySequence } = useSequence();

  const isInTemplate = React.useMemo(() => { return !!templateDescription.form.length }, [templateDescription])
  const { description, names } = React.useMemo(() => {
    if (isInTemplate) {
      return { description: templateDescription.form, names: Evaluate.getNames(templateDescription.form) as NameType[] };
    }
    else return { description: formDescription.description, names: formDescription.names }
  }, [formDescription, templateDescription])

  const listSteps = useListSteps();

  const [valueEditorOpen, setValueEditorOpen] = React.useState(false);

  const globalVariableNames = React.useMemo(() => names.filter(item =>
    (isInTemplate
      ? true
      : (item.step < step || (item.step === step && item.fragment < fragment))
    )
    && item.list == null
    && !item.name.endsWith('~')
  ).map((item) => <MenuItem value={item.name} className='flex items-center justify-between'>
    <Chip color='info' label={item.name} /> {valueTypeToPolish(item.valueType)}
  </MenuItem>), [names, step, fragment]);

  const listVariableNames = React.useMemo(() =>
    names.filter(
      isInTemplate
        ? item => listSteps.includes(item.list != null ? item.list : -1)
        : item => item.list === step && item.fragment < fragment
    ).map((item) => <MenuItem value={item.name} className='flex items-center justify-between'>
      <Chip color='error' label={item.name} /> {valueTypeToPolish(item.valueType)}
    </MenuItem>), [names, step, fragment]);

  const listNames = React.useMemo(() => description.filter(
    (item, index) => item.type === 'list' && (isInTemplate ? true : index < step)
  ).map((item, index) => <MenuItem value={`${item.name}~`} className='flex items-center justify-between'>
    <span className='inline-flex gap-3 items-center'>
      długość listy <Chip color='warning' label={item.name} />
    </span>
    liczba
  </MenuItem>
  ), [description.length, step]);

  const emptyList = <MenuItem disabled><pre>brak</pre></MenuItem>;


  return <Dialog scroll="body" open>
    <DialogTitle>
      <pre className='text-sm'>{!add ? 'Edytujesz' : 'Dodajesz'} warunek</pre>
      <p className='text-sm'>Edytuj ten prosty warunek...</p>
    </DialogTitle>

    <Formik initialValues={initValue ?? getEmptyCondition()} onSubmit={() => { }}>
      {({ values, setFieldValue, setValues }) => {
        const save = (value?: Condition) => {
          delete values.simpleValue;
          if (add) {
            modifySequence(['add_element', [path, value ?? values]]);
          } else {
            modifySequence(['set_element', [path, value ?? values]]);
          }
          cancel();
        };

        const [loaded1, setLoaded1] = React.useState<boolean>(false);
        const [loaded2, setLoaded2] = React.useState<boolean>(false);


        const variableType = React.useMemo((): FieldType => {
          if (values.variable?.endsWith('Length~'))
            return 'text';
          return names.find(name => values.variable === name.name)?.type ?? 'text' as FieldType;
        }, [values.variable]);
        const variableOptions = React.useMemo((): string[] => {
          if (values.variable?.endsWith('Length~'))
            return [];
          return names.find(name => values.variable === name.name)?.options ?? [] as string[];
        }, [values.variable]);
        const variableValueType = React.useMemo((): FieldValueType => {
          if (values.variable?.endsWith('Length~'))
            return 'number';
          return names.find(name => values.variable === name.name)?.valueType ?? 'number' as FieldValueType;
        }, [values.variable]);
        const variableRequired = React.useMemo((): boolean => {
          if (values.variable?.endsWith('~'))
            return true;
          return names.find(name => values.variable === name.name)?.required ?? false as boolean;
        }, [values.variable]);

        React.useEffect(
          () => {
            if (loaded1) { setFieldValue('comparator', null); setFieldValue('value', getEmptyCondition().value); } else
              setLoaded1(true);
          }, [values.variable]
        );
        React.useEffect(
          () => {
            if (loaded2)
              setFieldValue('value', getEmptyCondition().value); else
              setLoaded2(true);
          }, [values.comparator]
        );

        return <>
          <DialogContent className='inline-flex gap-2 flex-col pt-2' style={{ minWidth: 450, maxWidth: 450 }}>
            <p className='text-sm text-slate-600'>wartośc prawdziwa, gdy: </p>
            <FormControl>
              <InputLabel>pierwszy argument</InputLabel>
              <Field as={Select} name='variable' label='pierwszy składnik' className='flex justify-between'>
                <MenuItem disabled className='opacity-100'>Listy</MenuItem>
                {listNames.length ? listNames : emptyList}
                <MenuItem disabled className='opacity-100'>Zmienne globalne</MenuItem>
                {globalVariableNames.length ? globalVariableNames : emptyList}
                <MenuItem disabled className='opacity-100'>Zmienne listowe</MenuItem>
                {listVariableNames.length ? listVariableNames : emptyList}
              </Field>
            </FormControl>
            <FormControl>
              <InputLabel>operator</InputLabel>
              <Field disabled={!values.variable} name='comparator' as={Select} className='min-w-0' label='operator'>
                <MenuItem disabled className='opacity-100'>Cechy wartości</MenuItem>
                {comparatorsForNotRequiredValuesPolish.map(([id, label, hint]) => <MenuItem disabled={variableRequired} value={id}>
                  <span className='flex items-center justify-between w-full'>
                    <Chip color='primary' className='mr-2' label={label} />
                    {hint}
                  </span>
                </MenuItem>
                )}
                <MenuItem disabled className='opacity-100'>Porównywanie wartości</MenuItem>
                {comparatorsPolish.map(([id, label, hint]) => <MenuItem disabled={variableValueType === 'text' && !comparatorsText.includes(id)} value={id}>
                  <span className='flex items-center justify-between w-full'>
                    <Chip color='secondary' className='mr-2' label={label} />
                    {hint}
                  </span>
                </MenuItem>
                )}
              </Field>
            </FormControl>
            {['exists', 'not-exists'].includes(values.comparator as string)
              ? null
              : <Button onClick={() => setValueEditorOpen(true)} disabled={!values.comparator} size='small' className='flex flex-col p-3 mt-0.5 rounded'>
                <p className='text-xs text-slate-500 self-start font-normal normal-case -mt-5 mb-1.5 bg-white px-1'>drugi argument</p>
                <p className='w-full text-left text-base text-slate-500 font-normal normal-case'>
                  {values.value.type === null || values.value.value === null
                    ? 'drugi argument'
                    : values.value.type === 'variable'
                      ? <span className='text-black flex items-center justify-between w-full'>

                        {(values.value.value as string).endsWith('~') ?
                          <>
                            <span className='inline-flex gap-3 items-center'>długość listy <Chip color='warning' label={(values.value.value as string).slice(0, -1)} /></span>
                            liczba
                          </> :
                          <>
                            <Chip className='mr-2' label={values.value.value} />
                            {valueTypeToPolish(variableValueType)}
                          </>}
                      </span>
                      : values.value.type === 'constant'
                        ? <span className='flex flex-col'><p className='text-xs text-slate-500'>wartość stała</p>
                          {isDate(values.value.value) ? (values.value.value as Date).toLocaleDateString('pl-PL') : values.value.value}
                        </span>
                        : <ConditionCalculationDisplay type='calculation' first sequence={values.value.value as ConditionCalculationSequence} />
                  }
                </p>
              </Button>}
            {valueEditorOpen ?
              <EditNumberValue inputType={variableType} options={variableOptions} initValue={values.value} type={variableValueType} cancel={() => setValueEditorOpen(false)}
                save={(values) => {
                  setFieldValue('value', values); setValueEditorOpen(false);
                }} />
              : null}
          </DialogContent>
          <DialogActions>
            <Button size='small' className='border-none'
              disabled={!values.variable || !values.value || !values.comparator} onClick={() => save()}>Gotowe</Button>
            <Button size='small' className='border-none' color='error' onClick={cancel}>Anuluj</Button>
          </DialogActions>

          <DialogContent>
            <BodyScrollLock>
              <p className='text-sm font-semibold'>...lub wybierz prostą wartość logiczną:</p>
              <p className='text-xs text-slate-500 mb-4' style={{ maxWidth: 350 }}>wybranie prostej wartości wymaże wartości wprowadzone w pola prostego warunku</p>

              <ButtonGroup className='w-full'>
                <Button className='flex-1 rounded-l' onClick={() =>
                  save({ variable: null, comparator: null, value: { type: null, value: null }, simpleValue: true })
                }>prawda</Button>
                <Button onClick={() =>
                  save({ variable: null, comparator: null, value: { type: null, value: null }, simpleValue: false })
                } className='flex-1 rounded-r'>fałsz</Button>
              </ButtonGroup>
            </BodyScrollLock>
          </DialogContent>

        </>;
      }}
    </Formik>

  </Dialog>;
};
