import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from "react";
import NoInternetWrapper from "../layouts/NoInternet.layout";
import AuthProvider from "./AuthProvider";
import { SidenavProvider } from "./SidenavProvider";

import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import colors from "tailwindcss/colors";
import BodyScrollLockProvider from './BodyScrollLockProvider';
import SearchProvider from './SearchProvider';


const GlobalContextsProvider = ({ children }: { children: React.ReactNode }) =>
{
	return <LocalizationProvider dateAdapter={AdapterDateFns}>
		<BodyScrollLockProvider>
			<SidenavProvider>
				<AuthProvider>
					<ThemeProvider theme={theme}>
						<NoInternetWrapper>
							<SearchProvider>
								{children}
							</SearchProvider>
						</NoInternetWrapper>
					</ThemeProvider>
				</AuthProvider>
			</SidenavProvider>
		</BodyScrollLockProvider>
	</LocalizationProvider>;
}
export default GlobalContextsProvider;

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

				inputAdornedStart: {
					background: 'white'
				},

				root: {
					borderRadius: 'inherit',
					borderColor: 'inherit',
					transition: 'background-color 0.3s ease-in-out',
					'&.Mui-disabled': {
						backgroundColor: colors.transparent
					},
					backgroundColor: colors.white
				},
				input: {
					transition: 'background-color 0.3s ease-in-out',
					'&.Mui-disabled': {
						backgroundColor: colors.transparent
					},
					backgroundColor: colors.white
				},
				notchedOutline: {
					borderColor: colors.slate[200],
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					width: 'auto',
					fontFamily: `'Lato', 'sans-serif'`,
					fontWeight: 700,
					minWidth: 0,
					padding: '0.3rem',
					paddingLeft: '0.6rem',
					paddingRight: '0.6rem',
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
					color: 'white !important',
				}
			}
		},
		MuiPopover: {
			styleOverrides: {
				paper: {
					zIndex: 1000,
					boxShadow: '0 0 0 0px rgb(71, 85, 105)',
					border: 'none'
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
					},
					marginBottom: 0,
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
					borderRadius: '0.25rem',
					marginLeft: '0.5rem',
					marginBottom: '0 !important',
					padding: '0.35rem',
					cursor: 'pointer',
					paddingLeft: '0.4rem',
					paddingRight: '0.4rem',
					marginRight: '0.5rem',
					":hover": {
						backgroundColor: colors.slate[50],
						color: colors.blue[500] + ' !important'
					},
					minHeight: '0 !important',
					height: 'auto !important'
				}
			}
		}
	},

})
