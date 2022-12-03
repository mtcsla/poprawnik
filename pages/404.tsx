import { Quiz, Search } from "@mui/icons-material";
import { useSearch } from "../providers/SearchProvider";

const Page404 = () => {
  const { setSearchOpen } = useSearch();

  return (
    <div className='flex flex-col items-center mx-auto' style={{ maxWidth: '30rem' }} >
      <div className="flex flex-col">
        <h1 className='flex items-center truncate mt-4'>
          <Quiz className='mr-4' color='primary' style={{ fontSize: '50px !important' }} />
          Nie znaleźliśmy strony, której szukasz.
        </h1>
        <p>
          Sprawdź, czy wprowadzony adres jest poprawny, lub skorzystaj z <b className=" text-blue-500 cursor-pointer" onClick={() => setSearchOpen(true)} >
            <Search />
            wyszukiwarki
          </b>, aby znaleźć to, czego potrzebujesz.
        </p>
      </div>
      <img src='/404.svg' className="mx-auto my-8" />

    </div>
  );
}
export default Page404