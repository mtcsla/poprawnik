import { ArrowRight, Search } from '@mui/icons-material';
import { Avatar, Button } from '@mui/material';
import { GetStaticPropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ExplanationAnimation, PhasedExplanationAnimation } from '../..';
import { firebaseAdmin } from '../../../buildtime-deps/firebaseAdmin';
import LogoHeader from '../../../components/LogoHeader';
import useWindowSize from '../../../hooks/WindowSize';
import { useAuth } from '../../../providers/AuthProvider';

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
  const { userProfile } = useAuth();

  return <> <Head>
    <title>Wykonaj {(form?.title as string | undefined)?.toLowerCase()} • POPRAWNIK</title>
    <meta name="description" content={form?.description}></meta>
  </Head>
    <header className='fixed bg-white sm:bg-opacity-50 backdrop-blur top-0 px-8 sm:px-12 md:px-16 flex left-0 h-16 w-full' style={{ zIndex: 2000 }}>
      <div className='h-full w-full flex items-center justify-between m-auto'>
        <div className='inline-flex items-center'>
          <LogoHeader noBackground noPadding noWidth png />
        </div>

        <span className='flex items-center'>
          {
            width && width > 720
              ? <div
                className={
                  "mr-3  bg-slate-50 hover:bg-blue-100 rounded cursor-text transition-colors flex items-center p-2"
                }
                style={{ height: '2rem', width: 200 }}
              >
                <Search
                  color={"primary"}
                  sx={{ fontSize: "1.2rem !important" }}
                />
                <p className={"ml-2 text-sm text-slate-500"}>Szukaj...</p>
              </div>
              : <Button className="mr-3 bg-slate-50 " sx={{ padding: "0.4rem", height: '2rem' }}>
                <Search sx={{ fontSize: "20px !important" }} />
              </Button>

          }
          <Avatar role="button" variant='rounded' src={userProfile?.photoURL} className='w-8 h-8 hover:bg-blue-100 cursor-pointer text-blue-400 bg-slate-50' />
        </span>
      </div>
    </header>
    <div className={`inline-flex bg-white items-stretch h-full pt-16 w-full min-h-full`} style={{ zIndex: 201, }}>
      <div className='h-full bg-white flex w-full' style={{ flex: 1, }}  >
        <div className='mx-auto my-auto flex h-fit flex-col flex-1 px-8 py-8    sm:px-12 md:px-16 md:py-16 sm:py-12 pt-6 self-stretch'>
          <div className='flex mb-4 flex-col self-start'>
            <h1 className='mt-4 text-2xl font-bold sm:text-4xl whitespace-normal  text-black mb-2 flex'>{form?.title}</h1>
            <div className='inline-flex gap-3 flex-wrap w-full justify-between'>
              <pre className='whitespace-normal'>{form?.category}</pre>
              <p className='text-lg ml-auto sm:text-xl mt-2'>
                {(form?.price / 100).toFixed(2).toString().replace('.', ',')}zł<b className='text-blue-500'>*</b>
              </p>
            </div>
          </div>
          <p className='w-full mb-8 sm:text-lg mt-2 h-full rounded-lg'>
            {form?.description}
          </p>


          <div className='flex-1' />
          {width && width < 1024 && false
            ? <div className=' h-full flex rounded-lg my-8 flex-col justify-center w-full bg-slate-50 bg-blend-multiply p-4 sm:p-12' style={{
              flex: 1 / 2, backgroundSize: 'cover', //backgroundImage: 'url(/bg-new-light.svg)',
            }}>
              <pre className='text-lg mb-2 self-end text-black text-right mt-auto'>Jak to działa?</pre>
              <ExplanationAnimation className='mx-auto max-w-xs mb-auto w-full' active />
            </div>
            : null
          }
          <Link passHref href={`/forms/${router.query.id}/form`}>
            <a className='w-full'>
              <Button className='w-full p-2 mt-8 sm:p-4 bg-blue-400 text-white border-none' >Przejdź do formularza <ArrowRight className='ml-1' /></Button>
            </a>
          </Link>
          <p style={{ maxWidth: '20rem' }} className='text-sm mt-6 text-slate-500'><b className='text-blue-500'>*</b>przejście dalej nie oznacza zakupu pisma - decyzję o zakupie podejmiesz po wypełnieniu formularza</p>


          <div className='ml-auto self-end w-fit inline-flex mt-6 gap-3 flex-wrap'>

            <div className='flex flex-col ml-auto'>
              <pre className='text-xs'>Autor</pre>
              <div className='items-center flex mb-4'>
                <Avatar className='my-2' src={form?.authorPictureURL} />
                <span className='flex flex-col ml-3'>
                  <p className='text-sm'>
                    {form?.authorName}
                  </p>
                  <pre className='text-xs mt-1'>Deweloper</pre>
                </span>
              </div>
            </div>


            <div className='ml-auto flex flex-col'>
              <pre className='text-xs'>Zweryfikował/a</pre>
              <div className='items-center flex w-fit'>
                {
                  form?.verifiedBy === 'admin'
                    ? <><LogoHeader noBackground noBackgroundImportant noWidth noPadding noText border={false} />

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
          </div>
        </div>
      </div>
      {width && width >= 1024
        ? <div className=' min-h-full flex flex-col justify-center w-full p-8 sm:p-12' style={{ flex: 1 / 2, backgroundSize: 'cover', backgroundImage: 'url(/bg-new-light-2.svg)', }}>
          <div className='bg-slate-50 rounded-lg my-auto p-6'>
            <PhasedExplanationAnimation phase={0} className='mx-auto mb-auto w-full' active />
          </div>
        </div>
        : null
      }
    </div>
  </>
}

export default FormIndex;
