import { Facebook, LinkedIn } from "@mui/icons-material";
import { Button, List, ListItem, TextField } from "@mui/material";
import { Field, Formik } from "formik";
import React from "react";
import { ISubFormProps } from '../../../pages/account/index';

const SocialMedia = ({ loading, editing, saving, setEditing, updateUserDoc, userDoc }: ISubFormProps) => {
  const [editingThis, setEditingThis] = React.useState<boolean>(false);

  return <Formik initialValues={{ facebook: userDoc?.socialMedia?.facebook || "", linkedin: userDoc?.socialMedia?.linkedin || "" }} onSubmit={() => { }} validateOnChange={true} >
    {({ values, touched, errors, isValid, setFieldValue, setFieldError, setFieldTouched }) => <>
      <span className='flex items-center justify-between mt-6'>
        <pre className='text-xs '>Media społecznościowe</pre>
        {editingThis
          ? <Button disabled={saving || !isValid} size='small'
            onClick={
              () =>
                updateUserDoc({
                  socialMedia: { linkedin: values.linkedin, facebook: values.facebook }
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

      <List>
        <ListItem className='flex items-center w-full justify-end flex-wrap'>
          <span className='flex items-center'><LinkedIn className='mr-2 text-lg -translate-y-0.5' color={'info'} /> <p className='text-sm'>LinkedIn</p></span> <div className='flex-1' />
          {
            editingThis
              ? <span className='flex flex-col items-end'>
                <Field as={TextField} name='linkedin'
                  error={(errors.linkedin && touched.linkedin) as boolean}
                  label="Link do LinkedIn'a"
                  size='small'
                  style={{ maxWidth: 200 }}
                  validate={(val: string) => {
                    return (!val || val.startsWith('https://www.linkedin.com/in')) ? undefined : 'Podaj poprawny link do profilu na LinkedIn.'
                  }}
                />
                {errors.linkedin && touched.linkedin ? <p className='text-xs text-red-500 mt-2'>{errors.linkedin}</p> : null}

              </span>
              : userDoc?.socialMedia?.linkedin
                ? <a className='text-xs' href={userDoc?.socialMedia?.linkedin}><pre className='text-black'>Link do profilu</pre></a>
                : <pre className='text-xs'>brak</pre>
          }
        </ListItem>

        <ListItem className='flex items-center w-full justify-end flex-wrap'>
          <span className='flex items-center'><Facebook className='mr-2 text-lg -translate-y-0.5' color={'primary'} /> <p className='text-sm'>Facebook</p></span> <div className='flex-1' />
          {
            editingThis
              ? <span className='flex flex-col items-end'>
                <Field as={TextField} name='facebook'
                  size='small'
                  style={{ maxWidth: 200 }}
                  label="Link do Facebook'a"
                  error={(errors.facebook && touched.facebook) as boolean}
                  validate={(val: string) => {
                    return (!val || val.startsWith('https://www.facebook.com/profile')) ? undefined : 'Podaj poprawny link do profilu na Facebook\'u.'
                  }} />
                {errors.facebook && touched.facebook ? <p className='text-xs text-red-500 mt-2'>{errors.facebook}</p> : null}
              </span>
              : userDoc?.socialMedia?.facebook
                ? <a className='text-xs ' href={userDoc?.socialMedia?.facebook}><pre className='text-black'>Link do profilu</pre></a>
                : <pre className='text-xs'>brak</pre>

          }
        </ListItem>

      </List></>}
  </Formik>
}

export default SocialMedia;