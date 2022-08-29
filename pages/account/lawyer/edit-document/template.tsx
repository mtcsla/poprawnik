import { Bookmark, Edit } from '@mui/icons-material';
import { Button } from "@mui/material";
import { useRouter } from 'next/router';

import Link from 'next/link';
import React from 'react';

const EditDocumentTemplate = () => {
  const router = useRouter();

  const id = React.useMemo(() => {
    if (!router.isReady)
      return null;
    return router.query.id
  }, [router.isReady])

  return <div className="w-full flex-col pb-8 mb-2">
    <h1 className="inline-flex gap-2 mb-1"><Bookmark color='primary' /> Edytujesz wzór pisma</h1>
    <p>Wypełnij formularz przykładowymi danymi, aby szybko generować podgląd.</p>

    <Link href={`/forms/${id}/form?testing=true`}>
      <Button className='w-full mt-8 p-4 bg-blue-500 text-white hover:bg-blue-400'> Wypełnij formualrz <Edit className='ml-2' /></Button>
    </Link>
    <div className='border p-8 bg-slate-50 mt-8 rounded-lg flex justify-center items-center'><pre>Brak przykładowych danych</pre></div>
  </div>;
}

export default EditDocumentTemplate;
