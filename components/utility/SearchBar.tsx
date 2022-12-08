import styled from "@emotion/styled";
import { ExpandLess, KeyboardCommandKey, Search } from "@mui/icons-material";
import { Button } from "@mui/material";
import React from "react";
import useWindowSize from "../../hooks/WindowSize";
import { useSearch } from "../../providers/SearchProvider";

const SearchBarDiv = styled.div`
.keys {
  color: rgb(100,116,139);
}
&:hover .keys {
  color: rgb(59,130,246);
}
`

export default function SearchBar() {
  const { width } = useWindowSize();
  const { setSearchOpen } = useSearch();

  const onSearch = () => setSearchOpen(true);
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(
    () => { setIsMac(window.navigator.platform.toLowerCase().includes('mac')); }, []
  )


  return (
    width && width > 720
      ? <SearchBarDiv
        className={
          "mr-3  bg-slate-50 hover:bg-blue-100 rounded cursor-pointer transition-colors flex items-center p-2"
        }
        onClick={onSearch}
        style={{ height: '2rem', width: 200 }}
      >
        <Search
          color={"primary"}
          sx={{ fontSize: "1.2rem !important" }}
        />
        <p className={"ml-2 text-sm text-slate-500"}>Szukaj...</p>

        <pre className="text-sm keys flex transition-colors items-center  rounded p-1 px-1.5  ml-auto">
          {
            isMac
              ? <KeyboardCommandKey className="mr-1 text-inherit" />
              : <ExpandLess className="mr-1 text-inherit" />
          }
          K
        </pre>
      </SearchBarDiv>
      : <Button className="mr-3 bg-slate-50 " sx={{ padding: "0.4rem", height: '2rem' }}>
        <Search
          onClick={onSearch}
          sx={{ fontSize: "20px !important" }}
        />
      </Button>
  )
}