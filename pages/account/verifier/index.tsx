import { collection, getDocs, query, where } from '@firebase/firestore';
import { Person } from '@mui/icons-material';
import { Avatar } from '@mui/material';
import Link from 'next/link';
import React from 'react';
import { firestore } from '../../../buildtime-deps/firebase';
import { IFormData } from '../lawyer/index';
const VerifierPage = () => {

  const [documents, setDocuments] = React.useState<IFormData[]>([]);

  React.useEffect(() => {
    getDocs(
      query(
        collection(firestore, 'forms'), where('awaitingVerification', '==', true)
      )
    ).then(
      (querySnapshot) => {
        const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IFormData));
        setDocuments(docs as IFormData[]);
      }
    ).catch(() => { })
  }, [])


  return <>
    <h1>
      <Person className='-translate-y-0.5 mr-2' color='primary' />
      Panel weryfikacji
    </h1>
    <p className='mb-8'>Tutaj będą wyświetlać się pisma do weryfikacji.</p>

    {
      documents.map((doc) => {
        return <Link href={'/account/lawyer/edit-document?id=' + doc.id + '&verifying=true'}>
          <a>
            <div className='hover:bg-blue-50 hover:border-blue-500 cursor-pointer mb-8 p-4 border rounded-lg flex flex-col h-36 justify-between ' key={doc.id}>
              <h4 className='mb-4'>{doc.title}</h4>
              <span className='flex w-full justify-between items-center'>
                <p>{doc.authorName}</p>
                <Avatar src={doc.authorPictureURL} />
              </span>
            </div>
          </a>
        </Link>
      })
    }
  </>
}

export default VerifierPage;