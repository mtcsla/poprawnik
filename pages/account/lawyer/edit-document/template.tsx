import { ArrowRight, Bookmark } from '@mui/icons-material';
import { Button } from "@mui/material";

const EditDocumentTemplate = () => {
  return <div className="w-full flex-col pb-8">
    <h1 className="inline-flex gap-2 mb-1"><Bookmark color='primary' /> Edytujesz wzór pisma</h1>
    <p>Wypełnij formularz przykładowymi danymi, aby szybko generować podgląd.</p>

    <Button className='w-full mt-4'>Wypełnij formualrz<ArrowRight className='ml-2' /></Button>
    <div className='border p-4 bg-slate-50 mt-4 rounded-lg flex justify-center items-center'><pre>Brak przykładowych danych</pre></div>
  </div>;
}

export default EditDocumentTemplate;
