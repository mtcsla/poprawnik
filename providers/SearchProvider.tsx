
import { List, Search as SearchIcon } from "@mui/icons-material";
import { Button, InputAdornment, TextField } from "@mui/material";
import algoliasearch from "algoliasearch";
import Link from "next/link";
import React from "react";
import { BasicDoc, Hit, Index } from "react-instantsearch-core";



import { Configure, createConnector, Hits, InstantSearch } from 'react-instantsearch-dom';
import { useOnClickOutside } from "usehooks-ts";

import BodyScrollLock from "./BodyScrollLock";

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID?.replaceAll('"', '') as string,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY as string
)

const searchOpenContext = React.createContext<{ searchOpen: boolean, setSearchOpen: React.Dispatch<React.SetStateAction<boolean>> }>({
  searchOpen: false,
  setSearchOpen: () => { }
});

export default function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = React.useState<boolean>(false);



  return <searchOpenContext.Provider value={{ searchOpen, setSearchOpen }}>
    {searchOpen
      ?
      <BodyScrollLock>
        <div className="fixed h-full left-0 sm:p-8 md:p-12 right-0 flex-col top-0 buttom-0 bg-opacity-10   justify-start items-center" style={
          {
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            backgroundColor: "rgba(0,0,0,0.1)",
            zIndex: 20000
          }
        } >
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
  </searchOpenContext.Provider>
}

export const useSearch = () => React.useContext(searchOpenContext);

export const Search = () => {
  const { searchOpen, setSearchOpen } = useSearch();
  const divRef = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(divRef, () => setSearchOpen(false), 'mouseup');

  return (
    <div className="bg-white p-4 flex flex-col rounded-lg mx-auto" ref={divRef} style={{ maxWidth: '40rem', maxHeight: 'min(45rem, 100%)' }} >
      <ConnectedSearchBox />
      <Configure hitsPerPage={10} />

      <Button className="self-end mt-3" size='small'>Filtruj <List className="ml-4" /></Button>

      <pre className="my-4">pisma</pre>
      <Index indexName="products">
        <Hits hitComponent={MyHit} />
      </Index>
      <pre className="my-4">artykuły</pre>
      <Index indexName="articles">
        <Hits hitComponent={MyHit} />
      </Index>
    </div >
  )
};

const MyHit = ({ hit }: { hit: Hit<BasicDoc> }) => {
  enum HitType {
    product,
    article
  }
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
        <a>
          <div onClick={() => setSearchOpen(false)} className="flex flex-col w-full bg-slate-50 rounded p-4 hover:bg-blue-100 hover:text-blue-500 transition-colors cursor-pointer">
            <div className="inline-flex gap-2 justify-between">
              <h5 className="truncate text-base">{hit.title}</h5>
              <p>50zł</p>
            </div>
            <p className="text-sm truncate">{hit.description}</p>

          </div>
        </a>
      </Link>
      :
      hit.title ?
        <Link href={`/articles/${hit.path.split('/')[1]}`} passHref>
          <a>
            <div onClick={() => setSearchOpen(false)} className="flex flex-col w-full bg-slate-50 rounded  hover:bg-blue-100 hover:text-blue-500 transition-colors cursor-pointer">
              <div className="flex flex-col p-4">
                <h5 className="truncate text-base">{hit.title}</h5>
                <p className="text-sm truncate">Czy nobliście wypada spożywać tani rosyjski trunek w obliczu wojny w Ukrainie?  </p>
              </div>
            </div>
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
  return <TextField
    placeholder="Szukaj..."
    InputProps={{
      startAdornment:
        <InputAdornment position='start'>
          <SearchIcon className="text-2xl" />
        </InputAdornment>
    }}
    className="w-full rounded-tr-lg rounded-tl-lg  "
    sx={
      {
        border: 'none !important'
      }
    }
    value={currentRefinement}
    onChange={e => refine(e.currentTarget.value)}
  />
};

const ConnectedSearchBox = connectWithQuery(MySearchBox);