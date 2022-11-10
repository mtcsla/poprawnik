import styled from '@emotion/styled';
import { ArrowForward, Bookmark, Search } from '@mui/icons-material';
import { Avatar, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { GetStaticPropsContext } from 'next';
import Link from 'next/link';
import React, { HTMLAttributes } from 'react';
import { firebaseAdmin } from '../buildtime-deps/firebaseAdmin';
import { ExplanationAnimationSvg } from '../components/ExplanationAnimationSvg';
import LogoHeader from '../components/LogoHeader';
import useWindowSize from '../hooks/WindowSize';
import { useAuth } from '../providers/AuthProvider';

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
  const { userProfile } = useAuth();

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
    <div style={{ maxHeight: '40rem', height: '40rem', backgroundImage: 'url(/bg-new-light.svg)', backdropFilter: 'grayscale(20%)', backgroundSize: 'cover' }} className='flex-col flex'>
      <div className='w-full pb-4 sm:pb-8 pt-8 sm:pt-12 md:pt-16 px-8 sm:px-12 md:px-16 inline-flex items-center flex-wrap gap-4'>
        <div className='inline-flex gap-4 items-center'>
          <Avatar className='bg-slate-400' src={
            userProfile?.photoURL
          } />
          <div className='inline-flex items-end flex-col gap-1'>
            {userProfile
              ? <>
                <p className='text-sm'>{userProfile.displayName}</p>
                <Link href='/account' passHref>
                  <a>
                    <pre className='text-xs hover:text-black'>konto</pre>
                  </a>
                </Link>
              </>
              : <>
                <Link href='/signup' passHref>
                  <a>
                    <pre className='text-xs hover:text-black'>rejestracja</pre>
                  </a>
                </Link>
                <Link href='/login' passHref>
                  <a>
                    <pre className='text-xs hover:text-black'>logowanie</pre>
                  </a>
                </Link>

              </>
            }
          </div>
        </div>
        <Link href='/dashboard' passHref>
          <a className='ml-auto'>
            <Button className='border-none bg-transparent ' size='small'>Do serwisu <ArrowForward className='ml-2' /></Button>
          </a>
        </Link>

      </div>
      <div className='inline-flex gap-20 px-8  pb-8 bg-opacity-50 sm:pb-12 md:pb-16  sm:px-12 md:px-16 pt-0 justify-between items-center'>
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
    </div>
    {width && width < 1024 ?
      <div className='w-full bg-blue-100  justify-center inline-flex lg:hidden  p-8 sm:p-12'>
        <div style={{ maxWidth: 1000 }} className='inline-flex w-full gap-12 items-center justify-center  '>
          <div className='w-full bg-blue-200 rounded-lg hidden  sm:block' />
          <div className='inline-flex gap-3 min-w-fit initial flex-col'>
            <pre className='text-lg'>Jak to działa?</pre>
            <ExplanationAnimation
              active
            />
          </div>
        </div>
      </div>
      : null
    }
    <div className='w-full inline-flex justify-center items-center pb-3 p-8 sm:p-12 bg-slate-100 ' >
      <div className='inline-flex flex-wrap-reverse sm:gap-12 sm:flex-nowrap' style={{ maxWidth: 1000 }}>
        <img src='/court.svg' className='flex-1' style={{ minWidth: 250, maxWidth: '26rem' }} />

        <div style={{ maxWidth: '60rem', minWidth: 250 }} className='inline-flex  flex-col gap-2'>
          <h2 className='text-2xl lg:text-4xl'><i>Prosta sprawa sądowa</i><b className='text-blue-500'>?</b></h2>
          <p className='text-base lg:text-lg whitespace-normal'>
            Nie w każdej sprawie potrzebna jest <b>kompleksowa obsługa prawna</b>. Dzięki naszym łatwym w obsłudze interfejsom stworzymy dla Ciebie <b>profesjonalne pismo</b>, które możesz złożyć w sądzie, wygenerowane w przeciągu chwili. Wybierz pismo, które Cię interesuje, wypełnij formularz i skorzystaj z naszej usługi.

          </p>
        </div>
      </div>
    </div>
    <div className='w-full pt-8 pb-4  sm:pt-12 sm:pb-8 overflow-x-clip'>
      <MostPopularProducts {...{ mostPopularProducts, categories }} />
    </div>
    <footer className='mt-auto h-fit w-full flex justify-center p-8 sm:p-12 pb-4 sm:pb-8 pt-2 sm:pt-6 bg-slate-800 ' >
      <div className='w-full inline-flex gap-2 flex-col justify-between items-stretch'>
        <LogoHeader noPadding noBackground border={false} textWhite />
        <div className='flex gap-3 ml-2 flex-wrap w-full'>
          <div className='flex flex-col gap-1'>
            <Link href='/dashboard' passHref>
              <a>
                <li className='text-slate-300 text-sm hover:text-white cursor-pointer'>Strona startowa</li>
              </a>
            </Link>
            <Link href='/forms/list/all/1' passHref>
              <a>
                <li className='text-slate-300 text-sm hover:text-white cursor-pointer'>Pisma</li>
              </a>
            </Link>
            <Link href='/articles' passHref>
              <a>
                <li className='text-slate-300 text-sm hover:text-white cursor-pointer'>Artykuły</li>
              </a>
            </Link>
          </div>
          <div className='flex flex-col gap-1'>
            <li className='text-slate-400 text-sm'>Kalkulatory</li>
            {
              userProfile
                ? null
                : <>
                  <Link href='/login' passHref>
                    <a>
                      <li className='text-slate-300 text-sm hover:text-white cursor-pointer'>Logowanie</li>
                    </a>
                  </Link>
                  <Link href='/signup' passHref>
                    <a>
                      <li className='text-slate-300 text-sm hover:text-white cursor-pointer'>Rejestracja</li>
                    </a>
                  </Link>
                </>
            }
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

  return <div className='flex flex-col w-full overflow-x-visible' >
    <div className='flex flex-col w-full self-center' style={{ maxWidth: 1000 }} >
      <pre className='px-8 sm:px-12 md:text-lg mb-4 text-right self-end'>Najpopularniejsze pisma</pre>
      <div className='px-8 sm:px-12 w-full'>
      </div>
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

        <h4 className='flex font-bold text-inherit whitespace-normal mb-4 text:xl sm:text-2xl'>
          <Bookmark color='primary' className='translate-y-1.5 mr-2 ' />
          {
            product.title
          }</h4>
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

