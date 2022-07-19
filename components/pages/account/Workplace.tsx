import { PersonalVideo, Work } from "@mui/icons-material";
import { Button, List, ListItem, TextField } from "@mui/material";
import { Field, Formik } from "formik";
import React from "react";
import { ISubFormProps } from '../../../pages/account/index';

const Workplace = ({ loading, editing, saving, setEditing, updateUserDoc, userDoc }: ISubFormProps) => {

  const [editingThis, setEditingThis] = React.useState<boolean>(false);

  return <Formik initialValues={{ name: userDoc?.workplace?.name || "", position: userDoc?.workplace?.position || "" }} onSubmit={() => { }} validateOnChange={true} >
    {({ values, touched, errors, isValid, setFieldValue, setFieldError, setFieldTouched }) => <>
      <span className='flex items-center justify-between mt-6'>
        <pre className='text-xs '>Miejsce pracy</pre>
        {editingThis
          ? <Button disabled={saving || !isValid} size='small'
            onClick={
              () =>
                updateUserDoc({
                  workplace: { name: values.name, position: values.position }
                }, () => { setEditingThis(false); setEditing(false) }
                )
            } className='border-none'>
            zapisz
          </Button>
          : <Button disabled={saving || editing}
            onClick={
              () => { setEditingThis(true); setEditing(true) }
            } size='small' className='border-none'>
            edytuj
          </Button>
        }
      </span>

      <p className='text-sm'>Jeżeli jesteś studentem, w pole stanowiska możesz wpisać np. <i>Student prawa</i>, a w pole miejsca pracy np. <i>Uniwersytet Warszawski.</i></p>

      <List>
        <ListItem className='flex items-center w-full justify-end flex-wrap'>
          <span className='flex items-center'><Work className='mr-2 text-lg -translate-y-0.5' color={'info'} /> <p className='text-sm'>Miejsce pracy</p></span> <div className='flex-1' />
          {
            editingThis
              ? <span className='flex flex-col items-end'>
                <Field as={TextField} name='name'
                  error={(errors.name && touched.name) as boolean}
                  label="Miejsce pracy"
                  size='small'
                  style={{ maxWidth: 200 }}
                  validate={(val: string) => {
                    return val ? undefined : 'To pole jest wymagane.'
                  }}
                />
                {errors.name && touched.name ? <p className='text-xs text-red-500 mt-2'>{errors.name}</p> : null}

              </span>
              : userDoc?.workplace?.name
                ? <pre className='text-xs'>{userDoc?.workplace?.name}</pre>
                : <pre className='text-xs'>brak</pre>
          }
        </ListItem>

        <ListItem className='flex items-center w-full justify-end flex-wrap'>
          <span className='flex items-center'><PersonalVideo className='mr-2 text-lg -translate-y-0.5' color={'primary'} /> <p className='text-sm'>Stanowisko</p></span> <div className='flex-1' />
          {
            editingThis
              ? <span className='flex flex-col items-end'>
                <Field as={TextField} name='position'
                  size='small'
                  style={{ maxWidth: 200 }}
                  label="Stanowisko"
                  error={(errors.position && touched.position) as boolean}
                  validate={(val: string) => {
                    return val ? undefined : 'To pole jest wymagane.'
                  }} />
                {errors.position && touched.position ? <p className='text-xs text-red-500 mt-2'>{errors.position}</p> : null}
              </span>
              : userDoc?.workplace?.position
                ? <pre className='text-xs'>{userDoc?.workplace?.position}</pre>
                : <pre className='text-xs'>brak</pre>

          }
        </ListItem>

      </List></>}
  </Formik>
}

export default Workplace;