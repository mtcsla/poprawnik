import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from "react";
import AuthProvider from "../../providers/AuthProvider";
import { SidenavProvider } from "../../providers/SidenavProvider";
import NoInternetWrapper from "./NoInternetWrapper";

import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import colors from "tailwindcss/colors";

const AppContextWrapper = ({ children }: { children: React.ReactNode }) => {
  return <LocalizationProvider dateAdapter={AdapterDateFns}>
    <SidenavProvider>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <NoInternetWrapper>
            {children}
          </NoInternetWrapper>
        </ThemeProvider>
      </AuthProvider>
    </SidenavProvider></LocalizationProvider>;
}
export default AppContextWrapper;

const theme = createTheme({
  palette: {
    primary: {
      light: colors.blue[300],
      main: colors.blue[500],
      dark: colors.blue[700],
      contrastText: '#fff',
    },
    error: {
      light: colors.red[300],
      main: colors.red[500],
      dark: colors.red[700],
      contrastText: '#fff',
    }
  },

  components: {
    MuiSnackbar: {
      styleOverrides: {
        root: {
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          maxWidth: '100vw !important',
          margin: 0
        }
      }

    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&.Mui-disabled': {
            borderColor: colors.slate[200] + ' !important'
          },
        },
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          transition: 'background-color 0.3s ease-in-out',
          '&.Mui-disabled': {
            backgroundColor: colors.slate[50]
          },
        },
        notchedOutline: {
          borderColor: colors.slate[200],
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.slate[200]}`,
          width: 'auto',
          minWidth: 0,
          padding: '0.3rem',
          paddingLeft: '0.6rem',
          paddingRight: '0.6rem',
          borderRadius: 10,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: { minHeight: 0, height: "auto" },
      }
    },
    MuiMenu: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        list: {
          fontSize: '0.9rem',
          paddingBottom: 0,
          paddingTop: 0,
        },
        root: {
          paddingTop: 0,
          paddingBottom: 0,
        },
        paper: {
          border: '1px solid rgb(71, 85, 105)',
          fontSize: '1rem',
          marginTop: '0.5rem',
          marginBottom: '0.5rem',
          background: 'rgba(0, 0, 0, 0.8) !important',
          borderRadius: '10px !important',
          color: 'white !important',
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: 'transparent !important',
          zIndex: 1000,
          color: 'inherit'
        }
      }
    },
    MuiIcon: {
      styleOverrides: {
        fontSizeInherit: true
      }
    },
    MuiAccordion: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {

        root: {
          '&.Mui-expanded': {
            marginTop: '0.5rem !important',
            marginBottom: '0 !important',
          }
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          height: '100%'
        }
      }
    },
    MuiAccordionSummary: {
      styleOverrides: {
        content: {
          margin: '0 !important',
        },

        root: {
          marginLeft: '0.5rem',
          marginBottom: '0 !important',
          padding: '0.35rem',
          paddingLeft: '0.4rem',
          paddingRight: '0.4rem',
          marginRight: '0.5rem',
          ":hover": {
            backgroundColor: 'rgb(248 250 252)',
          },
          borderRadius: 5,
          minHeight: '0 !important',
          height: 'auto !important'
        }
      }
    }
  },

})
