import { ArrowRight, Facebook, Google } from "@mui/icons-material";
import { LoadingButton as Button } from "@mui/lab";
import { Paper, TextField, Typography } from "@mui/material";
import { ErrorMessage, Field, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import ErrorMessageFunction from "../components/ErrorMessage";
import LogoHeader from "../components/LogoHeader";
import { getErrorMessage, useAuth } from "../providers/AuthProvider";

export async function getStaticProps() {
  return { props: {} };
}

const SignUp = ({ redirect }: { redirect?: string }) => {
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const [loadingGoogle, setLoadingGoogle] = React.useState(false);
  const [loadingFacebook, setLoadingFacebook] = React.useState(false);

  const { signIn, signUp, userProfile } = useAuth();


  const signInGoogle = () => {
    setLoadingGoogle(true);
    signIn()?.google().catch(
      err => { setError(getErrorMessage(err.message) as string); setLoading(false) }
    ).then(() => setLoadingGoogle(false));
  };
  const signInFacebook = () => {
    setLoadingFacebook(true);
    signIn()?.facebook().catch(
      err => { setError(getErrorMessage(err.message) as string); setLoading(false) }
    ).then(() => setLoadingFacebook(false));
  };

  const router = useRouter();

  React.useEffect(() => {
    if (userProfile) {
      router.push(router.query.redirect as string ?? '/');
    }
  }, [userProfile])

  return (
    <div className="h-full w-full sm:p-8 flex overflow-y-auto bg-white sm:bg-transparent">
      <Paper className={'flex flex-col items-center m-auto w-full min-w-fit sm:h-fit border-none bg-transparent bg-white rounded-lg'} sx={{ maxWidth: 600 }} variant={'outlined'}>

        <div className="self-start pl-5 pt-2">
          <LogoHeader border={false} noPadding noBackground noText={false} />
        </div>
        <div className={"flex-1 flex flex-col p-5 pt-2 w-full"}>
          <pre className={"w-full text-lg"}>ZAŁÓŻ KONTO</pre>
          <p className={"text-sm"}>
            Masz już konto? Zaloguj się{" "}
            <Link replace href={"/login"} passHref>
              <Typography component={"a"} color={"primary"} className={"text-sm"}>
                tutaj
              </Typography>
            </Link>
            .
          </p>
          <Formik
            initialValues={{
              email: "",
              name: "",
              surname: "",
              password: "",
              repeatPassword: "",
            }}
            onSubmit={(values, { setTouched }) => {
              setLoading(true);

              signUp(values.email, values.password, values.name, values.surname)
                ?.then(() => {
                  setLoading(false);
                  router.push(redirect || '/')
                })
                .catch((err) => {

                  setError(getErrorMessage(err.message) as string);
                });
            }}
            validateOnChange
          >
            {({ values, errors, touched, submitForm, isValid, validateForm }) => {
              const validators = {
                email: (val: any) => (!val ? "To pole jest wymagane." : null),
                password: (val: any) =>
                  !val
                    ? "To pole jest wymagane."
                    : val?.length < 6
                      ? "Hasło musi mieć conajmniej 6 znaków."
                      : null,
                repeatPassword: (val: string) =>
                  !val
                    ? "To pole jest wymagane."
                    : values.password !== val
                      ? "Hasła nie są takie same."
                      : null,
                name: (val: any) => (!val ? "To pole jest wymagane." : null),
                surname: (val: any) => (!val ? "To pole jest wymagane." : null),
              };
              return (
                <>
                  <Field disabled={loading || loadingGoogle || loadingFacebook}
                    error={errors.email && touched.email}
                    as={TextField}
                    name={"email"}
                    label={"adres e-mail"}

                    className={"mt-4"}
                    validate={validators.email}
                  />
                  <ErrorMessage name={"email"}>
                    {ErrorMessageFunction}
                  </ErrorMessage>

                  <div className="inline-flex gap-2 w-full">
                    <div className="flex flex-col w-full">
                      <Field disabled={loading || loadingGoogle || loadingFacebook}
                        error={errors.name && touched.name}
                        as={TextField}
                        name={"name"}
                        label={"imię"}
                        className={"mt-2"}
                        size={"small"}
                        validate={validators.name}
                      />
                      <ErrorMessage name={"name"}>
                        {ErrorMessageFunction}
                      </ErrorMessage>
                    </div>

                    <div className="flex flex-col w-full">
                      <Field disabled={loading || loadingGoogle || loadingFacebook}
                        error={errors.surname && touched.surname}
                        as={TextField}
                        name={"surname"}
                        label={"nazwisko"}
                        className={"mt-2"}
                        size={"small"}
                        validate={validators.surname}
                      />
                      <ErrorMessage name={"surname"}>
                        {ErrorMessageFunction}
                      </ErrorMessage>
                    </div>
                  </div>

                  <Field disabled={loading || loadingGoogle || loadingFacebook}
                    error={errors.password && touched.password}
                    as={TextField}
                    name={"password"}
                    type={"password"}
                    label={"hasło"}
                    className={"mt-2"}
                    size={"small"}
                    validate={validators.password}
                  />
                  <ErrorMessage name={"password"}>
                    {ErrorMessageFunction}
                  </ErrorMessage>

                  <Field disabled={loading || loadingGoogle || loadingFacebook}
                    error={errors.repeatPassword && touched.repeatPassword}
                    as={TextField}
                    name={"repeatPassword"}
                    type={"password"}
                    label={"powtórz hasło"}
                    className={"mt-2"}
                    size={"small"}
                    validate={validators.repeatPassword}
                  />
                  <ErrorMessage name={"repeatPassword"}>
                    {ErrorMessageFunction}
                  </ErrorMessage>

                  <Button loading={loading} disabled={loadingGoogle || loadingFacebook} className={`mt-4  p-2 ${loadingFacebook || loadingGoogle ? 'bg-gray-300' : 'bg-blue-500'} text-white`}
                    onClick={async () => {
                      await validateForm(values);
                      isValid ? submitForm() : setError('Wypełnij pola poprawnie.')
                    }}>
                    <span className={`${loading ? 'opacity-0' : null} flex items-center`}>
                      Załóż konto
                      <ArrowRight />
                    </span>

                  </Button>
                  <p className={"text-xs text-red-500"}>{error}</p>
                </>
              );
            }}
          </Formik>
          <p className={"text-sm mt-4"}>Lub zarejestruj się jednym kliknięciem przez:</p>
          <Button onClick={signInGoogle} loading={loadingGoogle} disabled={loading || loadingFacebook} className={`mt-2 p-2 ${loadingFacebook || loading ? 'bg-gray-100' : 'bg-red-200 text-red-500'} border-none flex`}>
            <div className={`flex-1 ${loadingGoogle ? 'opacity-0' : null} flex items-center justify-between pl-2 pr-2`}>
              <Google className={'mr-2'} />
              <div className={'flex-1 justify-center'}>Google</div>
            </div>
          </Button>
          <Button loading={loadingFacebook} disabled={loading || loadingGoogle} className={`mt-2 ${loadingGoogle || loading ? 'bg-gray-100' : 'bg-blue-200 text-blue-500'} p-2 border-none flex`}>
            <div className={`flex-1 ${loadingFacebook ? 'opacity-0' : null} flex items-center justify-between pl-2 pr-2`}>

              <Facebook className={'mr-2'} />
              <div className={'flex-1 justify-center'}>Facebook</div>
            </div>
          </Button>
        </div>
      </Paper>
    </div>
  );
};
export default SignUp;
