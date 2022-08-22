import { ArrowBack, Delete, Edit, List } from "@mui/icons-material";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Snackbar, TextField } from '@mui/material';
import { DatePicker } from "@mui/x-date-pickers";
import { ErrorMessage, Field, Formik } from "formik";
import { cloneDeep } from 'lodash';
import { useRouter } from "next/router";
import React from "react";
import { FieldDescription, getDefaultField, useFormDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import EditorField from "../form/EditorField";
import { ConditionCalculationDisplay } from "./condition-calculation-editor/ConditionCalculationDisplay";
import ConditionEditor from "./condition-calculation-editor/ConditionCalculationEditorProvider";
import { FormNormalize } from "./condition-calculation-editor/normalizers/FormNormalize";
import { useFormEditorLocation } from './FormEditor';

const FieldEditor = () => {
  const { modifyDescription, description, names } = useFormDescription();

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false);
  const [newOptionDialogOpen, setNewOptionDialogOpen] = React.useState<boolean>(false);
  const [editingCondition, setEditingCondition] = React.useState<boolean>(false);

  const [newOption, setNewOption] = React.useState<string>('');
  const [errorOpen, setErrorOpen] = React.useState<boolean>(false);

  const { location } = useFormEditorLocation();
  const [step, fragment, field] = location;

  const router = useRouter();

  const fieldDescription = description[step as number].children[fragment as number].children[field as number]
  const deleteField = () => {
    const newDescription = cloneDeep(description);
    modifyDescription(['form_set_description', FormNormalize.conditions(newDescription, location, true)]);
    router.back();
  }

  const alertError = () => {
    setErrorOpen(true);
    setTimeout(() => setErrorOpen(false), 5000)
  }
  const cancel = () => {
    router.back()
  }

  React.useEffect(() => {
    if (router.isReady) {
      if (router.query.new == '1' && fieldDescription) {
        const newQuery = cloneDeep(router.query);
        delete newQuery.new
        router.replace({ pathname: router.pathname, query: newQuery })
      }
    }
  }, [router.isReady])

  return <Formik initialValues={
    fieldDescription ||
    getDefaultField() as FieldDescription
  } onSubmit={(values, actions) => {
    if (!fieldDescription && router.query.new == '1')
      modifyDescription(['fragment_append_field', [step as number, fragment as number, values]]);
    else {
      modifyDescription(['field_set', [step as number, fragment as number, field as number, values]]);
    }
    router.back();
  }} validateOnChange>
    {({ values, errors, touched, isValid, submitForm, setFieldValue, setFieldTouched }) => {
      return <div
        style={{ zIndex: 70 }}
        className="mount flex fixed top-0 left-0 w-screen h-screen bg-white"
      >
        <Snackbar open={errorOpen} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert color={'error'} >
            Wypełnij wszystkie pola poprawnie.
          </Alert>
        </Snackbar>
        <Dialog open={dialogOpen}>
          <DialogTitle><pre className="text-sm">Anulujesz {router?.query?.new == '1' ? 'dodawanie' : 'edycję'} pola</pre></DialogTitle>
          <DialogContent>
            Pole nie zostanie {router?.query?.new == '1' ? 'dodane' : 'zmienione'}. Wszystkie zmiany zostaną utracone.
          </DialogContent>
          <DialogActions>
            <Button className="border-none" size='small' onClick={cancel}>Ok</Button>
            <Button className="border-none" size='small' color='error' onClick={() => setDialogOpen(false)}>Wróć</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={newOptionDialogOpen}>
          <DialogTitle><pre className="text-sm">Dodajesz opcję</pre></DialogTitle>
          <DialogContent>
            <div className="w-full pt-3" style={{ minWidth: 250 }}>
              <TextField size='small' className="w-full" onChange={(e) => setNewOption(e.target.value)} label='treść opcji' placeholder="np. 'tak', 'nie', itp." />
            </div>
          </DialogContent>

          <DialogActions>
            <Button disabled={!newOption.length} className="border-none" size='small' onClick={() => {
              setFieldValue('options', values.options.concat(newOption || ''));
              setNewOptionDialogOpen(false)
            }}>Dodaj</Button>
            <Button className="border-none" size='small' color='error' onClick={
              () => setNewOptionDialogOpen(false)
            }>Anuluj</Button>
          </DialogActions>

        </Dialog>
        <Dialog open={deleteDialogOpen}>
          <DialogTitle>
            <pre className="text-sm">
              Usuwasz pole
            </pre>
          </DialogTitle>
          <DialogContent className="text-sm">
            Pole zostanie usunięte. Wszelkie odwołania do tego pola w oblcizeniach oraz warunkach zostaną zamienione na wartość obojętną.
          </DialogContent>
          <DialogActions>
            <Button size='small' onClick={deleteField} className='mr-2 border-none'>
              OK
            </Button>
            <Button size='small' color='error' onClick={() => setDeleteDialogOpen(false)} className='border-none'>
              wróć
            </Button>
          </DialogActions>

        </Dialog>
        <div className="flex-1 h-full flex-col sm:p-8 md:p-12 justify-center flex">
          <EditorField editor field={values} />
          {values.type === 'select'
            ? <>
              <pre className={"mt-3 flex items-center" + (values.options.length < 2 ? ' text-red-500' : '')}><List className="mr-2" color={values.options.length < 2 ? 'error' : 'primary'} /> Opcje wyboru</pre>
              {
                values.options.length < 2 ?
                  <p className="text-red-500 text-sm">Pole wyboru musi mieć przynajmniej dwie opcje wyboru.</p>
                  : null

              }
              {!values.options.length ? <div className="h-14 p-4 flex items-center justify-center border bg-red-50 border-red-500 rounded-lg mt-2"><pre className="text-red-500">brak</pre></div>
                : values.options.map((option, index) =>
                  <div className="flex items-center mt-4 justify-between "><p><b className="inline mr-2 text-blue-500">{index + 1}</b>
                    <div className="inline p-2 pl-4 pr-4 rounded-lg border bg-slate-50">{option}</div>
                  </p>
                    <Button className="border-none">
                      <Delete color='error' onClick={() => setFieldValue('options', values.options.filter((v, i) => index != i))} />
                    </Button></div>
                )
              }
              <Button className='border-none self-end mt-2' size='small' onClick={() => { setNewOptionDialogOpen(true); setNewOption('') }}>Dodaj opcję wyboru</Button></>

            : null
          }
        </div>

        <div className="flex-1 sm:p-8 md:p-12 overflow-y-auto h-full bg-slate-50  border-l flex-col flex items-start ">
          <div className="flex flex-col w-full m-auto">
            <h1 className="flex items-center"><Edit color='primary' className="mr-2" />Edytujesz pole</h1>
            <p className="mb-8">Naciśnij 'gotowe' kiedy skończysz.</p>


            <div className="flex flex-col w-full">
              <Field as={TextField} error={errors.name && touched.name}
                placeholder={'np. imie_wnioskodawcy'}
                disabled={router?.query?.new != '1'}
                validate={
                  router?.query?.new != '1' ? () => null :
                    (value: string) => {
                      console.log(names);
                      if (!value)
                        return 'To pole jest wymagane.'
                      if (!value.match(/^[a-z_0-9]*$/))
                        return 'Dozwolone są tylko małe litery alfabetu łacińskiego, liczby oraz znak "_".'
                      return names.map(obj => obj.name).includes(value) ? 'Ta nazwa jest już w użyciu w tym formularzu.' : null;
                    }
                }
                name='name' label='nazwa pola' className="w-full bg-white" />
              <ErrorMessage name='name'>{ErrorMessageCallback}</ErrorMessage>
              <div className='flex mt-4 items-start w-full flex-wrap'>
                <FormControl size='small' className="flex-1">
                  <InputLabel>typ pola</InputLabel>
                  <Field
                    as={Select}
                    name='type'
                    disabled={router?.query?.new != '1'}
                    onChange={(e: { target: { value: string } }) => {
                      setFieldValue('valueType', null);
                      setFieldValue('numberType', null);

                      setFieldValue('min', '');
                      setFieldValue('max', '');

                      setFieldValue('type', e.target.value)
                    }} validate={(value: string) => !value ? 'To pole jest wymagane.' : null}
                    label='typ pola'
                    placeholder="wybierz..."
                    className="w-full bg-white"
                    size='small'>
                    <MenuItem value={'text'}>tekst</MenuItem>
                    <MenuItem value={'date'}>data</MenuItem>
                    <MenuItem value={'select'}>wybór</MenuItem>
                  </Field>
                </FormControl>
                <ErrorMessage name='type'>{ErrorMessageCallback}</ErrorMessage>
                <div className="w-4" />

                <span className="flex-1 flex flex-col">
                  <FormControl disabled={values.type !== 'text' || router?.query?.new != '1'} error={(errors.valueType && touched.valueType) as boolean} size='small' className="w-full">
                    <InputLabel>wartość pola</InputLabel>
                    <Field as={Select} variant='outlined'
                      disabled={values.type !== 'text' || router?.query?.new != '1'}
                      name='valueType'
                      defaultValue={null}
                      onChange={({ target }: { target: { value: string } }) => {
                        setFieldValue('valueType', target.value);
                        setFieldValue('numberType', null);
                        setFieldValue('min', '');
                        setFieldValue('max', '');
                      }}
                      validate={(value: string) => (!value && values.type === 'text') ? 'To pole jest wymagane.' : null}
                      label='wartość pola'
                      placeholder="wybierz..."
                      className="w-full bg-white" size='small' >
                      <MenuItem value={'text'}>tekst</MenuItem>
                      <MenuItem value={'number'}>liczba</MenuItem>
                    </Field>
                  </FormControl>
                  <ErrorMessage name='valueType'>{ErrorMessageCallback}</ErrorMessage>
                </span>
              </div>
              <div className='flex mt-4 items-start w-full flex-wrap'>

                <span className="flex flex-col flex-1">
                  <Field as={TextField} error={errors.label && touched.label}
                    validate={
                      (value: string) => !value ? 'To pole jest wymagane.' : null
                    }
                    label='tytuł pola'
                    name='label' className='bg-white' size='small'
                  />
                  <ErrorMessage name='label'>{ErrorMessageCallback}</ErrorMessage>
                </span>
                <div className="w-4" />
                <span className="flex flex-col flex-1">
                  <Field as={TextField}
                    disabled={values.type !== 'text'}
                    error={values.type === 'text' && errors.placeholder && touched.placeholder}
                    validate={
                      (value: string) => (!value && values.type === 'text') ? 'To pole jest wymagane.' : null
                    }
                    label='placeholder pola'
                    name='placeholder' className='bg-white' size='small'
                  />
                  <ErrorMessage name='placeholder'>{ErrorMessageCallback}</ErrorMessage>
                </span>
              </div>



              <span className="flex-1 flex flex-col">
                <Field as={TextField} error={errors.description && touched.description}
                  label='krótki opis pola'
                  placeholder="np. Imię i nazwisko wnioskodawcy."
                  name='description' className='bg-white mt-4' size='small'
                  validate={(value: string) => !value ? 'To pole jest wymagane.' : null}
                />
                <ErrorMessage name='description'>
                  {ErrorMessageCallback}
                </ErrorMessage>
              </span>

              <Field as={TextField} error={errors.hint && touched.hint}
                label='tekst wskazówki'
                name='hint' className='bg-white mt-4' size='small'
              />
              <p className="text-xs text-slate-500 self-end">Pole opcjonalne.</p>

              <FormControl disabled={values.valueType !== 'number'} error={(errors.numberType && touched.numberType) as boolean} size='small' className="w-full">
                <InputLabel>rodzaj liczby</InputLabel>
                <Field as={Select} variant='outlined'
                  disabled={values.valueType !== 'number'}
                  name='numberType'
                  defaultValue={null}
                  validate={values.valueType !== 'number'
                    ? () => { }
                    : (value: string) => (!value && values.type === 'text') ? 'To pole jest wymagane.' : null}
                  label='wartość pola'
                  placeholder="wybierz..."
                  className="w-full bg-white" size='small' >
                  <MenuItem value={'real'}>liczba rzeczywista</MenuItem>
                  <MenuItem value={'integer'}>liczba całkowita</MenuItem>
                </Field>
              </FormControl>
              <ErrorMessage name='numberType'>{ErrorMessageCallback}</ErrorMessage>

              {values.type === 'date'
                ? <span className="inline-flex mt-4 items-start gap-3">
                  <span className="flex-1">
                    <FormControl className='w-full' size={'small'}>
                      <Field as={DatePicker}
                        name='min'
                        value={values.min ? new Date(values.min) : null}
                        onChange={(date: Date) => setFieldValue('min', date.toString())}
                        renderInput={(params: any) =>
                          <TextField
                            size='small'
                            className="bg-white"
                            {...Object.assign(params, { error: touched['min'] && errors['min'] })}
                          />
                        }
                        className='w-full' label='wartość minimalna' />
                    </FormControl>
                  </span>
                  <span className="flex flex-col flex-1">
                    <Field as={DatePicker}
                      name='max'
                      value={values.max ? new Date(values.max) : null}
                      onChange={(date: Date) => setFieldValue('max', date.toString())}
                      validate={(date: string) => {
                        if (!date || !values.min)
                          return null;
                        if (new Date(values.min as string) >= new Date(date)) {
                          return 'Wartość maksymalna musi być większa od wartości minimalnej.'
                        }
                        return null
                      }}
                      renderInput={(params: any) =>
                        <TextField
                          onBlur={() => setFieldTouched('max', true)}
                          size='small'
                          className="bg-white"
                          {...Object.assign(params, { error: errors.max && touched.max })}
                        />
                      }
                      className='w-full' label='wartość maksymalna' />
                    <ErrorMessage name='max'>{ErrorMessageCallback}</ErrorMessage>
                  </span>
                </span>
                : <>

                  <span className="inline-flex items-start gap-3">
                    <span className="flex flex-col flex-1">
                      <Field as={TextField} disabled={!values.numberType || values.valueType !== 'number'} error={errors.min && touched.min}
                        label='wartość minimalna'
                        validate={
                          values.valueType !== 'number' || !values.numberType ? () => { } :
                            (value: string) => {
                              if (!value)
                                return null;
                              if (value === '0')
                                return null;
                              if (values.numberType === 'real') {
                                if (!value.match(/^\-?[1-9][0-9]*[,.]?[0-9]+$/) && !value.match(/^\-?[1-9][0-9]*$/))
                                  return 'To pole musi zawierać poprawną liczbę rzeczywistą lub całkowitą.'
                              }
                              else if (!value.match(/^\-?[1-9][0-9]*$/))
                                return 'To pole musi zawierać poprawną liczbę całkowitą.'
                              return null;
                            }
                        }
                        name='min' className='bg-white mt-4 flex-1' size='small'
                      />
                      <ErrorMessage name='min'>{ErrorMessageCallback}</ErrorMessage>
                      <p className="text-xs text-slate-500 self-end">Pole opcjonalne.</p>
                    </span>
                    <span className="flex flex-col flex-1">
                      <Field as={TextField} disabled={!values.numberType || values.valueType !== 'number'} error={errors.max && touched.max}
                        validate={
                          values.valueType !== 'number' || !values.numberType ? () => { } :
                            (value: string) => {
                              if (!value)
                                return null;
                              if (value === '0')
                                return null;
                              if (values.numberType === 'real') {
                                if (!value.match(/^\-?[1-9][0-9]*[,.]?[0-9]+$/) && !value.match(/^\-?[1-9][0-9]*$/))
                                  return 'To pole musi zawierać poprawną liczbę rzeczywistą lub całkowitą.'
                              }
                              else if (!value.match(/^\-?[1-9][0-9]*$/))
                                return 'To pole musi zawierać poprawną liczbę całkowitą.'

                              if (values.numberType === 'real'
                                ? parseFloat(value.replaceAll(',', '.')) <= parseFloat((values.min as string).replaceAll(',', '.'))
                                : parseInt(value.replaceAll(',', '.')) <= parseInt((values.min as string).replaceAll(',', '.'))
                              )
                                return 'Wartość maksymalna musi być większa od wartości minimalnej.'
                              return null;
                            }
                        }
                        label='wartość maksymalna'
                        name='max' className='bg-white mt-4 flex-1' size='small'
                      />
                      <ErrorMessage name='max'>{ErrorMessageCallback}</ErrorMessage>
                      <p className="text-xs text-slate-500 self-end">Pole opcjonalne.</p>
                    </span>
                  </span>
                </>}




              {/*<FormControlLabel className="mt-5" control={<Checkbox checked={values.required} onChange={(e, value) => { setFieldValue('required', value) }} name='required' />} label='Pole wymagane' />*/}
              <FormControlLabel control={<Checkbox name='fullWidth' checked={values.fullWidth} onChange={(e, value) => { setFieldValue('fullWidth', value) }} />} label='Pełna szerokość' />




              <span className="items-center mt-6 justify-between mb-4 flex w-full">
                <pre className="text-base" >Aktywne</pre>
                <div className="border-b flex-1 ml-4 mr-4" />
                <p className="uppercase text-sm font-bold">{!values.condition.components.length ? 'zawsze' : 'warunkowo'}</p>

              </span>

              {values.condition.components.length ?
                <ConditionCalculationDisplay first type='condition' sequence={values.condition} />
                : null
              }
              <Button onClick={() => setEditingCondition(true)} className="self-end mt-4 border-none p-0" size='small' >Zmień</Button>
              {editingCondition ?
                <ConditionEditor
                  type='condition'
                  exit={() => setEditingCondition(false)}
                  save={condition => { setFieldValue('condition', condition); setEditingCondition(false) }}
                  initValue={values.condition}
                />
                : null
              }
            </div>


            <Button className="w-full mt-8 bg-white"
              onClick={() => {
                if (!isValid)
                  alertError()
                if (values.type === 'select' && values.options.length < 2)
                  return

                submitForm()
              }}
            >
              Gotowe
            </Button>
            {router?.query?.new === '1' ? null :
              <Button size='small' color='error' className="w-full mt-2 bg-white"
                onClick={() => {
                  setDeleteDialogOpen(true)
                }}
              >
                Usuń pole
              </Button>
            }
            <Button className="border-none self-end" size='small' color='error' onClick={() => setDialogOpen(true)}>
              <ArrowBack className='mr-2' />
              Anuluj
            </Button>
          </div>
        </div>
      </div>
    }}


  </Formik >
}

export const ErrorMessageCallback = (message: string) => <p className="w-full text-right text-red-500 text-xs">{message}</p>

export default FieldEditor;