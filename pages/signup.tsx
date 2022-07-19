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
  const { signIn, signUp } = useAuth();
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();


  const signInGoogle = () => {
    setLoading(true);
    signIn(redirect || '/')?.google().catch(
      err => setError(getErrorMessage(err.message) as string)
    ).then(() => setLoading(false));
  };
  const signInFacebook = () => {
    setLoading(true);
    signIn(redirect || '/')?.facebook().catch(
      err => setError(getErrorMessage(err.message) as string)
    ).then(() => setLoading(false));
  };

  return (
    <Paper
      style={{ maxWidth: "18rem" }}
      className={"flex flex-col items-center"}
      variant={"outlined"}
    >
      <LogoHeader border={false} noText={false} />
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
              repeatPassword: (val: any) =>
                !val
                  ? "To pole jest wymagane."
                  : values.password !== values.repeatPassword
                    ? "Hasła nie są takie same."
                    : null,
              name: (val: any) => (!val ? "To pole jest wymagane." : null),
              surname: (val: any) => (!val ? "To pole jest wymagane." : null),
            };
            return (
              <>
                <Field
                  error={errors.email && touched.email}
                  as={TextField}
                  name={"email"}
                  label={"adres e-mail"}
                  className={"mt-4"}
                  size={"small"}
                  validate={validators.email}
                />
                <ErrorMessage name={"email"}>
                  {ErrorMessageFunction}
                </ErrorMessage>

                <Field
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

                <Field
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

                <Field
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

                <Field
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

                <Button
                  onClick={async () => {
                    await validateForm(values);
                    isValid
                      ? submitForm()
                      : setError("Wypełnij pola poprawnie.");
                  }}
                  loading={loading}
                  className={"mt-4"}
                >
                  DALEJ <ArrowRight />
                </Button>
                <p className={"text-xs text-red-500"}>{error}</p>
              </>
            );
          }}
        </Formik>
        <p className={"text-sm mt-4"}>Lub zarejestruj się przez:</p>
        <Button onClick={signInGoogle} loading={loading} className={"mt-2 flex"}>
          <div className={"flex-1 flex items-center justify-between pl-2 pr-2"}>
            <Google className={"mr-2"} />
            <div className={"flex-1 justify-center"}>Google</div>
          </div>
        </Button>
        <Button loading={loading} className={"mt-2 flex"}>
          <div className={"flex-1 flex items-center justify-between pl-2 pr-2"}>
            <Facebook className={"mr-2"} />
            <div className={"flex-1 justify-center"}>Facebook</div>
          </div>
        </Button>
      </div>
    </Paper>
  );
};
export default SignUp;
