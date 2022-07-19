import { ArrowRight, Facebook, Google } from "@mui/icons-material";
import { LoadingButton as Button } from '@mui/lab';
import { Paper, TextField, Typography } from "@mui/material";
import { ErrorMessage, Field, Formik } from "formik";
import Link from 'next/link';
import React from "react";
import ErrorMessageFunction from "../components/ErrorMessage";
import LogoHeader from "../components/LogoHeader";
import { getErrorMessage, useAuth } from "../providers/AuthProvider";

export function getStaticProps() {
  return { props: {} }
}

const LogIn = () => {
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { signIn } = useAuth();



  const signInGoogle = () => {
    setLoading(true);
    signIn()?.google().catch(
      err => { setError(getErrorMessage(err.message) as string); setLoading(false) }
    ).then(() => setLoading(false));
  };
  const signInFacebook = () => {
    setLoading(true);
    signIn()?.facebook().catch(
      err => { setError(getErrorMessage(err.message) as string); setLoading(false) }
    ).then(() => setLoading(false));
  };

  return <Paper className={'flex flex-col items-center'} sx={{ maxWidth: '18rem' }} variant={'outlined'}>
    <LogoHeader border={false} noText={false} />
    <Formik initialValues={
      { email: '', password: '' }}
      onSubmit={(values, { setTouched }) => {
        setLoading(true)

        signIn()?.password(values.email, values.password).then(
          () => {
            setLoading(false)
          }
        ).catch(err => {
          setError(getErrorMessage(err.message) as string);
          setLoading(false);
        }
        )
      }}
    >
      {({ values, errors, touched, submitForm, isValid, validateForm }) =>
        <form className={'flex-1 flex flex-col p-5 pt-2 w-full'}>
          <pre className={'w-full text-lg'}>Zaloguj się</pre>
          <p className={'text-sm'}>Nie masz konta? Załóż je <Link replace passHref href={'/signup'}><Typography
            component={'a'} color={'primary'} className={'text-sm'}>tutaj</Typography></Link>.</p>


          <Field as={TextField} validate={(value: string) => !value ? "To pole jest wymagane." : null}
            name='email' label={'adres e-mail'} type={'text'} className={'mt-4'} size={'small'}
            error={touched.email && errors.email}
          />
          <ErrorMessage name={'email'}>{ErrorMessageFunction}</ErrorMessage>


          <Field as={TextField}
            validate={(value: string) => value.length < 6 ? "Hasło musi mieć przynajmniej 6 znaków." : !value ? 'To pole jest wymagane' : null}
            name='password' label={'hasło'} className={'mt-2'} size={'small'} type={'password'}
            error={touched['password'] && errors['password']} />
          <ErrorMessage name={'password'}>{ErrorMessageFunction}</ErrorMessage>

          <Button loading={loading} className={'mt-4'}
            onClick={async () => {
              await validateForm(values);
              isValid ? submitForm() : setError('Wypełnij pola poprawnie.')
            }}>Dalej <ArrowRight /></Button>
          <p
            className={'text-xs text-red-500'}>{error}</p>
          <p className={'text-sm mt-4'}>Lub zaloguj się przez:</p>
          <Button onClick={signInGoogle} loading={loading} className={'mt-2 flex'}>
            <div className={'flex-1 flex items-center justify-between pl-2 pr-2'}><Google
              className={'mr-2'} />
              <div className={'flex-1 justify-center'}>Google</div>
            </div>
          </Button>
          <Button loading={loading} className={'mt-2 flex'}>
            <div className={'flex-1 flex items-center justify-between pl-2 pr-2'}><Facebook
              className={'mr-2'} />
              <div className={'flex-1 justify-center'}>Facebook</div>
            </div>
          </Button>
        </form>
      }
    </Formik>
  </Paper>
}
export default LogIn;