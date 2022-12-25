import { Article, Feed, Lock } from "@mui/icons-material";
import { Accordion, AccordionSummary, Button, Tooltip, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const sx = { fontSize: '1.05rem !important' }

export const NavigationMenu = () =>
{
	const [expanded, setExpanded] = React.useState<number>(-1);

	const router = useRouter();
	React.useEffect(() =>
	{
		if (
			router.isReady
		)
		{
			router.pathname.includes('forms') && setExpanded(0);
			router.pathname.includes('calculators') && setExpanded(1);
			router.pathname.includes('articles') && setExpanded(2);
		}
	}, [router.isReady, router.pathname])



	return <div className={'flex flex-col w-full pl-1'}>
		<Link passHref href='/forms/list/all/1'>
			<a>
				<MenuButton linkFragment={'forms/list'} icon={<Article {...{ sx }} color={'primary'} className={'mr-4'} />}
					title={'Pisma'}
					expanded={expanded == 0} onClick={() => void 0} />
			</a>
		</Link>
		<Tooltip title={<div className='p-1 rounded bg-black bg-opacity-70 text-white'>Już niedługo!</div>} placement='right' >
			<span>
				<MenuButton disabled={true}
					linkFragment={'calculators'}
					icon={<Lock {...{ sx }} color={'primary'} className={'mr-4 text-slate-400'} />}
					onClick={() => void 0}
					title={<span className="text-slate-400">Kalkulatory</span>}
					expanded={expanded == 1}
				/>
			</span>
		</Tooltip>
		<Link passHref href='/articles/list/all/1'>
			<a>
				<MenuButton linkFragment={'articles/list'} icon={<Feed {...{ sx }} color={'primary'} className={'mr-4'} />}
					title={'Artykuły'} onClick={() => setExpanded(2)} expanded={expanded == 2} />
			</a>
		</Link>
		{/* <MenuAccordion linkFragment={'lawyer'} icon={<Gavel {...{ sx }} color={'primary'} className={'mr-4'} />} title={'Prawnicy'} onChange={() => setExpanded(3)} expanded={expanded == 3}>
			<ForLawyerList />
		</MenuAccordion> */}
	</div>
}
export const MenuButton = ({
	icon,
	title,
	linkFragment,
	onClick,
	disabled,
	expanded
}: { icon: React.ReactNode, disabled?: boolean, children?: React.ReactNode, title: React.ReactNode, linkFragment?: string, onClick: () => void, expanded: boolean }) =>
{
	const router = useRouter();



	return <div className="w-full pr-5 mt-1 mr-2">
		<Button {...{ onClick, disabled }} className={`normal-case ${expanded ? 'bg-blue-100 text-blue-500' : ''} w-full ml-3 pl-4 pr-0 `}>
			<span className={'flex w-full items-center justify-between'}>
				<p className={`font-normal ${expanded ? 'text-blue-500' : 'text-black'}`}>{title}</p> {icon}
			</span>
		</Button>
	</div>
}
export const MenuAccordion = ({
	icon,
	title,
	children,
	linkFragment,
	onChange,
	expanded
}: { icon: React.ReactNode, children?: React.ReactNode, title: string, linkFragment?: string, onChange: () => void, expanded: boolean }) =>
{
	const router = useRouter();

	return <Accordion defaultExpanded={router.pathname.includes(linkFragment as string)} expanded={expanded} onChange={onChange}
		className={'w-full mt-2 pl-1  border-none'}
		style={{ marginRight: 3, borderTop: 'none !important' }}>
		<AccordionSummary className={(expanded ? 'cursor-default' : '') + ' pl-4 pr-0'} id={title}>
			<span className={'flex w-full items-center justify-between'}>
				<Typography className={'text-sm '} sx={{ fontWeight: 400 }} component={'p'}>{title}</Typography> {icon}
			</span>
		</AccordionSummary>
		<div className="mb-0 pr-3.5 pl-2">
			{children}
		</div>
	</Accordion>
}