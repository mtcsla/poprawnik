import { collection, getDocs } from '@firebase/firestore';
import { Edit } from "@mui/icons-material";
import { Avatar, Skeleton } from '@mui/material';
import Link from 'next/link';
import React from "react";
import { firestore } from "../../buildtime-deps/firebase";

const FormsIndex = () => {
  const [products, setProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    getDocs(
      collection(firestore, 'products')
    ).then(snapshot => {
      setProducts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
    }).catch(
      err => console.error(err)
    )
  }, []);


  return <>
    <h1><Edit className="-translate-y-0.5 mr-1" color='primary' /> Wszystkie pisma</h1>
    <p>Tutaj znajdziesz listę wszystkich pism w naszej ofercie.</p>



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
        :
        products.map(
          (product, index, arr) =>
            <span className='flex flex-col items-stretch'>
              <Link passHref href={`/forms/${product.id}`} >
                <a>
                  <div key={product.id} style={{ minHeight: 120 }} className="flex hover:text-blue-500 hover:bg-blue-50  flex-col justify-between py-4 my-4 bg-white rounded-lg">

                    <pre>{product.title}</pre>
                    <span className='inline-flex gap-4 justify-between w-full items-center'>
                      <p className="self-end">{(product.price / 100).toFixed(
                        2
                      ).toString().replace('.', ',')} zł</p>
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
        )

    }


  </>
}
export default FormsIndex;

