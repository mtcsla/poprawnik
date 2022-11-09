import styled from '@emotion/styled';
import { Bookmark, Search } from '@mui/icons-material';
import { Avatar, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { GetStaticPropsContext } from 'next';
import Link from 'next/link';
import React, { HTMLAttributes } from 'react';
import { firebaseAdmin } from '../buildtime-deps/firebaseAdmin';
import { ExplanationAnimationSvg } from '../components/ExplanationAnimationSvg';
import LogoHeader from '../components/LogoHeader';
import useWindowSize from '../hooks/WindowSize';

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  let categories: string[] = [];
  let products: any[] = [];
  let productsStats: { [id: string]: number } = {};

  await firebaseAdmin.firestore().collection('categories').get().then(snap => {
    categories = snap.docs.map(doc => doc.id);
  })
  await firebaseAdmin.firestore().collection('products').get().then(snap => {
    products = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  });
  await firebaseAdmin.firestore().collection('productsStats').get().then(snap => {
    snap.docs.forEach(doc => {
      productsStats[doc.id] = doc.data().timesSold;
    });
  });



  const mostPopularProducts: { [key: string]: any[] } = {
    'any': products.sort((a, b) => productsStats[b.id] - productsStats[a.id]),
  }
  categories.forEach(
    category => {
      mostPopularProducts[category] = products.filter(product => product.category === category).sort((a, b) => productsStats[b.id] - productsStats[a.id]);
    }
  )

  console.log(
    mostPopularProducts
  )


  return {
    props: { categories, mostPopularProducts },
  }
}

const TitleContainer = styled.div`
  transition: margin-top .5s ease-in-out;
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
  transition: opacity 0.25s ease-in-out;
  padding-left: 0.25rem;
`
const Logo = styled.img`
  transition: width 0.5s ease-in-out, margin 0.5s ease-in-out;
`
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const MainPage = ({ categories, mostPopularProducts }: { categories: string[], mostPopularProducts: { [key: string]: any[] } }) => {
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

  const { width } = useWindowSize();

  const time = 120;
  React.useEffect(() => {
    (async () => {
      for (let stage = 0; stage < titles.length; stage++) {
        let lastTitle = titles[stage - 1] || [];
        const currentTitle = titles[stage];

        let currentLetter = longestCommonPrefix(lastTitle, currentTitle);
        const commonPart = longestCommonPrefix(lastTitle, currentTitle);

        let currentSubtitleNumber = subtitleNumber;

        let done = false;

        while (!done) {
          if (lastTitle.length > commonPart) {
            setTitle(lastTitle.slice(0, -1).map(
              letter => typeof letter === 'string' ? <pre className={`${letter == 'n' ? 'pl-1' : ''} text-inherit inline pr-1 font-mono`} >{letter}</pre> : letter
            ));
            lastTitle = lastTitle.slice(0, -1);
          }
          else if (currentLetter <= currentTitle.length) {
            if (currentSubtitleNumber < stage) {
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
          }
          else {
            if (stage < titles.length - 1) {
              await sleep(1500);
              done = true;
            } else {
              await setTimeout(async () => {
                setLogoVisible(true);
                await setTimeout(async () => {
                  setTitleMoved(true);
                  await setTimeout(
                    () => setLastSubtitleVisible(true),
                    500
                  )
                },
                  1250
                )
              },
                500
              )
              done = true;
              setAnimationFinished(true);
            }
          }
          await sleep(time);
        };
      }
    })();
  }, []);

  return <div
    className='fixed bg-white bg-blend-darken flex-1 lg:flex-auto flex flex-col items-stretch left-0 right-0 bottom-0 top-0 overflow-y-auto'>
    <div style={{ maxHeight: '28rem', height: '28rem', backgroundImage: 'url(/bg-new-light.svg)', backdropFilter: 'grayscale(20%)', backgroundSize: 'cover' }} className='inline-flex gap-20 p-8 bg-opacity-50 sm:p-12 md:p-16 justify-between items-center'>
      <span style={{ minHeight: '20rem' }} className='flex-col pt-8 flex-1 md:flex-initial h-full justify-between relative flex'>
        <span className='flex flex-col'>
          <Subtitle className={`text-slate-500 text-sm sm:text-base float-left top-0 right-0 left-0 ${subtitleNumber === 0 || (subtitleNumber == 1 && secondSubtitleVisible) ? 'opacity-100' : 'opacity-0'} `}>
            {subtitleNumber >= 1 && secondSubtitleVisible ? 'My jesteśmy tak samo' : 'Czy w Twojej sprawie aby na pewno potrzebny jest'}
          </Subtitle>
          <TitleContainer className={`${titleMoved ? '-mt-12' : 'mt-2'} mb-2 flex flex-wrap items-stretch`}>
            <Link passHref href='/dashboard'>
              <a>
                <Logo src='logo1.svg' className={`m-0 p-0 h-12 sm:h-16 ${logoVisible ? 'w-12 sm:w-16 mr-2 -ml-1' : 'w-0  m-0'}`} />
              </a>
            </Link>
            <h1 style={{ letterSpacing: 1.5 }} id="main-page-title" className={`font-mono  self-center m-0 text-4xl sm:text-5xl lg:text-6xl  text-slate-600 ${title.length ? '' : 'text-transparent w-0'}`}>
              {title.length ? title : '|'}
            </h1>
            <Caret className={`${title.length ? 'ml-1 sm:ml-2' : ''} ${logoVisible ? 'hidden' : ''}`} />
          </TitleContainer>
          <Subtitle className={`float-right text-sm sm:text-base bottom-0 right-0 left-0 text-slate-500 ${lastSubtitleVisible ? 'opacity-100' : 'opacity-0'} `}>
            Wykonamy dla Ciebie pismo sądowe tak samo dobrze, jak dowolny prawnik.
          </Subtitle>
        </span>
        <Button style={{ minWidth: 250, }} className='bg-slate-50 border-none text-slate-500 shadow hover:bg-blue-50 hover:text-blue-500 w-full mt-8 self-start p-3 flex justify-between'>
          <Search />
          Wyszukaj pismo
        </Button>
      </span>

      {width && width >= 1024
        ?
        <ExplanationAnimation
          style={{
            minWidth: '16rem'
          }}
          active
        />
        : null
      }
    </div>
    {width && width < 1024 ?
      <div className='w-full bg-blue-100  justify-center inline-flex gap-12 lg:hidden  p-8 sm:p-12'>
        <div className='w-full bg-blue-200 rounded-lg hidden  sm:block' />
        <div className='inline-flex gap-3 min-w-fit initial flex-col'>
          <pre className='text-lg'>Jak to działa?</pre>
          <ExplanationAnimation
            active
          />
        </div>
      </div>
      : null
    }
    <div className='w-full inline-flex gap-12 justify-between items-center flex-wrap-reverse sm:flex-nowrap p-8 sm:p-12 bg-slate-100 ' >
      <img src='/court.svg' className='flex-1' style={{ minWidth: 250, maxWidth: '26rem' }} />

      <div style={{ maxWidth: '60rem', minWidth: 250 }} className='inline-flex  flex-col gap-2'>
        <h2 className='text-2xl lg:text-4xl'>Prosta sprawa sądowa?</h2>
        <p className='text-base lg:text-xl whitespace-normal'>
          Nie w każdej sprawie potrzebna jest kompleksowa obsługa prawna. Dzięki naszym łatwym w obsłudze narzędziom pomożemy Ci stworzyć profesjonalne pismo, które możesz złożyć w sądzie, wygenerowane w przeciągu chwili. Wypełnij wszystkie dane w naszym generatorze i skorzystaj z naszej usługi.
        </p>
      </div>
    </div>
    <div className='w-full pt-8 pb-4  sm:pt-12 sm:pb-8'>
      <MostPopularProducts {...{ mostPopularProducts, categories }} />
    </div>
    <footer className='mt-auto h-fit w-full inline-flex gap-2 flex-col justify-between items-stretch px-8 sm:px-12 py-4 sm:py-6 bg-slate-700 ' >
      <LogoHeader noPadding noBackground border={false} textWhite />
      <div className='flex gap-3 ml-2 flex-wrap w-full'>
        <div className='flex flex-col gap-1'>
          <li className='text-slate-300 text-sm hover:text-white cursor-pointer'>Strona startowa</li>
          <li className='text-slate-300 text-sm hover:text-white cursor-pointer'>Pisma</li>
          <li className='text-slate-300 text-sm hover:text-white cursor-pointer'>Artykuły</li>
        </div>
        <div className='flex flex-col gap-1'>
          <li className='text-slate-400 text-sm'>Kalkulatory</li>
          <li className='text-slate-300 text-sm hover:text-white cursor-pointer'>Logowanie</li>
          <li className='text-slate-300 text-sm hover:text-white cursor-pointer'>Rejestracja</li>
        </div>
        <div className='ml-auto flex flex-col items-end self-end'>
          <p className='text-slate-300 text-sm hover:text-white cursor-pointer'>
            Polityka prywatności
          </p>
          <p className='text-slate-300 text-sm hover:text-white cursor-pointer'>
            Warunki korzystania z serwisu
          </p>

          <p className='text-white mt-2 text-sm font-bold'>
            Trustree sp.j. © 2022
          </p>
        </div>
      </div>
    </footer>

  </div >
}



export default MainPage;
export const MostPopularProducts = ({
  mostPopularProducts,
  categories
}: {
  categories: string[],
  mostPopularProducts: { [category: string]: any[] }
}) => {
  const [category, setCategory] = React.useState('any');

  return <div className='flex flex-col w-full'>
    <pre className='px-8 sm:px-12 md:text-lg mb-4 text-right self-end'>Najpopularniejsze pisma</pre>
    <div className='px-8 sm:px-12 w-full'>
      <FormControl className='w-fit'>
        <InputLabel>kategoria</InputLabel>
        <Select size='small' value={category} onChange={e => setCategory(e.target.value)} defaultValue='any' label='kategoria'>
          <MenuItem value='any'>
            wszystkie pisma
          </MenuItem>
          {
            categories.map(category => <MenuItem value={category}>
              {category}
            </MenuItem>)
          }
        </Select>
      </FormControl>
    </div>
    <div className='w-screen items-stretch mt-8 flex overflow-x-auto'>
      {
        mostPopularProducts[category].map(product => <ProductCard {...{ product }} first />)
      }
      {
        mostPopularProducts[category].map(product => <ProductCard {...{ product }} />)
      }
      {
        mostPopularProducts[category].map(product => <ProductCard {...{ product }} />)
      }
      {
        mostPopularProducts[category].map(product => <ProductCard {...{ product }} />)
      }
      {
        mostPopularProducts[category].map(product => <ProductCard {...{ product }} />)
      }
      {
        mostPopularProducts[category].map(product => <ProductCard {...{ product }} />)
      }
      {
        mostPopularProducts[category].map(product => <ProductCard {...{ product }} />)
      }
      {
        mostPopularProducts[category].map(product => <ProductCard {...{ product }} />)
      }
      {
        mostPopularProducts[category].map(product => <ProductCard {...{ product }} />)
      }
      {
        mostPopularProducts[category].map(product => <ProductCard {...{ product }} />)
      }
      {
        mostPopularProducts[category].map(product => <ProductCard {...{ product }} />)
      }
      {
        mostPopularProducts[category].map(product => <ProductCard {...{ product }} />)
      }
      <div className='flex-1 self-stretch h-full sm:ml-8 ml-12 bg-slate-50 rounded-lg' />
    </div>
  </div>
}

export const ProductCard = ({ product, first }: { product: any, first?: boolean }) => {
  return <Link href={`/forms/${product.id}`} passHref>
    <a>
      <div className={`my-1 flex mb-6 p-4 sm:p-8 flex-col ${first ? 'ml-8 sm:ml-12' : 'ml-4 sm:ml-8'}  h-fit hover:bg-blue-50 text-black hover:text-blue-500 shadow cursor-pointer bg-slate-50 rounded-lg mx-4 `} style={{
        minHeight: '24rem',
        width: '20rem'
      }} >

        <pre className='flex font-bold text-inherit whitespace-normal mb-4 text-lg'>
          <Bookmark className='translate-y-1.5 mr-2 ' />
          {
            product.title
          }</pre>
        <pre className='mt-2 text-xs'>Opis</pre>
        <p className='text-sm mt-2'>
          {
            product.description
          }
        </p>
        <div className='flex-1' />
        <pre className='text-xs mb-1'>Autor</pre>
        <div className='inline-flex bg-white p-2 sm:p-4 rounded-lg gap-4 w-full mb-8 justify-between'>
          <Avatar src={product.authorPictureURL} />
          <div className='flex flex-col items-end justify-between'>
            <p>{product.authorName}</p>
            <pre className='text-sm'>deweloper</pre>
          </div>
        </div>
        <pre className='self-end text-sm text-inherit'><i className='not-italic font-mono text-slate-500'>Cena:</i> <b className='text-lg font-bold normal-case text-inherit'>{(product.price / 100).toFixed(2).replace('.', ',')}zł</b></pre>
      </div>
    </a>
  </Link>
}

export const ExplanationAnimation = ({ className, style, active, textWhite }: { className?: string, style?: HTMLAttributes<HTMLImageElement>['style'], active: boolean, textWhite?: boolean }) => {

  const [reset, setReset] = React.useState<boolean>(true)
  const [subtitleStage, setSubtitleStage] = React.useState<number>(0);
  const timings = [6000, 9000, 6500, 10500];

  const ref = React.useRef<NodeJS.Timeout | null>(null);

  const runAnimation = async () => {
    ref.current = setTimeout(async () => {
      setReset(false);
    }, 32000);
    for (
      let i = 0;
      i < 4;
      i++
    ) {
      setSubtitleStage(i);
      await sleep(timings[i]);
    }
  }

  React.useEffect(() => () => (ref.current != null ? clearTimeout(ref.current) : void 0), [])

  React.useEffect(() => {
    if (reset === false)
      setReset(true);
    else
      runAnimation();
  }, [reset])





  return <div className={'relative inline-flex flex-col gap-4 ' + className ?? ''} style={{
    ...style, height: style?.width != null ? (0.67514843087 * (style.width as number)) : undefined
  }}>
    {active && reset ?
      <ExplanationAnimationSvg className='self-start' />
      : null
    }

    <div className='w-full relative text-lg'>
      <span className={`${textWhite ? 'text-slate-200' : ''} absolute top-0 ${subtitleStage === 0 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
        <pre className={`${textWhite ? 'text-slate-600' : ''} font-bold inline mr-2`}>Krok 1:</pre>
        <p className='inline'>Wypełnij formularz danymi swojej sprawy.</p>
      </span>
      <span className={`${textWhite ? 'text-slate-200' : ''} absolute top-0 ${subtitleStage === 1 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
        <pre className={`${textWhite ? 'text-slate-600' : ''} font-bold inline mr-2`}>Krok 2:</pre>
        <p className='inline'>Zakup i opłać pismo.</p>
      </span>
      <span className={`${textWhite ? 'text-slate-200' : ''} absolute top-0 ${subtitleStage === 2 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
        <pre className={`${textWhite ? 'text-slate-600' : ''} font-bold inline mr-2`}>Krok 3:</pre>
        <p className='inline'>Wydrukuj zakupiony dokument.</p>
      </span>
      <span className={`${textWhite ? 'text-slate-200' : ''} ${subtitleStage === 3 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
        <pre className={`${textWhite ? 'text-slate-600' : ''} font-bold inline mr-2`}>Krok 4:</pre>
        <p className='inline'>Podpisz się i złóż swoje pismo do sądu.</p>
      </span>
    </div>

  </div>
}

const longestCommonPrefix = (str1: React.ReactNode[], str2: React.ReactNode[]): number => {
  let i = 0;
  if (str1.length == 0 || str2.length == 0)
    return 0;
  //@ts-ignore
  while (str1[i] === str2[i]) {
    i++;
  }
  return i;
}

