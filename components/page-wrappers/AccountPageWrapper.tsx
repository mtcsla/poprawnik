import { ArrowLeft, Edit, Gavel, Lock, Logout, Person, PersonRounded, Shield, ShoppingBag } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Button, List, ListItem, Paper, SwipeableDrawer, Tooltip, useTheme } from '@mui/material';
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



    <div style={
      { height: '4rem', backdropFilter: 'blur(10px)', WebkitBackdropFilter: "blur(10px)" }} className='fixed z-50 w-full  flex items-center p-3 pl-0 pr-0 justify-between'>
      <LogoHeader
        noText={(width && width < 1100) as boolean}
        border={false}
        caption={'Wróć do serwisu.'}
        captionLink={'/'}
        openSidebar={(width && width < 1100) ? () => setOpen(true) : undefined}
        inAccountPage={true}
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

          <List className='w-full pl-3 pr-4'>
            <AccountPageLink caption="Twoje informacje" link={'/account'} icon={PersonRounded} />
            <AccountPageLink caption="Historia zakupów" link={'/account/purchases'} icon={ShoppingBag} />
          </List>

          <List className='w-full'>
            <ListItem className='flex items-center w-full'>
              <pre className="text-sm">Zarządzanie serwisem</pre>
              <div className='border-b-2 flex-1 ml-2' style={{ height: '1px' }} />
            </ListItem>
          </List>

          <List className='w-full pl-3 pr-4'>
            <AccountPageLink caption="Redaktor" link={'/account/editor'} icon={Edit} />
            <AccountPageAccordion caption="Prawnik" link={'/account/lawyer'} icon={Gavel} >
              <List className=''>
                <Link href='/account/lawyer'>
                  <ListItem className={(router.pathname.startsWith('/account/lawyer') ? 'bg-blue-50' : 'hover:bg-slate-50') + ' mb-1.5 transition-colors cursor-pointer p-1.5 pl-3 pr-3 flex  items-center justify-between w-full rounded-lg'}>
                    <p className={(router.pathname.startsWith('/account/lawyer') ? 'text-blue-500' : '') + ' text-sm'}>Pisma</p>
                  </ListItem>
                </Link>

                <Tooltip title={<div className='p-1 rounded bg-black bg-opacity-70  text-white'>Już niedługo!</div>} placement='right' >
                  <ListItem className={(router.pathname.startsWith('/account/lawyer') && router.pathname.includes('!!!!!!!') ? 'bg-blue-50' : 'hover:bg-slate-50') + ' transition-colors cursor-pointer p-1.5 pl-3 pr-3 flex  items-center justify-between w-full rounded-lg'}>
                    <p className={(router.pathname.startsWith('/account/lawyer') && router.pathname.includes('!!!!!!!') ? ''/*'text-blue-500'*/ : '') + 'text-slate-400 text-sm'}>Kalkulatory</p>

                    <Lock className='text-slate-400 text-xs' />
                  </ListItem>
                </Tooltip>
              </List>

            </AccountPageAccordion>
            <AccountPageLink caption="Weryfikator" link={'/account/verifier'} icon={Person} />
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
    </div >
  </div >;
}
const AccountPageSidebar = ({ children, open, setOpen }: { children: React.ReactNode, open: boolean, setOpen: React.Dispatch<boolean> }) => {
  const { width } = useWindowSize();

  return width && width >= 1100 ? <div style={Object.assign(
    { height: 'calc(100% - 4rem)' },
    width && width >= 1100
      ? {
        backdropFilter: 'blur(10px)', background: 'white', zIndex: 20, WebkitBackdropFilter: "blur(10px)"
      }
      : {})
  } className='mt-16 fixed p-2 w-72 flex flex-col items-start justify-between'>
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
const AccountPageAccordion = ({
  caption, icon, link, children
}: { caption: string, icon: any, link: string, children: React.ReactNode }) => {
  const router = useRouter();
  const Icon = icon;

  const defaultExpanded = () => link === '/account' ? router.pathname === link : router.pathname.includes(link);

  return <div className='flex flex-col'><Accordion defaultExpanded={defaultExpanded()}>
    <AccordionSummary className='p-0 mx-0 mb-1.5'>
      <ListItem className={'transition-colors cursor-pointer p-1.5 pl-3 pr-3 flex flex-row-reverse items-center justify-between w-full rounded-lg'}>
        <Icon color='primary' /> <p className={'text-sm'}>{caption}</p>
      </ListItem>
    </AccordionSummary>
    <AccordionDetails className='py-0 pr-0'>
      {children}
    </AccordionDetails>
  </Accordion>
  </div>
}

export default AccountPageWrapper;
