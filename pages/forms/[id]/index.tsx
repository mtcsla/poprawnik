import { ArrowRight, Bookmark } from '@mui/icons-material';
import { Avatar, Button } from '@mui/material';
import { GetStaticPropsContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { firebaseAdmin } from '../../../buildtime-deps/firebaseAdmin';
import LogoHeader from '../../../components/LogoHeader';
import useWindowSize from '../../../hooks/WindowSize';
import BodyScrollLock from '../../../providers/BodyScrollLock';

export const getStaticPaths = async () => {
  const paths: string[] = [];
  await (await (firebaseAdmin.firestore().collection('products').get())).forEach(
    (doc) => {
      paths.push('/forms/' + doc.id);
    }
  )
  console.log(paths)

  return { paths, fallback: true };
}
export const getStaticProps = async (context: GetStaticPropsContext) => {
  if (
    !context.params?.id
  )
    return { props: { error: 'No id', form: null } }

  try {
    const form = (await firebaseAdmin.firestore().doc(`products/${context.params!.id}`).get()).data()
    console.log(context.params)

    return { props: { form: form ?? null, error: '' } };
  }
  catch (err) {
    return { props: { error: 'Form not found', form: null } }
  }
}

const FormIndex = ({ form, error }: { form: any, error: string }) => {
  const router = useRouter();

  const { width } = useWindowSize();

  return <BodyScrollLock>
    <div className={`flex sm:px-8 fixed top-0 overflow-y-auto right-0 left-0 bottom-0 items-stretch bg-white `} style={{ zIndex: 201, backgroundImage: 'url(/bg-new-light.svg)', backgroundSize: 'cover' }}>
      <div className='h-full' style={{ flex: width != null && width < 1100 ? 1 : 0.5 }} >
        <div className='flex h-fit min-h-full flex-col flex-1  px-8 pb-8 pt-6 bg-opacity-20 bg-white self-stretch'>
          <LogoHeader noPadding noBackgroundImportant social={false} border={false} />
          <pre className='mt-4 self-end'>Zamierzasz wykonać pismo</pre>
          <pre className='text-xs mt-4'>Tytuł pisma</pre>
          <h2 className='mt-1 mb-4 flex'><Bookmark color='primary' className='mr-2 translate-y-1' />{form?.title}</h2>
          <div className='inline-flex self-stretch gap-3 flex-wrap sm:gap-6  justify-between'>
            <div className='self-end flex flex-col mt-4'>
              <pre className='text-xs'>Stworzone przez</pre>
              <div className='items-center flex mb-4'>
                <Avatar className='my-2 ml-2' src={form?.authorPictureURL} />
                <span className='flex flex-col ml-3'>
                  <p className='text-sm'>
                    {form?.authorName}
                  </p>
                  <pre className='text-xs mt-1'>Deweloper</pre>
                </span>
              </div>

              <pre className='text-xs'>Zweryfikowane przez</pre>
              <div className='items-center flex w-fit'>
                {
                  form?.verifiedBy === 'admin'
                    ? <><LogoHeader noBackground={true} noBackgroundImportant noWidth={true} noPadding noText border={false} />

                      <span className='flex flex-col ml-2'>
                        <p className='text-sm whitespace-nowrap truncate'>
                          Serwis <pre className='inline ml-1'>Poprawni<b className='text-blue-500'>k</b></pre>
                        </p>
                        <pre className='text-xs mt-1'>administrator</pre>
                      </span>
                    </>

                    : null
                }
              </div>
            </div>
            <div className='flex flex-col flex-1'>
              <pre className='mt-2 text-sm'>Opis</pre>
              <p style={{ minHeight: 100 }} className='w-full p-2 mt-2 sm:p-4 h-full bg-white rounded-lg border'>{form?.description}</p>
            </div>
          </div>
          <div className='flex-1' />
          <p className='self-end text-lg'>
            <pre className='text-sm mr-1 inline'>Cena:</pre>
            <b>
              {(form?.price / 100).toFixed(2).toString().replace('.', ',')}zł
            </b>
          </p>
          <p className='text-sm text-slate-500 self-end'>(przejście dalej nie oznacza zakupu pisma - decyzję o zakupie podejmiesz po wypełnieniu formularza)</p>
          <Link passHref href={`/forms/${router.query.id}/form`}>
            <a className='w-full'>
              <Button className='w-full p-2 mt-8 sm:p-4 bg-blue-400 text-white border-none' >Przejdź do formularza <ArrowRight className='ml-1' /></Button>
            </a>
          </Link>

        </div>
      </div>
    </div>
  </BodyScrollLock>
}

export default FormIndex;
