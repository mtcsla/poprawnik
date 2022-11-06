import styled from '@emotion/styled';
import { Search } from '@mui/icons-material';
import { Button } from '@mui/material';
import { GetStaticPropsContext } from 'next';
import React from 'react';

export const getStaticProps = (ctx: GetStaticPropsContext) => {
  return {
    props: {},
  }
}


const TitleContainer = styled.div`
  transition: margin-top .75s ease-in-out;
`
const Caret = styled.span`
  animation: blink-caret .75s step-end infinite;
  border-left-width: 8px;
  @media (min-width: 640px) {
    border-left-width: 10px;
  }
  @media (min-width: 768px) {
    border-left-width: 20px;
  }
`
const Subtitle = styled.p`
  transition: opacity 0.75s ease-in-out;
  padding-left: 0.25rem;
`
const Logo = styled.img`
  transition: width 0.5s ease-in-out, margin 0.5s ease-in-out;
`

const MainPage = () => {
  const [animationStage, setAnimationStage] = React.useState(0);
  const [subtitleNumber, setSubtitleNumber] = React.useState(0);

  const [title, setTitle] = React.useState<React.ReactNode[]>([]);
  const [titleMoved, setTitleMoved] = React.useState(false);
  const [lastSubtitleVisible, setLastSubtitleVisible] = React.useState(false);
  const [secondSubtitleVisible, setSecondSubtitleVisible] = React.useState(false);
  const [logoVisible, setLogoVisible] = React.useState(false);


  const [animationFinished, setAnimationFinished] = React.useState(false);

  const titles: (React.ReactNode[])[] = [
    ['P', 'r', 'a', 'w', 'n', 'i', <span className='text-blue-500 font-mono  uppercase'>k</span>, <span className='text-inherit font-mono'>?</span>],
    ['P', 'o', 'p', 'r', 'a', 'w', 'n', 'i', <b className='text-blue-500 font-mono uppercase'>.</b>],
    ['P', 'o', 'p', 'r', 'a', 'w', 'n', 'i', <span className='text-blue-500 font-mono uppercase'>k</span>],
  ];

  React.useEffect(() => {
    let lastTitle = title;
    const currentTitle = titles[animationStage];
    let currentLetter = longestCommonPrefix(lastTitle, currentTitle);
    let currentSubtitleNumber = subtitleNumber;

    if (!animationFinished) {
      const titleInterval = setInterval(() => {
        if (lastTitle.length > longestCommonPrefix(lastTitle, currentTitle)) {
          setTitle(lastTitle.slice(0, -1).map(
            letter => typeof letter === 'string' ? <pre className={`${letter == 'n' ? 'pl-1' : ''} text-inherit inline pr-1 font-mono`} >{letter}</pre> : letter
          ));
          lastTitle = lastTitle.slice(0, -1);
        } else if (currentLetter <= currentTitle.length) {
          if (currentSubtitleNumber < animationStage) {
            setSubtitleNumber(++currentSubtitleNumber);
            if (currentSubtitleNumber == 1) {
              setTimeout(() =>
                setSecondSubtitleVisible(true),
                1000
              )
            }
          }
          setTitle(currentTitle.slice(0, currentLetter).map(
            letter => typeof letter === 'string' ? <pre className={`${letter == 'n' ? 'pl-1' : ''} text-inherit inline pr-1 font-mono`}>{letter}</pre> : letter
          ));
          currentLetter++;
        } else {
          if (animationStage < titles.length - 1) {
            setTimeout(() => {
              setAnimationStage(animationStage + 1);
              clearInterval(titleInterval);
            }, 2000);
          } else {
            setTimeout(() => {
              setLogoVisible(true);
              setTimeout(() => {
                setTitleMoved(true);
                setTimeout(
                  () => setLastSubtitleVisible(true),
                  500
                )
              },
                1250
              )
            },
              500
            )
            setAnimationFinished(true);
            clearInterval(titleInterval);
          }

        }
      }, 200);

      return () => clearInterval(titleInterval);
    }
  }, [animationStage]);

  return <div className='fixed flex flex-col items-stretch left-0 right-0 bottom-0 top-0'>
    <div style={{ minHeight: 400, backgroundImage: 'url(/bg-new-light.svg)', backdropFilter: 'grayscale(20%)', backgroundSize: 'cover' }} className='flex p-8 bg-opacity-50 sm:p-12 md:p-16 justify-between items-center flex-wrap'>
      <span className='flex-col pt-8  h-full justify-between relative flex'>
        <span className='flex flex-col'>
          <Subtitle className={`text-slate-500 text-sm sm:text-base float-left top-0 right-0 left-0 ${subtitleNumber === 0 || (subtitleNumber == 1 && secondSubtitleVisible) ? 'opacity-100' : 'opacity-0'} `}>
            {subtitleNumber >= 1 && secondSubtitleVisible ? 'My jesteśmy tak samo' : 'Czy w Twojej sprawie aby na pewno potrzebny jest'}
          </Subtitle>
          <TitleContainer className={`${titleMoved ? '-mt-12' : 'mt-2'} mb-2 flex flex-wrap items-stretch`}>
            <Logo src='logo1.svg' className={`m-0 p-0 h-12 sm:h-16 ${logoVisible ? 'w-12 sm:w-16 mr-2 -ml-1' : 'w-0  m-0'}`} />
            <h1 style={{ letterSpacing: 1.5 }} id="main-page-title" className={`font-mono  self-center m-0 text-4xl sm:text-5xl lg:text-6xl  text-slate-600 ${title.length ? '' : 'text-transparent w-0'}`}>
              {title.length ? title : '|'}
            </h1>
            <Caret className={`${title.length ? 'ml-1 sm:ml-2' : ''} ${logoVisible ? 'hidden' : ''}`} />
          </TitleContainer>
          <Subtitle className={`float-right text-sm sm:text-base bottom-0 right-0 left-0 text-slate-500 ${lastSubtitleVisible ? 'opacity-100' : 'opacity-0'} `}>
            Wykonamy dla Ciebie pismo sądowe tak samo dobrze, jak dowolny prawnik.
          </Subtitle>
        </span>
        <Button style={{ minWidth: 250, }} className='bg-slate-50 border-none text-slate-500 drop-shadow hover:bg-blue-50 hover:text-blue-500 w-full mt-8 self-start p-3 flex justify-between'>
          <Search />
          Wyszukaj pismo
        </Button>
      </span>
      <div className='relative'>
        {animationFinished && lastSubtitleVisible ?
          <img src='/explanation_animation4.svg' style={{ width: 400 }} />
          : null
        }
        <div className='absolute invisible flex flex-col items-center justify-center -top-4 -bottom-4 -left-4 -right-4 sm:-top-8 sm:-bottom-8 sm:-left-8 sm:-right-8 rounded-lg bg-white bg-opacity-70' >
          <pre className='text-lg text-center'>Jak to działa?</pre>
        </div>
      </div>
    </div>

  </div>
}

export default MainPage;

const longestCommonPrefix = (str1: React.ReactNode[], str2: React.ReactNode[]): number => {
  let i = 0;
  if (str1.length == 0 || str2.length == 0)
    return 0;
  //@ts-ignore
  while (str1[i] === str2[i] || str1[i]?.props?.children === str2[i]?.props?.children || str1[i]?.props?.children === str2[i] || str1[i] === str2[i]?.props?.children) {
    i++;
  }
  return i;
}