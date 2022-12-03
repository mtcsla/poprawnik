
import styled from '@emotion/styled';
import { AccountBox, ArrowForward, Bookmark, Close, DescriptionRounded, Home, Newspaper, Search as SearchIcon } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import algoliasearch from "algoliasearch";
import Link from "next/link";
import React from "react";
import { BasicDoc, Hit, Index } from "react-instantsearch-core";
import { algoliaAppId, algoliaSearchKey } from '../public_keys.json';


import Router from 'next/router';
import { Configure, connectHits, createConnector, InstantSearch } from 'react-instantsearch-dom';
import { useOnClickOutside } from "usehooks-ts";
import useWindowSize from "../hooks/WindowSize";
import BodyScrollLock from "./BodyScrollLock";

enum HitType {
  product,
  article
}

const searchClient = algoliasearch(
  algoliaAppId,
  algoliaSearchKey
)

const searchOpenContext = React.createContext<{ searchOpen: boolean, setSearchOpen: React.Dispatch<React.SetStateAction<boolean>> }>({
  searchOpen: false,
  setSearchOpen: () => { }
});

export default function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = React.useState<boolean>(false);

  React.useEffect(() => {

    const handler = () => { setSearchOpen(false); }
    Router.events.on('routeChangeComplete', handler);

    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
      if (e.keyCode === 75 && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener(
      'keydown',
      listener
    );
    return () => { window.removeEventListener('keydown', listener); Router.events.off('routeChangeComplete', handler); };
  }, []);


  return <searchOpenContext.Provider value={{ searchOpen, setSearchOpen }}>
    {searchOpen
      ? <BodyScrollLock>
        <div className="fixed h-full left-0 sm:p-8 md:p-12 right-0 flex-col top-0 buttom-0 bg-opacity-10  justify-start items-center"

          style={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            backgroundColor: "rgba(0,0,0,0.1)",
            zIndex: 20000
          }}
        >
          <InstantSearch
            searchClient={searchClient}
            indexName="products"
          >
            <Search />

          </InstantSearch>
        </div>
      </BodyScrollLock>
      : null
    }

    {children}
  </searchOpenContext.Provider >
}

export const useSearch = () => React.useContext(searchOpenContext);

export const Search = () => {
  const { searchOpen, setSearchOpen } = useSearch();
  const divRef = React.useRef<HTMLDivElement>(null);


  useOnClickOutside(divRef, () => setSearchOpen(false), 'mouseup');
  const { width } = useWindowSize();

  return (
    <div className={`bg-white flex border flex-col h-fit ${width && width >= 640 ? 'rounded-lg max-h-[60rem]' : 'h-screen max-h-screen'} mx-auto `} ref={divRef} style={{ maxWidth: '40rem', }} >
      <ConnectedSearchBox />
      <Configure hitsPerPage={5} />

      <div className="w-full h-full px-4 pt-8 flex justify-between flex-col overflow-y-scroll">
        <div className='flex flex-col w-full'>
          <indexContext.Provider value={'products'}>
            <Index indexName="products">
              <ConnectedHits />
            </Index>
          </indexContext.Provider>
          <Index indexName="articles">
            <Configure hitsPerPage={3} />
            <indexContext.Provider value={'articles'}>
              <ConnectedHits />
            </indexContext.Provider>
          </Index>
        </div>

        <div className="flex gap-6 flex-wrap pt-8 pb-4 mt-auto">
          <div className="inline-flex mr-auto px-4 flex-wrap gap-6 sm:gap-12 justify-between w-full">
            <div className="flex flex-col">
              <p className="flex items-center">

                <Bookmark color='primary' className="mr-2" />
                Informacje
              </p>
              <ul className="inline-flex flex-col gap-1 my-2 text-sm text-blue-500">
                <Link href="/faq">
                  <li>
                    Najczęściej zadawane pytania <ArrowForward />
                  </li>
                </Link>
                <Link href="/faq">
                  <li>
                    Polityka prywatności <ArrowForward />
                  </li>
                </Link>
                <Link href="/faq">
                  <li>
                    Warunku świadczenia usług <ArrowForward />
                  </li>
                </Link>
              </ul>
            </div>
            <div className="flex">
              <div className="flex flex-col">
                <p className="flex items-center">

                  <AccountBox color='primary' className="mr-2" />
                  Konto
                </p>
                <ul className="inline-flex flex-col gap-1 my-2 text-sm text-blue-500">
                  <Link href="/faq">
                    <li>
                      Logowanie <ArrowForward />
                    </li>
                  </Link>
                  <Link href="/faq">
                    <li>
                      Rejestracja <ArrowForward />
                    </li>
                  </Link>
                </ul>
              </div>
            </div>

            <div className="inline-flex gap-6 flex-col mr-auto">
              <div className="flex  flex-col">
                <p className="flex items-center">
                  <Home className="mr-2" color='primary' />
                  Skróty
                </p>
                <ul className="inline-flex flex-col gap-1 my-2 text-sm text-blue-500">
                  <Link href="/faq">
                    <li>
                      Wszystkie pisma <ArrowForward />
                    </li>
                  </Link>
                  <Link href="/faq">
                    <li>
                      Wszystkie artykuły <ArrowForward />
                    </li>
                  </Link>
                  <Link href="/faq">
                    <li>
                      Strona startowa <ArrowForward />
                    </li>
                  </Link>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </  div>
    </div >
  )
};
const indexContext = React.createContext<string>('');


const MyHits = ({ hits }: { hits: Hit<BasicDoc>[] }) => {
  const index = React.useContext(indexContext);

  return <div className="flex flex-col items-start">

    {
      hits.length
        ? <>
          <pre className="my-4">{index === 'articles' ? 'artykuły' : 'pisma'}</pre>
          {hits.map(hit => <MyHit hit={hit} key={hit.objectID} />)}
        </>
        : index === 'products' ? <div style={{ maxWidth: '15rem' }} className="mx-auto flex-col flex text-gray-500">
          <img style={{ maxWidth: '10rem' }} className='mx-auto' src='/void.svg' />
          <h5 className="w-full mt-6 text-base">Brak wyników</h5>
          <p className="w-full text-sm"> Nie znaleźliśmy żadnych pism spełniających warunki wyszukiwania.</p>
        </div> : null
    }

  </div>
}
const ConnectedHits = connectHits(MyHits);

const HitHover = styled.div`
  .icon {
    color: #475569;
  }
  &:hover .icon {
    color: #3b82f6;
  }
`

const MyHit = ({ hit }: { hit: Hit<BasicDoc> }) => {

  const type = React.useMemo(() => {
    if (hit.path.includes('article')) {
      return HitType.article
    }
    return HitType.product
  }, [hit]);


  const { setSearchOpen } = useSearch();


  return <>
    {type === HitType.product
      ?
      <Link href={`/forms/${hit.path.split('/')[1]}`} passHref>
        <a className="w-full">

          <HitHover className='flex flex-col p-2 hover:bg-blue-100 hover:text-blue-500 rounded transition-colors cursor-pointer'>
            <div className='inline-flex ml-1 mb-1 justify-between gap-2 items-end'>
              <pre className='text-xs icon'>{hit.category}</pre>
              <p className='text-sm'>{(parseInt(hit.price) / 100).toFixed(2).toString().replace('.', ',')}zł</p>
            </div>
            <HitHover className="flex w-full rounded gap-6 max-w-full items-center">
              <DescriptionRounded className='icon w-12 h-12' />
              <div className="flex flex-col flex-1" style={{ width: 'calc(100% - 4.5rem)' }}>
                <h5 className="text-base truncate">{hit.title}</h5>
                <p className="text-sm truncate">{hit.description}</p>
              </div>
            </HitHover>
          </HitHover>

        </a>
      </Link>
      :
      hit.title ?
        <Link href={`/articles/${hit.path.split('/')[1]}`} passHref>
          <a className='w-full'>
            <HitHover className='flex flex-col p-2 hover:bg-blue-100 hover:text-blue-500 rounded transition-colors cursor-pointer'>
              <div className='inline-flex ml-1 hidden mb-1 justify-between gap-2 items-end'>
                <pre className='text-xs icon'>{hit.category}</pre>
                <p className='text-sm'>{hit.author}</p>
              </div>
              <HitHover className="flex w-full rounded gap-6 max-w-full items-center">
                <Newspaper className='icon w-12 h-12' />
                <div className="flex flex-col flex-1" style={{ width: 'calc(100% - 4.5rem)' }}>
                  <h5 className="text-base truncate">{hit.title}</h5>
                  <p className="text-sm truncate">{hit.subtitle}</p>
                </div>
              </HitHover>
            </HitHover>
          </a>
        </Link> : null
    }
  </>
}



const connectWithQuery = createConnector({
  displayName: 'WidgetWithQuery',
  getProvidedProps(props, searchState) {
    // Since the `attributeForMyQuery` searchState entry isn't
    // necessarily defined, we need to default its value.
    const currentRefinement = searchState.attributeForMyQuery || '';

    // Connect the underlying component with the `currentRefinement`
    return { currentRefinement };
  },
  refine(props, searchState, nextRefinement) {
    // When the underlying component calls its `refine` prop,
    // we update the searchState with the provided refinement.
    return {
      // `searchState` represents the search state of *all* widgets. We need to extend it
      // instead of replacing it, otherwise other widgets will lose their respective state.
      ...searchState,
      attributeForMyQuery: nextRefinement,
    };
  },
  getSearchParameters(searchParameters, props, searchState) {
    // When the `attributeForMyQuery` state entry changes, we update the query
    return searchParameters.setQuery(searchState.attributeForMyQuery || '');
  },
  cleanUp(props, searchState) {
    // When the widget is unmounted, we omit the entry `attributeForMyQuery`
    // from the `searchState`, then on the next request the query will
    // be empty
    const { attributeForMyQuery, ...nextSearchState } = searchState;

    return nextSearchState;
  },
});

const MySearchBox = ({ currentRefinement, refine }: any) => {
  const { setSearchOpen } = useSearch();


  return <TextField
    placeholder="Szukaj..."
    autoFocus={true}
    focused={false}

    onBlur={(e) => e.target.focus()}
    InputProps={{
      startAdornment:
        <InputAdornment position='start'>
          <SearchIcon className="text-2xl" />
        </InputAdornment>,
      endAdornment:
        <InputAdornment position='end'>
          <IconButton onClick={() => setSearchOpen(false)}>
            <pre className="text-xs bg-slate-100 p-1 rounded text-normal mr-2">esc</pre>
            <Close />
          </IconButton>
        </InputAdornment>
    }}
    style={{ margin: '1rem', marginBottom: 0 }}
    value={currentRefinement}
    onChange={e => refine(e.currentTarget.value)}
  />
};

const ConnectedSearchBox = connectWithQuery(MySearchBox);