import { doc, getDoc } from '@firebase/firestore';
import { Bookmark } from "@mui/icons-material";
import { Skeleton } from '@mui/material';
import { useRouter } from "next/router";
import React from "react";
import { IFormData } from "..";
import { firestore } from "../../../../buildtime-deps/firebase";
import FormEditor from '../../../../components/form-edit/FormEditor';
import { useAuth } from '../../../../providers/AuthProvider';
import FormDescriptionProvider from '../../../../providers/FormDescriptionProvider/FormDescriptionProvider';

const EditDocumentForm = () => {
  const [form, setForm] = React.useState<IFormData | null>(null);
  const [id, setId] = React.useState<string>('');
  const router = useRouter();
  const { userProfile } = useAuth();


  React.useEffect(() => {
    if (router.isReady) {
      const newQuery = { id: router.query.id }
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
          setForm(document.data() as IFormData);
        })
    }
    if (router.isReady && !router.query['id'])
      router.push('/account/lawyer');
  }, [router.isReady])

  return <article className='w-full flex flex-col items-stretch mb-6'>
    <h1>
      <Bookmark className="-translate-y-0.5 mr-1" color='primary' />
      Edytujesz formularz pisma
    </h1>
    {userProfile && form ?
      <>
        <p><i>{form.title}</i></p>
        <FormDescriptionProvider id={id} initValue={form.formData}>
          <FormEditor />
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
