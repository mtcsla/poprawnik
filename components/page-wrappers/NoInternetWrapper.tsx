import { SignalWifiConnectedNoInternet4Rounded } from "@mui/icons-material";
import { Alert, Snackbar } from "@mui/material";
import React from "react";

const NoInternetWrapper = ({ children }: { children: React.ReactNode }) => {
  const [noInternet, setNoInternet] = React.useState<boolean>();

  React.useEffect(() => {
    setNoInternet(navigator.onLine === false);

    const setOnline = () => setNoInternet(false);
    const setOffline = () => setNoInternet(true);

    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);

    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    }
  }, []);


  return <>
    {children}
    <Snackbar open={noInternet} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Alert color='error' icon={<SignalWifiConnectedNoInternet4Rounded className='text-white' />} className='bg-red-500 text-white'>Brak internetu.</Alert>
    </Snackbar>
  </>
}

export default NoInternetWrapper;