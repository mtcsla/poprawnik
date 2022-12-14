import { ArrowForward, Shield } from '@mui/icons-material';
import { Avatar, Button } from '@mui/material';
import { GetStaticPropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Explanation, Footer, PhasedExplanationAnimation } from '../..';
import { firebaseAdmin } from '../../../buildtime-deps/firebaseAdmin';
import LogoHeader from '../../../components/LogoHeader';
import SearchBar from '../../../components/utility/SearchBar';
import useWindowSize from '../../../hooks/WindowSize';
import { useAuth } from '../../../providers/AuthProvider';
import { useSearch } from '../../../providers/SearchProvider';
import { getUserData } from '../../api/get-user-data.public';

export const getStaticPaths = async () => {
	const paths: string[] = [];
	await (await (firebaseAdmin.firestore().collection('products').get())).forEach(
		(doc) => {
			paths.push('/forms/' + doc.id);
		}
	)
	return { paths, fallback: true };
}
export const getStaticProps = async (context: GetStaticPropsContext) => {
	if (
		!context.params?.id
	)
		return { props: { form: null }, notFound: true }

	try {
		const form = (await firebaseAdmin.firestore().doc(`products/${context.params!.id}`).get()).data()
		if (!form)
			return { props: { form: null }, notFound: true };

		const author = await getUserData(form?.author);
		const verifiedBy = form?.verifiedBy === 'admin'
			? { displayName: 'admin', photoURL: '/logo1.png', uid: 'admin' }
			: await getUserData(form?.verifiedBy);

		return { props: { form: form, author: author, verifiedBy } };
	}
	catch (err) {
		console.log(err);
		return { props: { error: 'Server error', form: null }, notFound: true }
	}
}

type UserDataType = {
	displayName: string,
	photoURL: string,
	uid: string
}

const FormIndex = ({ form, author, verifiedBy, error }: { form: any, error: string, author: UserDataType, verifiedBy: UserDataType }) => {

	const router = useRouter();

	const { width } = useWindowSize();
	const { setSearchOpen } = useSearch();
	const onSearch = () => setSearchOpen(true);

	const { userProfile } = useAuth();

	return <> <Head>
		<title>Wykonaj {(form?.title as string | undefined)?.toLowerCase()} • POPRAWNIK</title>
		<meta name="description" content={form?.description}></meta>
	</Head>
		<DisplayHeader />
		<div className="min-h-72 h-fit pt-16 px-8 sm:px-12" style={{
			backgroundImage: `url(/bg-light-blue.svg)`,
			backgroundSize: 'cover'
		}} >

			<div className='flex flex-col mx-auto py-8 text-white max-w-[60rem]'>
				<div className='inline-flex mb-4 gap-2 flex-col self-end'>
					<div className='inline-flex items-center gap-4'>
						<Avatar className='bg-blue-100 text-blue-500' variant='rounded' src={author?.photoURL} />
						<div>
							<pre className='text-sm text-white'>Stworzył/a</pre>
							<p className='text-sm text-blue-200'>
								{author?.displayName} <ArrowForward className='text-lg' />
							</p>
						</div>
					</div>
					<div className='inline-flex items-center gap-4'>
						<Avatar children={
							<Shield />
						} variant='rounded' className='bg-blue-100 text-blue-500' />
						<div>
							<pre className='text-sm text-white'>Zweryfikował/a</pre>
							<p className='text-sm'>
								{verifiedBy?.displayName === 'admin' ? <>serwis <pre className='inline text-white'>POPRAWNIK</pre></> : verifiedBy?.displayName}
							</p>
						</div>
					</div>
				</div>
				<h1 className='sm:text-5xl'>
					{form?.title}
				</h1>
				<pre className='whitespace-normal text-white opacity-70'>
					{form?.category}
				</pre>
				<p className='self-end text-lg mt-8'>
					tylko
					{" "}
					<strong className='text-blue-200'>{(form?.price / 100)?.toFixed(2).toString().replace(/\./g, ',')}zł</strong><sup>*</sup>
				</p>
			</div>
		</div>

		<div className='flex flex-col py-20 px-8 sm:px-12'>
			<div className='inline-flex gap-4 flex-col sm:flex-row max-w-[60rem] my-8 w-full mx-auto'>
				<div className='flex flex-col'>
					<pre>Opis pisma</pre>
					<p className='my-3'>
						{form?.description}
					</p>

					<p className='mt-8 text-xs text-slate-500'>
						<sup>*</sup>Cena zawiera podatek VAT
						<br />
						<sup>†</sup>Przejście do formularza nie oznacza zakupu pisma - decyzję o zakupie podejmujesz dopiero przy finalizacji
					</p>
				</div>
				<div className='flex flex-col ml-auto w-auto'>
					<PhasedExplanationAnimation className='sm:h-[12rem] ' phase={0} active />
					<Link href={`/forms/${router.query.id}/form`} passHref><a>
						<Button className='bg-blue-100 w-full'>Przejdź do formularza<sup>†</sup><ArrowForward className='ml-2' /></Button>
					</a>
					</Link>
				</div>
			</div>
			<div className='mx-auto my-8 self-end  w-full max-w-[60rem] flex flex-col'>
				<h1 className='text-right font-bold self-end'>Jak to działa?</h1>
				<pre className='text-right self-end whitespace-normal'>Wątpliwości? Spieszymy z pomocą!</pre>
			</div>
			<Explanation reverse />

			<Link href={`/forms/${router.query.id}/form`} passHref><a className='mx-auto max-w-[60rem] w-full'>
				<Button className='bg-blue-100 p-2 max-w-[60rem] mt-8 w-full'>Przejdź do formularza<sup>†</sup><ArrowForward className='ml-2' /></Button>
			</a>
			</Link>
		</div>

		<Footer />


	</>
}

export default FormIndex;

export const DisplayHeader = () => {
	const { userProfile } = useAuth();
	const { width } = useWindowSize();
	return <header className='absolute bg-transparent z-0 text-white top-0 z-80 px-8 sm:px-12 flex left-0 h-16 w-full' style={{ zIndex: 2000 }}>
		<div style={{ maxWidth: '60rem' }} className='h-full z-50 w-full flex items-center justify-between m-auto'>

			<LogoHeader noText={!!width && width < 640} textWhite noBackground noPadding noWidth png />

			<span className='flex items-center'>
				<SearchBar />
				<Avatar role="button" variant='rounded' src={userProfile?.photoURL} className='w-8 h-8 hover:bg-blue-100 cursor-pointer text-blue-400 bg-slate-50' />
			</span>

		</div>
	</header>
}