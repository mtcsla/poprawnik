import styled from '@emotion/styled';
import { ArrowRight, Article, Bookmark, DataUsage, Gavel, People, Save, Search, ShoppingCart } from '@mui/icons-material';
import { Avatar, Button, FormControl, InputLabel, MenuItem, Pagination, Select } from '@mui/material';
import { GetStaticPropsContext } from 'next';
import Link from 'next/link';
import React, { HTMLAttributes } from 'react';
import { firebaseAdmin } from '../buildtime-deps/firebaseAdmin';
import { ExplanationAnimationSvg } from '../components/ExplanationAnimationSvg';
import LogoHeader from '../components/LogoHeader';
import SearchBar from '../components/utility/SearchBar';
import useWindowSize from '../hooks/WindowSize';
import { useAuth } from '../providers/AuthProvider';
import { useSearch } from '../providers/SearchProvider';

const SelectAnimation = styled.div`
  color: rgb(0, 0, 0);
  .icon {
    color: rgb(100, 116, 139);
  }

  &:hover {
    color: rgb(59, 130, 246);
  }
  &:hover .icon {
    color: rgb(59, 130, 246);   
  }
  .icon-selected {
    color: rgb(147, 197, 253);   
  }
`;

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
	let categories: string[] = [];
	let products: any[] = [];
	let productsStats: { [id: string]: number } = {};

	await firebaseAdmin.firestore().collection('product-categories').get().then(snap => {
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

	return {
		props: { categories, mostPopularProducts },
	}
}

const TitleContainer = styled.div`
  transition: margin-top .5s ease-in-out;
`
const TitleAndSearch = styled.span`
  min-height: 8rem;
  @media (min-width: 728px) {
    min-width: 22rem;
  }
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
const Top = styled.div`
  @media (min-width: 728px) {
    min-height: 50rem;
  }
`
export function sleep(ms: number) {
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
		['P', 'r', 'a', 'w', 'n', 'i', <pre className='text-blue-300 inline font-semibold  uppercase'>k</pre>, <pre className='text-inherit inline'>?</pre>],
		['P', 'o', 'p', 'r', 'a', 'w', 'n', 'i', <pre className='text-blue-300 inline font-semibold uppercase'>.</pre>],
		['P', 'o', 'p', 'r', 'a', 'w', 'n', 'i', <pre className='text-blue-300 inline font-semibold uppercase'>k</pre>],
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
							letter => typeof letter === 'string' ? <pre className={`text-inherit inline pr-1`} >{letter}</pre> : letter
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
							letter => typeof letter === 'string' ? <pre className={`text-inherit inline pr-1`}>{letter}</pre> : letter
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

	const { setSearchOpen } = useSearch();
	const onSearch = () => setSearchOpen(true);

	return <div
		className='bg-white bg-blend-darken relative flex-1 lg:flex-auto flex flex-col overflow-x-hidden items-stretch overflow-y-visible'>
		<header className='absolute bg-transparent text-white top-0 px-8 sm:px-12 flex left-0 h-16 w-full' style={{ zIndex: 2000 }}>
			<div style={{ maxWidth: '60rem' }} className='h-full w-full flex items-center justify-between m-auto'>
				<div className='inline-flex items-center'>
					<LogoHeader small noText noBackground noPadding noWidth png />

					<p className={`${width && width > 900 ? 'flex' : 'hidden'} items-center ml-4 text-sm p-1 px-3 whitespace-nowrap hover:bg-blue-50 hover:text-blue-500 transition-colors rounded-lg cursor-pointer`}>
						<People className='mr-1' />
						Nasza misja
					</p>
					<p className={`${width && width > 900 ? 'flex' : 'hidden'} items-center text-sm p-1 px-3 whitespace-nowrap  hover:bg-blue-50 hover:text-blue-500 transition-colors rounded-lg cursor-pointer`}>
						<Article className='mr-1' />
						Jak to działa
					</p>
					<p className={`${width && width > 900 ? 'flex' : 'hidden'} items-center text-sm p-1 px-3 whitespace-nowrap  hover:bg-blue-50 hover:text-blue-500 transition-colors rounded-lg cursor-pointer`}>
						<Bookmark className='mr-1' />
						Pisma
					</p>
				</div>

				<span className='flex items-center'>
					<SearchBar />
					<Avatar role="button" variant='rounded' src={userProfile?.photoURL} className='w-8 h-8 hover:bg-blue-100 cursor-pointer text-blue-400 bg-slate-50' />
				</span>

			</div>
		</header>
		<Top style={{ backdropFilter: 'grayscale(20%)', backgroundSize: 'cover', backgroundImage: 'url(/bg-light-blue.svg)', zIndex: 0, }} className='w-screen pt-32 px-8 sm:px-12 flex-col flex'>

			<div className='flex flex-col my-auto w-full mx-auto ' style={{ maxWidth: '60rem' }}>
				<div className='inline-flex sm:gap-10 md:gap-20 lg:gap-40  pb-8 bg-opacity-50 sm:pb-12 md:pb-16 pt-0 justify-between items-center'>
					<span style={{ minHeight: '20rem' }} className='flex-col flex-1 md:flex-initial h-full justify-between relative flex'>
						<TitleAndSearch className='flex flex-col'>
							<Subtitle className={`text-slate-200 text-lg sm:text-xl float-left top-0 right-0 left-0 ${subtitleNumber === 0 || (subtitleNumber == 1 && secondSubtitleVisible) ? 'opacity-100' : 'opacity-0'} `}>
								{subtitleNumber >= 1 && secondSubtitleVisible ? 'My jesteśmy tak samo' : 'Czy w Twojej sprawie aby na pewno potrzebny jest'}
							</Subtitle>
							<TitleContainer className={`${titleMoved ? '-mt-12' : 'mt-2'} mb-2 flex items-center`}>
								<h1 style={{ letterSpacing: 1.5 }} id="main-page-title" className={`  self-center m-0 text-4xl sm:text-5xl  text-slate-50 ${title.length ? '' : 'text-transparent w-0'}`}>
									{title.length ? title : '|'}
								</h1>
								<Caret className={`${title.length ? 'ml-1 sm:ml-2' : ''} ${logoVisible ? 'hidden' : ''}`} />
							</TitleContainer>
							<Subtitle className={`float-right text-lg sm:text-xl bottom-0 right-0 left-0 text-slate-200 ${lastSubtitleVisible ? 'opacity-100' : 'opacity-0'} `}>
								Wykonamy dla Ciebie pismo sądowe tak samo dobrze, jak dowolny prawnik.
							</Subtitle>
						</TitleAndSearch>
						<div onClick={() => setSearchOpen(true)} style={{ minWidth: 250, }} role='button' className='bg-slate-50 border-none rounded-lg text-slate-500 hover:bg-blue-50 text-lg hover:text-blue-500 w-full mt-8 self-start p-3 sm:p-5 flex justify-between'>
							<Search className='text-2xl' />
							Szukaj pisma...
						</div>
					</span>

					{width && width >= 848
						?
						<ExplanationAnimation
							style={{
								minWidth: '20rem',
								maxWidth: '30rem'
							}}
							className="self-end w-full py-4 px-8 bg-slate-100 rounded"
							active
						/>
						: null
					}
				</div>
			</div>
			<img src='top-waves.svg' className='-ml-8 sm:-ml-12 z-50 w-screen ' style={{ maxWidth: 'none' }} />
		</Top>
		<div className='z-50' >
			<div className='w-full inline-flex justify-center items-center px-8 sm:px-12 py-12 sm:py-16  bg-white'  >
				<div className='inline-flex flex-wrap-reverse gap-12 items-center sm:gap-32 sm:flex-nowrap' style={{ maxWidth: '60rem' }}>
					<img src='/judge.svg' className='mx-auto h-full' style={{ minWidth: 250 }} />
					<div style={{ maxWidth: '60rem', minWidth: 200 }} className='inline-flex flex-col'>
						<h2 className='text-2xl text-right lg:text-4xl'><b className='text-blue-500'>Prosta</b> sprawa sądowa?</h2>
						<pre className='text-base mb-8 text-right'>Zajmiemy się tym</pre>
						<p className='text-base lg:text-lg text-right whitespace-normal'>
							Nie w każdej sprawie potrzebna jest <b>kompleksowa obsługa prawna</b>. Dzięki naszym łatwym w obsłudze interfejsom stworzymy dla Ciebie <b>profesjonalne pismo</b>, które możesz złożyć w sądzie, wygenerowane w przeciągu chwili. {/*Wybierz pismo, które Cię interesuje, wypełnij formularz i skorzystaj z naszej usługi.*/}
						</p>
					</div>
				</div>
			</div>
			<div className='sm:w-screen py-12 flex flex-col pl-8 sm:pl-12 pr-8 sm:pr-0'>
				<Explanation />
			</div>
			<div className='w-full pt-8 pb-4 bg-white  sm:pt-12 sm:pb-8 overflow-x-clip'>
				<MostPopularProducts {...{ mostPopularProducts, categories }} />
			</div>
			<img src='/footer-waves.svg' style={{ marginBottom: -1 }} className='w-full' />
			<footer className='mt-auto h-fit w-full flex justify-center px-8 sm:px-12 py-12 sm:py-16 bg-slate-800 ' >
				<div className='w-full inline-flex gap-2 flex-col justify-between items-stretch' style={{ maxWidth: '60rem' }}>
					<LogoHeader noPadding noBackground border={false} textWhite />
					<div className='flex gap-3 ml-2 flex-wrap w-full'>
						<div className='flex flex-col gap-1'>
							<Link href='/dashboard' passHref>
								<a>
									<li className='text-white text-sm hover:text-blue-300 cursor-pointer'>Strona startowa</li>
								</a>
							</Link>
							<Link href='/forms/list/all/1' passHref>
								<a>
									<li className='text-white text-sm hover:text-blue-300 cursor-pointer'>Pisma</li>
								</a>
							</Link>
							<Link href='/articles' passHref>
								<a>
									<li className='text-white text-sm hover:text-blue-300 cursor-pointer'>Artykuły</li>
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
												<li className='text-white text-sm hover:text-blue-300 cursor-pointer'>Logowanie</li>
											</a>
										</Link>
										<Link href='/signup' passHref>
											<a>
												<li className='text-white text-sm hover:text-blue-300 cursor-pointer'>Rejestracja</li>
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
								POPRAWNIK sp.j. © 2022
							</p>
						</div>
					</div>
				</div>
			</footer>

		</div >
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
	const { width } = useWindowSize();

	return <div className='flex relative flex-col w-screen pr-8 sm:pr-12 ' style={{ minHeight: '30rem', }}>
		<div className='mx-auto flex flex-col w-full box-content items-center self-center'  >
			<div className='w-full'>
				<div className='inline-flex justify-between gap-4 xl:gap-8 w-full' style={{ minWidth: 0, maxWidth: 'calc(100vw - var(--margin))' }}>
					{width && width >= 720
						? <div className='flex xl:flex-shrink min-w-fit xl:flex-grow'>
							<div className='xl:flex-1 w-12 xl:w-full h-full ' />
							<div className='flex  flex-col  p-8 rounded' >
								<pre className='self-end mb-4'>Najpopularniejsze pisma</pre>
								<FormControl className='w-full'>
									<InputLabel>kategoria</InputLabel>
									<Select value={category} onChange={e => setCategory(e.target.value)} defaultValue='any' label='kategoria'>
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
								<div className='relative min-w-fit'>
									<div className='absolute top-4 left-0 right-0 bottom-0 z-50 pointer-events-none' style={{ background: 'linear-gradient(0deg, rgba(256,256,256,1) 0%, rgba(256,256,256,0) 10%, rgba(256,256,256,0) 90%, rgba(256,256,256,1) 100%)' }} />

									<div className='relative mt-4 w-fit overflow-y-scroll' style={{ maxHeight: '30rem' }}>
										<div className='gap-4 my-4 min-w-fit grid grid-cols-1 xl:grid-cols-2' >
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
											{
												mostPopularProducts[category].map(product => <ProductCard {...{ product }} />)
											}
										</div>
									</div>
								</div>

								<Link href='/forms/list/all/1' passHref>
									<a>
										<Button className='mt-6 w-full p-4 text-white bg-blue-500'>Lista pism <ArrowRight className='ml-2' /></Button>
									</a>
								</Link>
							</div>
						</div>
						: <div />
					}

					<div className={`flex flex-col ${width && width < 720 ? '-ml-8 sm:-ml-12 -mr-8 sm:-mr-12  pt-12' : ''} my-auto`}>
						<div className={`flex flex-col self-end flex-shrink justify-center ${width && width < 720 ? 'px-8 sm:px-12' : ''} w-fit`} style={{ maxWidth: '25rem', minWidth: 0 }}>
							<h2 className='font-bold text-3xl text-right'>Mamy <b className='text-blue-500'>wszystko</b>, czego potrzebujesz.</h2>

							<pre className='text-right mb-8'>Sprawdź naszą ofertę!</pre>
							<p className='text-right'>
								Oferujemy wiele pism dotyczących różnych gałęzi prawa. Oto nasze najpopularniejsze produkty. Jeśli nie widzisz tego, czego szukasz, najłatwiej jest skorzystać z <b className='inline font-bold text-blue-500'> <Search className='ml-0.5 text-xl' /> wyszukiwarki</b>.
							</p>
						</div>
						{width && width < 720
							? <div className='flex flex-col w-screen pb-12 pt-12'>
								<FormControl className='w-full pr-16 sm:pr-24 ml-8 sm:ml-12'>
									<InputLabel>kategoria</InputLabel>
									<Select value={category} onChange={e => setCategory(e.target.value)} defaultValue='any' label='kategoria'>
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
								<div className='flex items-start py-4  w-screen overflow-x-scroll'>
									{
										mostPopularProducts[category].map(product => <ProductCard {...{ product }} first inRow />)
									}
									{
										mostPopularProducts[category].map(product => <ProductCard {...{ product }} inRow />)
									}
									{
										mostPopularProducts[category].map(product => <ProductCard {...{ product }} inRow />)
									}
									{
										mostPopularProducts[category].map(product => <ProductCard {...{ product }} inRow />)
									}
									{
										mostPopularProducts[category].map(product => <ProductCard {...{ product }} inRow />)
									}
									{
										mostPopularProducts[category].map(product => <ProductCard {...{ product }} inRow />)
									}
									{
										mostPopularProducts[category].map(product => <ProductCard {...{ product }} inRow />)
									}
									{
										mostPopularProducts[category].map(product => <ProductCard {...{ product }} inRow />)
									}
									{
										mostPopularProducts[category].map(product => <ProductCard {...{ product }} inRow />)
									}
									{
										mostPopularProducts[category].map(product => <ProductCard {...{ product }} inRow />)
									}
									{
										mostPopularProducts[category].map(product => <ProductCard {...{ product }} inRow />)
									}
									{
										mostPopularProducts[category].map(product => <ProductCard {...{ product }} inRow />)
									}
								</div>

								<Link href='/forms/list/all/1' passHref >
									<a className='mx-8 sm:mx-12'>
										<Button className='w-full p-4 text-white bg-blue-500'>Lista pism <ArrowRight className='ml-2' /></Button>
									</a>
								</Link>
							</div>
							: null
						}
					</div>
				</div>
			</div>
		</div>
	</div >
}

export const ProductCard = ({ product, first, inRow }: { product: any, first?: boolean, inRow?: boolean }) => {
	return <Link href={`/forms/${product.id}`} passHref>
		<a>
			<Button className='p-0 text-normal normal-case text-left'>
				<div style={{ minHeight: '24rem', width: '20rem', minWidth: '20rem' }} className={`flex transition-colors p-4 sm:p-8 flex-col ${first ? 'ml-8 sm:ml-12' : inRow ? 'ml-4' : ''}  h-fit hover:bg-slate-200 text-black cursor-pointer bg-slate-100 rounded-lg `}>

					<h2 className='flex text-inherit whitespace-normal mb-1 text-lg sm:text-xl'>
						{
							product.title
						}</h2>
					<pre className='mb-4 text-xs whitespace-normal text-right'>{product.category}</pre>

					<pre className='mt-2 text-xs'>Opis</pre>
					<p className='text-sm font-normal mt-2'>
						{
							product.description
						}
					</p>
					<div className='flex-1' />
					<pre className='text-xs mb-2'>Autor</pre>
					<div className='inline-flex rounded-lg gap-4 w-full mb-8 justify-between'>
						<Avatar variant='rounded' src={product.authorPictureURL} />
						<div className='flex flex-col items-end justify-between'>
							<p>{product.authorName}</p>
							<pre className='text-sm'>deweloper</pre>
						</div>
					</div>
					<pre className='self-end text-sm text-inherit'><i className='not-italic  text-slate-500'>Cena:</i> <b className='text-lg font-bold normal-case text-inherit'>{(product.price / 100).toFixed(2).replace('.', ',')}zł</b></pre>
				</div>
			</Button>
		</a>
	</Link>
}

export const PhasedExplanationAnimation = ({ className, style, active, textWhite, phase }: { className?: string, style?: HTMLAttributes<HTMLImageElement>['style'], active: boolean, textWhite?: boolean, phase: number }) => {
	const phaseTimings = [6000, 9000, 9000, 0];
	const [reset, setReset] = React.useState<boolean>(true)

	const ref = React.useRef<NodeJS.Timeout | null>(null);

	const runAnimation = async () => {
		if (ref.current != null)
			clearTimeout(ref.current);
		ref.current = setTimeout(async () => {
			setReset(false);
		}, phaseTimings[phase]);
		await sleep(phaseTimings[phase]);
	}
	React.useEffect(() => () => (ref.current != null ? clearTimeout(ref.current) : void 0), [])

	React.useEffect(() => {
		if (reset === false)
			setReset(true);
		else
			runAnimation();
	}, [reset])

	React.useEffect(
		() => {
			setReset(false);
		},
		[phase]
	)

	return <div className={'relative inline-flex flex-col items-center justify-center gap-4 ' + className ?? ''} style={{
		...style, height: style?.width != null ? (0.67514843087 * (style.width as number)) : undefined
	}}>
		{active && reset ?
			<ExplanationAnimationSvg className='self-start' phase={phase} />
			: null
		}
	</div>
}

export const ExplanationAnimation = ({ className, style, active, textWhite, }: { className?: string, style?: HTMLAttributes<HTMLImageElement>['style'], active: boolean, textWhite?: boolean }) => {


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





	return <div className={'relative inline-flex self-center flex-col gap-4 ' + className ?? ''} style={{
		...style, height: style?.width != null ? (0.67514843087 * (style.width as number)) : undefined
	}}>
		{active && reset ?
			<ExplanationAnimationSvg className='self-center' />
			: null
		}


		<div className='w-full hidden relative text-lg pb-6'>
			<span className={`${textWhite ? 'text-slate-200' : ''} absolute top-0 ${subtitleStage === 0 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
				<pre className={`${textWhite ? 'text-slate-900' : ''} font-bold inline mr-2`}>Krok 1:</pre>
				<p className='inline'>Wypełnij formularz danymi swojej sprawy.</p>
			</span>
			<span className={`${textWhite ? 'text-slate-200' : ''} absolute top-0 ${subtitleStage === 1 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
				<pre className={`${textWhite ? 'text-slate-900' : ''} font-bold inline mr-2`}>Krok 2:</pre>
				<p className='inline'>Zamów i opłać pismo.</p>
			</span>
			<span className={`${textWhite ? 'text-slate-200' : ''} absolute top-0 ${subtitleStage === 2 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
				<pre className={`${textWhite ? 'text-slate-900' : ''} font-bold inline mr-2`}>Krok 3:</pre>
				<p className='inline'>Wydrukuj zakupiony dokument.</p>
			</span>
			<span className={`${textWhite ? 'text-slate-200' : ''} ${subtitleStage === 3 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
				<pre className={`${textWhite ? 'text-slate-900' : ''} font-bold inline mr-2`}>Krok 4:</pre>
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

const Explanation = () => {
	const [turnedOffCurrent, setTurnedOffCurrent] = React.useState<boolean>(false);
	const [turnedOffPrevious, setTurnedOffPrevious] = React.useState<boolean>(false);

	const [step, setStep] = React.useState<number>(0);
	const [previousStep, setPreviousStep] = React.useState<number>(-1);

	enum Directions {
		left,
		right
	}

	const { width } = useWindowSize();

	const [inDirection, setInDirection] = React.useState<Directions>(Directions.left);
	const [outDirection, setOutDirection] = React.useState<Directions>(Directions.right);

	const modifyStep = (newStep: number) => {
		if (newStep == step)
			return;

		setTurnedOffCurrent(true);
		setTurnedOffPrevious(false)


		if (newStep > step) {
			setInDirection(Directions.right);
			setOutDirection(Directions.left);
		} else {
			setInDirection(Directions.left);
			setOutDirection(Directions.right);
		}

		setPreviousStep(step);
		setStep(newStep);

		setTurnedOffPrevious(true);
		setTimeout(() => {
			setTurnedOffCurrent(false);
		}, 250)
	}

	return <div className='flex flex-col-reverse sm:flex-row justify-start' style={{ paddingLeft: 'calc(var(--margin) - var(--xpadding))' }}>
		<div className='flex flex-col sm:mr-8 ' style={{ maxWidth: '40rem' }} >
			<div className='relative flex items-center'>
				<div className={`flex flex-col transition-all z-0 ${(step === 0 && !turnedOffCurrent) || (previousStep === 0 && !turnedOffPrevious) ? 'opacity-1' : `opacity-0 ${(previousStep === 0 ? outDirection : inDirection) ? 'translate-x-1/3' : '-translate-x-1/3'}`} top-0  absolute  left-0 right-0`} >
					<pre>Krok 1</pre>
					<h1>
						Wypełnij <b className='text-blue-500'>formularz</b>
					</h1>
					<p>
						Zapytamy cię o wszystko, co jest istotne do wykonania pisma. Nie obawiaj się - wszystkie dane, które nam podasz są u nas bezpieczne i możesz je zawsze usunąć.
					</p>
				</div>
				<div className={`flex flex-col transition-all z-0 ${(step === 1 && !turnedOffCurrent) || (previousStep == 1 && !turnedOffPrevious) ? 'opacity-1' : `opacity-0 ${(previousStep === 1 ? outDirection : inDirection) ? 'translate-x-1/3' : '-translate-x-1/3'}`} top-0 a  absolute  left-0 right-0`} >
					<pre>Krok 2</pre>
					<h1>
						<b className='text-blue-500'>Zamów</b> pismo
					</h1>
					<p>
						Kiedy zamówisz i opłacisz pismo, w ciągu kilku chwil po sfinalizowaniu płatności dodamy je do twojego konta. Wtedy możesz je pobrać w formacie <b>PDF</b>.
					</p>
				</div>
				<div className={`flex flex-col transition-all z-0 ${(step === 2 && !turnedOffCurrent) || (previousStep == 2 && !turnedOffPrevious) ? 'opacity-1' : `opacity-0 ${(previousStep == 2 ? outDirection : inDirection) ? 'translate-x-1/3' : '-translate-x-1/3'}`} top-0   absolute  left-0 right-0`} >
					<pre>Krok 3</pre>
					<h1>
						Wydrukuj <b className='text-blue-500'>pismo</b>
					</h1>
					<p>
						Jedyna rzecz, której potrzebujesz to drukarka. Wszystkie nasze pisma można pobrać w formacie <b>PDF</b>, który jest idealny do druku.
					</p>
				</div>
				<div className={`flex flex-col transition-all z-0 ${(step === 3 && !turnedOffCurrent) || (previousStep == 3 && !turnedOffPrevious) ? 'opacity-1' : `opacity-0 ${(previousStep == 3 ? outDirection : inDirection) ? 'translate-x-1/3' : '-translate-x-1/3'}`}`}>
					<pre>Krok 4</pre>
					<h1>
						<b className='text-blue-500'>Podpisz się</b>
					</h1>
					<p>
						Na każdym piśmie znajdziesz miejsce do podpisu, w którym musi podpisać się wnioskodawca. Po tym jedyne co musisz zrobić, to złożyć pismo do sądu, wraz z wymaganymi załącznikami, np. aktem urodzenia.
					</p>
				</div>
			</div>

			{width && width < 720 ?
				<Pagination shape='rounded' page={step + 1} onChange={(e, step) => modifyStep(step - 1)} className='self-center mt-8' count={4} color='primary' />
				: null
			}
			<PhasedExplanationAnimation active phase={step} className='bg-slate-50 h-52 mt-8 px-8 rounded py-2' />
		</div>
		{width && width >= 720 ?
			<div className='inline-flex flex-row pr-8 sm:pr-12 sm:flex-col flex-wrap w-full justify-evenly sm:w-auto bg-white sm:mb-0 mb-8 my-auto sm:rx-12 gap-6 z-50 flex-1 whitespace-nowrap sm:min-w-fit' style={{ maxWidth: '28rem' }}>
				<div className='flex-1 gap-6 flex sm:flex-col'>
					<SelectAnimation role='button' style={{ transitionDuration: '200ms !important', transitionTimingFunction: 'ease-in-out !important', flex: 1 / 2 }} onClick={() => step !== 0 && modifyStep(0)} className={`rounded cursor-pointer ${step === 0 ? 'bg-blue-500 text-white' : ''} border border-transparent  transition-colors  p-4 inline-flex flex-col sm:flex-row items-center justify-between gap-6  sm:w-full`}>
						<div className='flex flex-col text-inherit'>
							<pre className='text-inherit'>Krok 1</pre>
							<p className='sm:inline-flex gap-3 items-center hidden '>Wprowadzanie danych</p>
						</div>
						<DataUsage className={`text-2xl sm:text-4xl  ${step === 0 ? 'icon-selected' : 'icon'} transition-colors`} />
					</SelectAnimation>
					<SelectAnimation role='button' style={{ transitionDuration: '200ms !important', transitionTimingFunction: 'ease-in-out !important', flex: 1 / 2 }} onClick={() => step !== 1 && modifyStep(1)} className={`rounded cursor-pointer ${step === 1 ? 'bg-blue-500 text-white' : ''} border border-transparent  transition-colors  p-4 inline-flex flex-col sm:flex-row items-center justify-between gap-6  sm:w-full`}>
						<div className='flex flex-col text-inherit'>
							<pre className='text-inherit'>Krok 2</pre>
							<p className='sm:inline-flex gap-3 items-center hidden '>Zamawianie pisma</p>
						</div>
						<ShoppingCart className={`text-2xl sm:text-4xl  ${step === 1 ? 'icon-selected' : 'icon'} transition-colors`} />
					</SelectAnimation>
				</div>
				<div className='flex-1 gap-6 flex sm:flex-col'>
					<SelectAnimation role='button' style={{ transitionDuration: '200ms !important', transitionTimingFunction: 'ease-in-out !important', flex: 1 / 2 }} onClick={() => step !== 2 && modifyStep(2)} className={`rounded cursor-pointer ${step === 2 ? 'bg-blue-500 text-white' : ''} border border-transparent  transition-colors  p-4 inline-flex flex-col sm:flex-row items-center justify-between gap-6  sm:w-full`}>

						<div className='flex flex-col text-inherit'>
							<pre className='text-inherit'>Krok 3</pre>
							<p className='sm:inline-flex gap-3 items-center hidden '>Pobieranie i drukowanie</p>
						</div>
						<Save className={`text-2xl sm:text-4xl  ${step === 2 ? 'icon-selected' : 'icon'} transition-colors`} />
					</SelectAnimation>
					<SelectAnimation role='button' style={{ transitionDuration: '200ms !important', transitionTimingFunction: 'ease-in-out !important', flex: 1 / 2 }} onClick={() => step !== 3 && modifyStep(3)} className={`rounded cursor-pointer ${step === 3 ? 'bg-blue-500 text-white' : ''} border border-transparent  transition-colors  p-4 inline-flex flex-col sm:flex-row items-center justify-between gap-6  sm:w-full`}>
						<div className='flex flex-col text-inherit'>
							<pre className='text-inherit'>Krok 4</pre>
							<p className='sm:inline-flex gap-3 items-center hidden '>Składanie do sądu</p>
						</div>
						<Gavel className={`text-2xl sm:text-4xl  ${step === 3 ? 'icon-selected' : 'icon'} transition-colors`} />
					</SelectAnimation>
				</div>

			</div>
			: null
		}
	</div>;
}

