import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as logOut,
  updateProfile,
  UserCredential
} from "@firebase/auth";
import { LoadingButton } from "@mui/lab";
import { Dialog, DialogActions, DialogContent, DialogTitle, Snackbar } from "@mui/material";
import { IdTokenResult, User } from "firebase/auth";
import { useRouter } from "next/router";
import nookies, { destroyCookie } from "nookies";
import React, { useEffect } from "react";
import { auth } from "../buildtime-deps/firebase";
import useWindowSize from "../hooks/WindowSize";

import restricted from "../restricted.json";
import unauthenticated from "../unauthenticated.json";

export const possibleRoles = ["user", "admin", "lawyer", "editor"];



export const errorCodes: { [key: string]: string } = {
  "admin-restricted-operation":
    "Masz zbyt mało uprawnień do wykonania tej operacji.",
  "argument-error": "Wystąpił błąd podczas przetwarzania danych.",
  "cors-unsupported":
    "Przeglądarka, której używasz, nie jest wspierana przez Trustree.",
  "credential-already-in-use": "Podany użytkownik już istnieje.",
  "custom-token-mismatch": "Token jest nieprawidłowy.",
  "requires-recent-login":
    "Ta operacja jest bardzo wrażliwa i wymaga ponownego logowania.",
  "email-change-needs-verification": "Adres e-mail musi zostać zweryfikowany.",
  "email-already-in-use":
    "Podany adres e-mail jest już używany przez innego użytkownika.",
  "expired-action-code": "Kod aktywacyjny wygasł.",
  "cancelled-popup-request": "Anulowano operację.",
  "internal-error": "Wystąpił błąd.",
  "invalid-email": "Adres e-mail jest niepoprawny.",
  "invalid-action-code": "Kod aktywacyjny jest nieprawidłowy.",
  "wrong-password": "Nieprawidłowe hasło lub sposób logowania.",
  "account-exists-with-different-credential":
    "Istnieje już konto o tym adresie e-mail. Zaloguj się za pomocą poprawnego sposobu dla tego konta.",
  "network-request-failed": "Wystąpił błąd sieci.",
  "popup-blocked":
    "Nie można otworzyć okienka logowania. Upewnij się, że wszystkie blokady okienek są wyłączone.",
  "popup-closed-by-user":
    "Zamknięto okienko przed zakończeniem procesu logowania.",
  "redirect-cancelled-by-user": "Anulowano przekierowanie do logowania.",
  "redirect-operation-pending": "Operacja jest w trakcie przetwarzania.",
  timeout: "Operacja trwała zbyt długo. Spróbuj ponownie.",
  "user-token-expired": "Sesja wygasła. Zaloguj się ponownie.",
  "too-many-requests": "Zbyt dużo zapytań. Spróbuj ponownie później.",
  "unverified-email": "Ta operacja wymaga zweryfikowanego adresu e-mail.",
  "user-cancelled": "Anulowano proces.",
  "user-not-found": "Nie znaleziono użytkownika.",
  "user-disabled": "To konto zostało wyłączone z użytku przez administratora.",
  "user-signed-out": "Użytkownik wylogowany.",
  "weak-password": "Hasło musi mieć przynajmniej 6 znaków.",
  "web-storage-unsupported":
    "Przeglądarka, której używasz, nie jest wspierana przez Trustree.",
};

export const shouldRedirectOnRestricted = (pathname: string): boolean => {
  for (let item of restricted as [string, string, '+'][]) {
    const [regExp, exactPathname, allChildren] = item;

    if (allChildren == '+' && pathname.match(new RegExp(regExp)))
      return true
    else if (exactPathname.trim() == pathname)
      return true

  }
  return false;
}
export const shouldRedirectOnUnauthenticated = (pathname: string): boolean => {
  for (let item of unauthenticated as [string, string, '+'][]) {
    const [regExp, exactPathname, allChildren] = item;

    if (allChildren == '+' && pathname.match(new RegExp(regExp)))
      return true
    else if (exactPathname.trim() == pathname)
      return true
  }
  return false;
}

export const getErrorMessage = (message: string) => {
  let error = /\/.*\)/.exec(message)?.[0];
  error = error?.substring(1, error?.length - 1);
  return errorCodes[error as string];
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  const [loginSuccess, setLoginSuccess] = React.useState(false);
  const [logoutSuccess, setLogoutSuccess] = React.useState(false);

  const [redirecting, setRedirecting] = React.useState(false);

  const { width } = useWindowSize();
  const getWidth = () => width;

  const [user, setUser] = React.useState<User | null>(auth?.currentUser as (User | null));

  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(
    nookies.get(undefined)['--user-profile'] ?
      (JSON.parse(nookies.get(undefined)['--user-profile'])) as UserProfile
      : null
  );

  const [confirmLogoutOpen, setConfirmLogoutOpen] = React.useState(false);
  const router = useRouter()

  useEffect(() => {

    const currentPathname = router.pathname
    if (redirecting)
      return;

    if (userProfile)
      if (shouldRedirectOnUnauthenticated(currentPathname)) {
        setRedirecting(true);

        if (currentPathname.includes('login'))
          router.push(router.query['redirect'] as string || '/').then(() => setRedirecting(false))
        else
          router.push('/').then(() => setRedirecting(false))
        return
      }
    if (!userProfile)
      if (shouldRedirectOnRestricted(currentPathname)) {
        setRedirecting(true)
        router.push('/login').then(() => setRedirecting(false));
        return;
      }

  }, [router.pathname])

  useEffect(() => {

    const currentPathname = router.pathname
    if (redirecting)
      return;

    if (userProfile)
      if (shouldRedirectOnUnauthenticated(currentPathname)) {
        setRedirecting(true)

        if (currentPathname.includes('login'))
          router.push(router.query['redirect'] as string || '/').then(() => setRedirecting(false))
        else
          router.push('/').then(() => setRedirecting(false))
        return
      }
    if (!userProfile)
      if (shouldRedirectOnRestricted(currentPathname)) {
        setRedirecting(true)
        router.push('/login').then(() => setRedirecting(false))
        return
      }

  }, [userProfile])

  useEffect(() => {
    const unsubscribe = auth?.onIdTokenChanged(async (user) => {
      if (user) {
        setUser(user);
        nookies.set(
          undefined,
          '--user-token',
          `${await user?.getIdToken(false)}`,
          {
            maxAge: 60 * 60 * 24,
            path: '/'
          }
        );
        const { displayName, photoURL, email, uid } = user;

        let roles: string[];
        if (!userProfile) {
          roles = ['user'];
          const decodedToken: IdTokenResult = await auth.currentUser?.getIdTokenResult() as IdTokenResult;

          roles.push(...possibleRoles.filter(key => decodedToken.claims[key]));
        } else {
          roles = userProfile.roles;
        }
        setUserProfile({ displayName, photoURL, email, uid, roles } as UserProfile);

        nookies.set(
          undefined,
          '--user-profile',
          `${JSON.stringify(user)}`,
          {
            maxAge: 60 * 60 * 24,
            path: '/'
          }
        )
      } else {
        setUser(null);
        destroyCookie({}, '--user-token', { path: '/' });
      }
    });

    return unsubscribe;
  }, [])


  const signIn = () => {
    const success = () => {
      setLoginSuccess(true);
      setTimeout(() => {
        setLoginSuccess(false);
      }, 3000);
    }

    if (auth) {
      return {
        password: (email: string, password: string) =>
          signInWithEmailAndPassword(auth, email, password).then(success),
        facebook: () =>
          getWidth() && (getWidth() as number) > 768
            ? signInWithPopup(auth, new FacebookAuthProvider()).then(success)
            : signInWithRedirect(auth, new FacebookAuthProvider()).then(success),
        google: () =>
          getWidth() && (getWidth() as number) > 768
            ? signInWithPopup(auth, new GoogleAuthProvider()).then(success)
            : signInWithRedirect(auth, new GoogleAuthProvider()).then(success)
      }
    }

    return null;
  }
  const signUp = (email: string, password: string, name: string, surname: string) => {
    return createUserWithEmailAndPassword(auth, email, password).then(async (user) => {
      await updateProfile(auth.currentUser as User, {
        displayName: `${name} ${surname}`
      });
      return user;
    });
  };
  const signOut = () => {
    setConfirmLogoutOpen(true);
    return null;
  }


  return (
    <authContext.Provider value={{ user, userProfile, signIn, signUp, signOut, errorCodes }}>
      <Snackbar open={loginSuccess} message='Pomyślnie zalogowano.' />
      <Snackbar open={logoutSuccess} message='Pomyślnie wylogowano.' />

      <Dialog
        open={confirmLogoutOpen}
        onClose={() => {
        }}
      >
        <DialogTitle>
          <pre className={'text-sm'}> POTWIERDZENIE </pre>
        </DialogTitle>
        <DialogContent>
          <p className="text-sm">Czy na pewno chcesz się wylogować?</p>
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={async () => {
            await logOut(auth);
            setLogoutSuccess(true);
            setTimeout(() => { setLogoutSuccess(false) }, 3000)

            if (shouldRedirectOnRestricted(router.pathname)) {
              setRedirecting(true)
              router.push('/').then(() => {
                setRedirecting(false);
              });

              setUserProfile(null);
              destroyCookie({}, '--user-profile', { path: '/' });

              setConfirmLogoutOpen(false);
            }
          }
          }>
            TAK
          </LoadingButton>
          <LoadingButton onClick={() => {
            setConfirmLogoutOpen(false);
          }}>
            NIE
          </LoadingButton>
        </DialogActions>
      </Dialog>
      {children}
    </authContext.Provider>
  )
}

export default AuthProvider;
const authContext = React.createContext<IAuthContext>({
  user: null,
  userProfile: null,
  signUp: () => null,
  signIn: () => null,
  signOut: () => null,
  errorCodes
});
export const useAuth = () => React.useContext(authContext);



export interface IAuthContext {
  user: User | null;
  userProfile: UserProfile | null;
  signIn: (redirect?: string) => { password: (email: string, password: string) => Promise<void>, facebook: () => Promise<void>, google: () => Promise<void> } | null;
  signUp: (email: string, password: string, name: string, surname: string) => Promise<UserCredential> | null;
  signOut: () => Promise<void> | null;
  errorCodes: {
    [key: string]: string
  }
}
export interface UserProfile {
  displayName: string;
  photoURL: string;
  email: string;
  uid: string;
  roles: string[];
}
