import { Edit } from "@mui/icons-material";
import { Avatar, FormControl, InputLabel, MenuItem, Pagination, PaginationItem, Select, Skeleton } from '@mui/material';
import { GetStaticPropsContext } from 'next';
import Link from 'next/link';
import { useRouter } from "next/router";
import { firebaseAdmin } from '../../../../buildtime-deps/firebaseAdmin';

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const category = ctx.params?.["category"];
  const page = ctx.params?.["page"];

  let products: any[]
  let pagesNumber: number = 1;
  let allCategoriesDocsNumber: number = 0;
  let categories: string[] = [];

  try {
    (await firebaseAdmin.firestore().collection('categories').get()).docs.forEach(doc => {
      categories.push(doc.id);
      allCategoriesDocsNumber += doc.data().count;
      if (
        doc.id === category
      ) {
        pagesNumber = Math.floor(doc.data().count / 10) + 1;
      }
    });





    if (parseInt(page as string) === 1) {
      if (category !== 'all') {
        products = (await (await firebaseAdmin.firestore().collection(`products`).where('category', '==', category).limit(10)).get()).docs.map(
          (doc) => ({ ...doc.data(), id: doc.id })
        );
      } else {

        products = (await (await firebaseAdmin.firestore().collection(`products`).limit(10)).get()).docs.map(
          (doc) => ({ ...doc.data(), id: doc.id })
        );
      }
    }
    else {
      if (category !== 'all') {
        const firstDocs = (await (await firebaseAdmin.firestore().collection(`products`).where('category', '==', category).limit(10 * (parseInt(page as string) - 1))).get()).docs
        products = (await (await firebaseAdmin.firestore().collection(`products`).where('category', '==', category).startAfter(firstDocs[firstDocs.length - 1]).limit(10)).get()).docs.map(
          (doc) => ({ ...doc.data(), id: doc.id })
        )
      }
      else {
        const firstDocs = (await (await firebaseAdmin.firestore().collection(`products`).limit(10 * (parseInt(page as string) - 1))).get()).docs
        products = (await (await firebaseAdmin.firestore().collection(`products`).startAfter(firstDocs[firstDocs.length - 1]).limit(10)).get()).docs.map(
          (doc) => ({ ...doc.data(), id: doc.id })
        )
      }
    }

    return {
      props: {
        products,
        category,
        pagesNumber: category === 'all' ? Math.floor(allCategoriesDocsNumber / 10) + 1 : pagesNumber,
        categories,
        page: parseInt(page as string)
      },
    }
  } catch (e) {
    return {
      props: {
      },
      notFound: true
    }
  }

}
export const getStaticPaths = async () => {

  const categories = (await firebaseAdmin.firestore().collection('categories').get()).docs.map(
    (doc) => ({ category: doc.id, count: doc.data().count, pages: Math.floor(doc.data().count / 10) + 1 })
  );
  const allCount = categories.reduce((acc, cur) => acc + cur.count, 0);
  const paths: string[] = [`/forms/list/all/${Math.floor(allCount / 10) + 1}`];
  for (const category of categories) {
    for (let i = 1; i <= category.pages; i++) {
      paths.push(`/forms/list/${category.category}/${i}`);
    }
  }

  return {
    paths: paths,
    fallback: 'blocking'
  }
}

const FormsIndex = ({ products, category, page, categories, pagesNumber }: { products: any[], page: number, category: string, categories: string[], pagesNumber: number }) => {

  const router = useRouter();

  return <>
    <h1><Edit className="-translate-y-0.5 mr-1" color='primary' /> Nasze pisma</h1>
    <p>Tutaj znajdziesz listę pism w naszej ofercie.</p>

    {
      !products.length
        ?
        <>
          <Skeleton variant='rectangular' className='rounded mt-8' height={110} />
          <span className='flex items-center w-full mt-1'>
            <Skeleton className='mb-4 flex-1 mr-4' /> <Skeleton className='mb-4' style={{ flex: 0.2 }} />
          </span>
          <Skeleton variant='rectangular' className='rounded' height={110} />
          <span className='flex items-center w-full mt-1'>
            <Skeleton className='mb-4 flex-1 mr-4' /> <Skeleton className='mb-4' style={{ flex: 0.2 }} />
          </span>
          <Skeleton variant='rectangular' className='rounded' height={110} />
          <span className='flex items-center w-full mt-1'>
            <Skeleton className='mb-4 flex-1 mr-4' /> <Skeleton className='mb-4' style={{ flex: 0.2 }} />
          </span>
        </>
        : <>
          <div className=' mt-6 w-full flex justify-end'>
            <FormControl className='w-fit self-end'>
              <InputLabel>kategoria</InputLabel>

              <Select defaultValue={category} onChange={
                (e) => {
                  router.push(
                    `/forms/list/${e.target.value}/${1}`
                  )
                }
              } value={category} size='small' label='kategoria'>
                <MenuItem value='all'>
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
          {products.map(
            (product, index, arr) =>
              <span className='flex flex-col items-stretch'>
                <Link passHref href={`/forms/${product.id}`} >
                  <a>
                    <div key={product.id} style={{ minHeight: 120 }} className="flex hover:text-blue-500 hover:bg-blue-50  flex-col justify-between p-4 my-4 bg-white rounded-lg">
                      <div className='w-full inline-flex items-center gap-3 flex-wrap'>
                        <pre>{product.title}</pre>
                        <pre className='ml-auto text-xs'>{product.category}</pre>
                      </div>
                      <span className='inline-flex gap-4 justify-between w-full items-center'>
                        <p className="self-end">{(product.price / 100).toFixed(2).toString().replace('.', ',')} zł</p>
                        <span className='inline-flex gap-3 items-center'>
                          <Avatar src={product.authorPictureURL} />
                          <span className='flex flex-col'>
                            <p className='font-bold text-sm'>{product.authorName}</p>
                            <pre className='text-sm'>Deweloper</pre>
                          </span>
                        </span>
                      </span>
                    </div>
                  </a>
                </Link>
                {
                  index != arr.length - 1
                    ? <div className='border-t my-4' />
                    : null
                }
              </span>
          )}
          <Pagination color={'primary'} renderItem={(props) =>

            props.page && (props.page > pagesNumber || props.page < 1) || !props.page
              ? <PaginationItem {...props} />
              : <Link passHref href={`/forms/list/${category}/${props.page}`}>
                <a>
                  <PaginationItem {...props} />
                </a>
              </Link>} className='mb-4 mt-2' count={pagesNumber} page={page} />

        </>
    }


  </>
}
export default FormsIndex;

