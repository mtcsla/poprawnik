import { Article, Feed, Gavel, Lock } from "@mui/icons-material";
import { Accordion, AccordionSummary, Tooltip, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import ArticlesList from "./sidebar-lists/ArticlesList";
import ForLawyerList from "./sidebar-lists/ForLawyerList";

const sx = { fontSize: '1.05rem !important' }

export const NavigationMenu = () => {
  const [expanded, setExpanded] = React.useState<number>(-1);


  return <div className={'flex flex-col w-full pl-1'}>
    <Link passHref href='/forms/list/all/1'>
      <a>
        <MenuAccordion linkFragment={'forms'} icon={<Article {...{ sx }} color={'primary'} className={'mr-4'} />}
          title={'Pisma'} onChange={() => setExpanded(0)} expanded={expanded == 0} />
      </a>
    </Link>
    <Tooltip title={<div className='p-1 rounded bg-black bg-opacity-70 text-white'>Już niedługo!</div>} placement='right' >
      <span>
        <MenuAccordion linkFragment={'calculators'} icon={<Lock {...{ sx }} color={'primary'} className={'mr-4 text-slate-400'} />}
          //@ts-ignore
          title={<span className="text-slate-400">Kalkulatory</span>}
          onChange={() => { }} expanded={expanded == 1}
        />
      </span>
    </Tooltip>
    <MenuAccordion linkFragment={'articles'} icon={<Feed {...{ sx }} color={'primary'} className={'mr-4'} />}
      title={'Artykuły'} onChange={() => setExpanded(2)} expanded={expanded == 2} >
      <ArticlesList />
    </MenuAccordion>
    <MenuAccordion linkFragment={'lawyer'} icon={<Gavel {...{ sx }} color={'primary'} className={'mr-4'} />} title={'Prawnicy'} onChange={() => setExpanded(3)} expanded={expanded == 3}>
      <ForLawyerList />
    </MenuAccordion>
  </div>
}

export const MenuAccordion = ({
  icon,
  title,
  children,
  linkFragment,
  onChange,
  expanded
}: { icon: React.ReactNode, children?: React.ReactNode, title: string, linkFragment?: string, onChange: () => void, expanded: boolean }) => {
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