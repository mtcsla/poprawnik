import {
  AccountBoxRounded,
  AccountCircle, ArrowLeft, Lock,
  Logout, NotificationsOutlined, Search
} from "@mui/icons-material";
import {
  Avatar, Button, Menu,
  MenuItem, SwipeableDrawer
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Link from "next/link";
import Router, { NextRouter, useRouter } from "next/router";
import React, { useEffect } from "react";
import useWindowSize from "../../hooks/WindowSize";
import { useAuth } from "../../providers/AuthProvider";
import { useSideNav } from "../../providers/SidenavProvider";
import LogoHeader from "../LogoHeader";
import Sidebar from "../sidebar/Sidebar";


const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const { sideNavContent } = useSideNav();
  const { width } = useWindowSize();
  const { userProfile, signOut } = useAuth();
  const router = useRouter();


  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleRouteChange = () => setOpen(false);
  useEffect(() => {

    Router.events.on("routeChangeStart", handleRouteChange)
    return () => Router.events.off("routeChangeStart", handleRouteChange);
  },
    []
  );

  return (
    <div className="w-full h-full flex" >
      {width && width > 1100 ? <div className={'h-full fixed'}><Sidebar /></div> : null}

      <SwipeableDrawer
        onOpen={() => setOpen(true)}
        anchor="left"
        className={"overflow-x-hidden"}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Sidebar />
      </SwipeableDrawer>


      <div
        className={
          `w-full h-full flex-col overflow-y-auto 
          ${width && width <= 1100
            ? "p-5"
            : "p-10"
          }
          `
        }
      >

        <AppBar
          className="border-l-0 border-b-0 border-t-0 border-r-0"
          variant="outlined"
          position="fixed"
          elevation={0}
          style={{
            WebkitBackdropFilter: "blur(10px)",
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.6)",

            zIndex: 200,
            left: width && width <= 1100 ? 0 : "calc(18rem)",
            right: 0,

            minWidth: 0,
            width: "auto",
            height: "4rem",
          }}
        >

          <div className="flex items-center h-full justify-between bg-transparent">
            {width && width <= 1100 ? (
              <LogoHeader
                noText={true}
                border={false}
                openSidebar={() => setOpen(true)}
              />
            ) : (
              <div />
            )}

            <div className="flex items-center mr-5 h-full">

              {/*SEARCH BAR OR BUTTON*/}

              {
                width && width > 430
                  ? <div
                    className={
                      "mr-3 border bg-slate-50 hover:bg-slate-100 cursor-text transition-colors flex items-center p-2"
                    }
                    style={{ height: 35, width: 200, borderRadius: 10 }}
                  >
                    <Search
                      color={"primary"}
                      sx={{ fontSize: "1.2rem !important" }}
                    />
                    <p className={"ml-2 text-sm text-slate-500"}>Szukaj...</p>
                  </div>
                  : <Button className="mr-3 bg-white" sx={{ padding: "0.4rem" }}>
                    <Search sx={{ fontSize: "20px !important" }} />
                  </Button>

              }

              {/*NOTIFICATIONS*/}

              <Button className="mr-3 bg-white" sx={{ padding: "0.4rem" }}>
                <NotificationsOutlined sx={{ fontSize: "20px !important" }} />
              </Button>

              <Button
                sx={userProfile?.photoURL ? { padding: 0 } : { padding: '0.4rem' }}
                className='bg-white'
                id="account-button"
                aria-controls={anchorEl ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? "true" : undefined}
                onClick={handleClick}
              >
                {userProfile?.photoURL ?
                  <Avatar variant="square" className="rounded-lg" style={{ height: 34, width: 34 }} src={userProfile.photoURL as string} />
                  : <AccountCircle sx={{ fontSize: "20px !important" }} />
                }
              </Button>

              <AccountMenu {...{ anchorEl, handleClose, router, userProfile, signOut }} />
            </div>
          </div>
        </AppBar>

        <div style={{ height: "4rem" }} /> {/*This div serves as padding, so the fixed navbar has a height on top of the page.*/}

        <div style={{ height: 'calc(100% - 4rem)' }} className={"flex " + (width && width > 1100 ? 'ml-72' : '')} >
          <div
            className={
              "min-w-0 flex flex-col flex-1 items-center h-full justify-between overflow-y-visible"
            }
          >
            <main style={{ maxWidth: 900 }} className={"w-full flex-1"}>
              {children}
            </main>
            <footer className={"w-full"} style={{ maxWidth: 900 }}>
              <div className={"mb-4 mt-4 w-full border-t "} />
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

          {
            width && width >= 700 && false
              ? (
                <nav className={"w-64 text-xs"}>
                  <div style={{ right: "2rem" }} className={"fixed pl-4 w-56 right-8"}>
                    {sideNavContent}
                  </div>
                </nav>
              )
              : null
          }

        </div>
      </div>
    </div>
  );
};

const AccountMenu = ({ anchorEl, handleClose, router, userProfile, signOut }: {
  anchorEl: HTMLElement | null,
  handleClose: () => void,
  router: NextRouter,
  userProfile: any,
  signOut: () => void
}) =>
  <Menu
    id="account-menu"
    anchorEl={anchorEl}
    open={!!anchorEl}
    onClose={handleClose}
    MenuListProps={{
      "aria-labelledby": "account-button",
    }}
  >
    {userProfile ? (
      <span>
        <Link href='/account'>
          <MenuItem>
            <AccountBoxRounded color={"primary"} />{" "}
            <p style={{ fontSize: "0.8rem" }} className={"ml-2"}>
              Twoje konto
            </p>
          </MenuItem>
        </Link>
        <MenuItem onClick={signOut}>
          <Logout color={"primary"} />{" "}
          <p style={{ fontSize: "0.8rem" }} className={"ml-2"}>
            Wyloguj się
          </p>
        </MenuItem>
      </span>
    ) : (
      <span>
        <Link href={`/login?redirect=${router.asPath}`}>
          <MenuItem>
            <Lock color={"primary"} />{" "}
            <p style={{ fontSize: "0.8rem" }} className={"ml-2"}>
              Logowanie
            </p>
          </MenuItem>
        </Link>
        <Link href={`/signup?redirect=${router.pathname}`}>
          <MenuItem>
            <AccountCircle color={"primary"} />{" "}
            <p style={{ fontSize: "0.8rem" }} className={"ml-2"}>
              Rejestracja
            </p>
          </MenuItem>
        </Link>
      </span>
    )}
  </Menu >

export default AppWrapper;