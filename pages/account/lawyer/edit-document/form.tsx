import { doc, getDoc } from '@firebase/firestore';
import { ArrowBack, Bookmark } from "@mui/icons-material";
import { Button, Skeleton } from '@mui/material';
import { useRouter } from "next/router";
import React from "react";
import { IFormData } from "..";
import { firestore } from "../../../../buildtime-deps/firebase";
import FormEditor from '../../../../components/form-edit/FormEditor';
import { useAuth } from '../../../../providers/AuthProvider';
import FormDescriptionProvider from '../../../../providers/FormDescriptionProvider/FormDescriptionProvider';
import FormTemplateDescriptionProvider from '../../../../providers/FormDescriptionProvider/FormTemplateDescriptionProvider';

const EditDocumentForm = () => {
  const [form, setForm] = React.useState<IFormData | null>(null);
  const [id, setId] = React.useState<string>('');
  const router = useRouter();
  const { userProfile } = useAuth();

  const [verifying, setVerifying] = React.useState<boolean>(false);




  React.useEffect(() => {
    if (router.isReady) {
      let newQuery: any = router.query.random === 'true' ? { id: router.query.id, random: true } : { id: router.query.id }
      if (router.query.verifying === 'true') {
        newQuery = { ...newQuery, verifying: 'true' }
        setVerifying(true);
      }
      router.replace({ pathname: router.pathname, query: newQuery })
    }
    if (userProfile && router.isReady && router.query['id']) {
      setId(router.query['id'] as string);
      getDoc(doc(firestore, `forms/${router.query['id']}`)).then(
        (document) => {
          if (!document.data()) {
            router.push('/account/lawyer');
            return;
          }
          if (document.data()?.awaitingVerification && router.query.verifying !== 'true')
            router.push('/account/lawyer/edit-document?id=' + router.query['id']);
          setForm(document.data() as IFormData);
        }).catch(() => {
          router.push('/account/lawyer');
        })
    }
    if (router.isReady && !router.query['id'])
      router.push('/account/lawyer');
  }, [router.isReady])

  return <article className='w-full flex flex-col items-stretch mb-6'>
    <Button size='small' disabled={!id} onClick={() => router.push(`/account/lawyer/edit-document?id=${id}`)} className='bg-blue-100 rounded mb-12 border-none w-full flex items-center justify-between'>
      <ArrowBack />
      Wróć do pisma
    </Button>
    <h1>
      <Bookmark className="-translate-y-0.5 mr-1" color='primary' />
      {verifying ? 'Weryfikujesz' : 'Edytujesz'} formularz pisma
    </h1>
    {userProfile && form ?
      <>
        <p><i>{form.title}</i></p>
        <FormDescriptionProvider id={id} initValue={form.formData}>
          <FormTemplateDescriptionProvider initValue={form.templateData}>
            <FormEditor />
          </FormTemplateDescriptionProvider>
        </FormDescriptionProvider>
      </>
      :
      <>
        <Skeleton variant='rectangular' className='mt-6 rounded' height={110} />
        <span className='flex items-center w-full mt-1'>
          <Skeleton className='mb-4 flex-1 mr-4' />
          <Skeleton className='mb-4' style={{ flex: 0.2 }} />
        </span>
      </>
    }
  </article>;
}



export default EditDocumentForm;
