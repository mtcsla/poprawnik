import styled from "@emotion/styled";
import { Edit, Gavel, Shield, SupervisorAccount } from '@mui/icons-material';
import { Avatar, Badge, Chip, Paper, Tooltip, Typography } from "@mui/material";
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

const Sidebar = ({ }) =>
{
	const { width } = useWindowSize();

	return <SidebarPaper variant='outlined' style={
		{ width: '18rem', paddingRight: 2, maxWidth: 320 }
	}
		className='flex flex-col items-center bg-white pr-2.5 border-none justify-between h-full  rounded-none'>
		<div className={'flex flex-col items-center'}>
			<LogoHeader border={false} />
			<div className="w-full pl-1 -mr-1 mt-3">
				<LoggedInUserDisplay />
			</div>
			<NavigationMenu />
		</div>
		<div className={'w-full mt-4 flex flex-col'}>
			<Link passHref href={'/'}>
				<a className={'mb-1 text-xs ml-4 text-slate-500 hover:text-blue-500'}>Polityka prywatności</a>
			</Link>
			<Link passHref href={'/'}>
				<a className={'text-xs ml-4 text-slate-500 hover:text-blue-500'}>Warunki świadczenia usług</a>
			</Link>

			<h4 className='mb-3 text-xs w-full pl-4 pr-4 text-right flex items-center  pb-2 pt-2'
			>
				<div className='border-t border-slate-100 mr-3 flex-1' />
				POPRAWNIK sp.j. © 2022
			</h4>
		</div>
	</SidebarPaper>;
}

export default Sidebar;

const Wrapper = ({ children, roles }: { children: React.ReactNode, roles: string[] }) =>
{
	return roles.length > 1
		? <Badge color={roles.includes('admin')
			? 'error'
			: roles.includes('lawyer')
				? 'primary'
				: roles.includes('editor')
					? 'warning'
					: roles.includes('supervisor')
						? 'secondary'
						: undefined
		}
			badgeContent={
				roles.includes('admin')
					? <Shield />
					: roles.includes('lawyer')
						? <Gavel />
						: roles.includes('editor')
							? <Edit />
							: roles.includes('supervisor')
								? <SupervisorAccount />
								: ''
			}
		>
			{children}
		</Badge>
		: <>{children}</>
}

export function LoggedInUserDisplay()
{
	const { userProfile } = useAuth();
	const router = useRouter();

	return <Link passHref href={userProfile ? '/account' : `/login?redirect=${router.asPath}`}>
		<a className="w-full pr-3 pl-1 flex flex-col">
			<Wrapper roles={userProfile?.roles ?? []}>
				<Tooltip placement="right-start" sx={{ background: 'transparent !important' }} title={
					userProfile && userProfile.roles.length > 1 ?
						<div className="inline-flex flex-col gap-3 items-center flex-wrap">
							{
								userProfile.roles.filter(role => role !== 'user').map(role =>
									<Chip className="p-1 rounded" label={roleToPolish(role).text} color={roleToPolish(role).color as any} size='small' />
								)
							}
						</div>
						: ''
				}>
					<div
						className={'w-full  p-2 border-none hover:bg-slate-50 cursor-pointer rounded self-center  flex items-center justify-start pl-2  ml-2 pr-4 mb-2'}>
						<Avatar className="bg-blue-100 text-blue-500" src={userProfile?.photoURL} variant="rounded" />
						<div className='flex flex-1 flex-col items-end ml-3'>
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
					</div>
				</Tooltip>
			</Wrapper>
		</a>
	</Link>;
}


const roleToPolish = (role: string) =>
{
	if (role === 'admin')
		return { text: 'administrator', color: 'error' }
	if (role === 'lawyer')
		return { text: 'prawnik', color: 'primary' }
	if (role === 'supervisor')
		return { text: 'weryfikator', color: 'secondary' }
	if (role === 'editor')
		return { text: 'edytor', color: 'warning' }
	return { text: '' }
}