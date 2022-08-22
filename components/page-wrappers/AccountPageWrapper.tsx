import { ArrowLeft, Edit, Gavel, Logout, PersonRounded, Shield, ShoppingBag } from '@mui/icons-material';
import { Button, List, ListItem, Paper, SwipeableDrawer, useTheme } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import useWindowSize from '../../hooks/WindowSize';
import { useAuth } from '../../providers/AuthProvider';
import LogoHeader from '../LogoHeader';
import { LoggedInUserDisplay } from '../sidebar/Sidebar';
const AccountPageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { width } = useWindowSize();
  const { signOut } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const [open, setOpen] = React.useState<boolean>(false);

  return <div className='h-full w-full flex flex-col'>



    <div style={{ height: '4rem', backdropFilter: 'blur(10px)', WebkitBackdropFilter: "blur(10px)" }} className=' fixed z-50 w-full  flex items-center p-3 pl-0 pr-0 justify-between'>
      <LogoHeader
        noText={(width && width < 1100) as boolean}
        border={false}
        caption={'Wróć do serwisu.'}
        captionLink={'/'}
        openSidebar={(width && width < 1100) ? () => setOpen(true) : undefined}
      />
      <Button onClick={signOut} size="small" className="border-none mr-4 whitespace-nowrap  ">Wyloguj się <Logout className="ml-2" /></Button>
    </div>
    <div className='w-full h-full flex'>
      <AccountPageSidebar {...{ open, setOpen }}>
        <span className='w-full flex-col flex'>
          <List className='w-full'>
            <ListItem className='flex items-center w-full'>
              <pre className="text-sm">Twoje konto</pre>
              <div className='border-b-2 flex-1 ml-2' style={{ height: '1px' }} />
            </ListItem>
          </List>

          <List className='w-full pl-3'>
            <AccountPageLink caption="Twoje informacje" link={'/account'} icon={PersonRounded} />
            <AccountPageLink caption="Historia zakupów" link={'/account/purchases'} icon={ShoppingBag} />
          </List>

          <List className='w-full'>
            <ListItem className='flex items-center w-full'>
              <pre className="text-sm">Zarządzanie serwisem</pre>
              <div className='border-b-2 flex-1 ml-2' style={{ height: '1px' }} />
            </ListItem>
          </List>

          <List className='w-full pl-3'>
            <AccountPageLink caption="Redaktor" link={'/account/editor'} icon={Edit} />
            <AccountPageLink caption="Prawnik" link={'/account/lawyer'} icon={Gavel} />
            <AccountPageLink caption="Panel administratora" link={'/account/admin'} icon={Shield} />
          </List>
        </span>
        <span className='w-full flex flex-col'>
          <LoggedInUserDisplay />
        </span>
      </AccountPageSidebar>
      <main className={'mt-16  flex justify-center w-full ' + ((width && width >= 1100) ? 'pl-72' : '')}>
        <div style={{ maxWidth: width && width >= 1100 ? 900 : 100000000000 }} className='w-full flex-1 lg:p-12 p-5'>
          {children}
          <footer className={"w-full"} >
            <div className={"mb-4 w-full border-t "} />
            <div className={"text-xs flex justify-between pb-6"}>
              <Link passHref href={"/dashboard"}>
                <a className={"text-blue-500 flex items-center"}>
                  <ArrowLeft className={"mr-1"} /> Strona startowa
                </a>
              </Link>
              Iusinus © 2022
            </div>
          </footer>
        </div>
      </main>
    </div>
  </div >;
}
const AccountPageSidebar = ({ children, open, setOpen }: { children: React.ReactNode, open: boolean, setOpen: React.Dispatch<boolean> }) => {
  const { width } = useWindowSize();

  return width && width >= 1100 ? <div style={{ height: 'calc(100% - 4rem)' }} className='mt-16 fixed p-2 w-72 flex flex-col items-start justify-between'>
    {children}
  </div>
    :
    <SwipeableDrawer className='overflow-x-hidden' {...{ onClose: () => setOpen(false), open, onOpen: () => setOpen(true) }}>
      <Paper className='h-full w-72 flex flex-col items-start' style={{ maxWidth: 320 }}>
        <LogoHeader
          border={false}
          caption={'Wróć do serwisu.'}
          captionLink={'/'}
        />
        <span className='h-full w-full flex flex-col justify-between'>
          {children}
        </span>
      </Paper>
    </SwipeableDrawer>;
}
const AccountPageLink = ({ caption, link, icon }: { caption: string, link: string, icon: any }) => {
  const router = useRouter();
  const Icon = icon;

  const selected = () => link === '/account' ? router.pathname === link : router.pathname.includes(link);

  return <Link href={link}><ListItem className={(selected() ? 'bg-blue-50' : 'hover:bg-slate-50') + ' transition-colors mb-2 cursor-pointer p-1.5 pl-3 pr-3 flex flex-row-reverse items-center justify-between w-full rounded-lg'}>
    <Icon color='primary' /> <p className={(selected() ? 'text-blue-500' : '') + ' text-sm'}>{caption}</p>
  </ListItem></Link>
}

export default AccountPageWrapper;
