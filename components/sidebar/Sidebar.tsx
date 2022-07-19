import styled from "@emotion/styled";
import { QuestionMark } from "@mui/icons-material";
import { Avatar, Box, Paper, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import useWindowSize from '../../hooks/WindowSize';
import { useAuth } from '../../providers/AuthProvider';
import LogoHeader from "../LogoHeader";
import { NavigationMenu } from "./SidebarParentList";

const SidebarPaper = styled(Paper)`
  min-height: 100vh;
  min-height: stretch;
`

const Sidebar = ({ }) => {
  const { width } = useWindowSize();

  return <SidebarPaper variant='outlined' style={{ width: '18rem', paddingRight: 2, maxWidth: 320 }}
    className='flex flex-col items-center justify-between h-full border-0 rounded-none'>
    <div className={'flex flex-col items-center'}>
      <LogoHeader border={(width && (width >= 1100)) as boolean} />
      <LoggedInUserDisplay />
      <NavigationMenu />
    </div>
    <div className={'w-full mt-4 flex flex-col'}>
      <Link passHref href={'/'}>
        <a className={'mb-1 text-xs ml-4 text-slate-500 hover:text-blue-500'}>Polityka prywatności</a>
      </Link>
      <Link passHref href={'/'}>
        <a className={'text-xs ml-4 text-slate-500 hover:text-blue-500'}>Warunki świadczenia usług</a>
      </Link>

      <h4 className='mb-3 text-xs w-full pl-4 pr-4 text-right flex items-center capitalize pb-2 pt-2'
      >
        <div className='border-t mr-3 flex-1' />
        Iusinus © 2022
      </h4>
    </div>
  </SidebarPaper>;
}

export default Sidebar;

export function LoggedInUserDisplay() {
  const { userProfile } = useAuth();
  const router = useRouter();

  return <div style={{ width: 'calc(100% - 1.5rem)' }}
    className={'border p-2 rounded-xl self-center  flex items-center justify-start pl-2 mr-2 ml-2 pr-4 mt-4 mb-2'}>
    {userProfile ?
      <Avatar src={userProfile.photoURL} variant="circular" />
      :
      <Box sx={{
        borderColor: 'primary.main',
        borderWidth: 1,
        borderRadius: '10px',
        width: 40,
        height: 40,
        fontSize: '1.2rem'
      }}
        className={'flex items-center justify-center bg-white'}
      >
        {<QuestionMark color={'primary'} className='absolute z-0' />}
      </Box>}
    <div className='flex flex-col ml-3'>
      {userProfile ?
        <>
          <p className={'text-sm'}>{userProfile?.displayName} </p>
          <Typography component={'p'} color={'primary'}
            className={'text-xs '}>Zalogowano.</Typography>
        </>
        : <>
          <p className='text-sm'>Nie jesteś zalogowany/a.</p>
          <Link href={`/login?redirect=${router.pathname}`} passHref>
            <Typography component={'a'} className={'text-sm'} color={'primary'}>Zaloguj się
              tutaj.</Typography>
          </Link>
        </>}
    </div>
  </div>;
}
