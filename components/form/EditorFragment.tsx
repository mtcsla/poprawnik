import { DoneAllTwoTone } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Formik } from 'formik';
import { cloneDeep } from 'lodash';
import { useRouter } from 'next/router';
import { FieldDescription, FragmentDescription, useFormDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import UserField, { FieldProps } from './Field';
const EditorFragment = ({ fragment, editor, }: { editor: boolean, fragment: FragmentDescription }) => {
  const router = useRouter();

  const { description, currentDescription } = useFormDescription();
  const rightDescription = editor ? description : currentDescription;

  return <div className='w-full'>
    <pre className='font-normal hidden whitespace-pre-wrap'>{JSON.stringify(fragment, undefined, 2)}</pre>
    {fragment.title ?
      <h2 className='p-1 pb-0 inline-flex gap-3 text-xl'>
        <DoneAllTwoTone color='primary' className='translate-y-0.5' />
        {fragment.title}
      </h2>
      : editor ? <h2 className='p-1 pb-0'>BRAK TYTUŁU</h2> : null
    }
    {fragment.subtitle ?
      <p className='pl-1 pr-1 mb-6 font-normal' >{fragment.subtitle}</p>
      : editor ? <p className='pl-1 pr-1 text-sm mb-6  text-slate-500'>BRAK OPISU</p> : null}

    {!fragment.children.length
      ? <div className='m-1 flex items-center justify-center border p-4 w-full h-24 bg-slate-50 mt-4'>
        <pre>Brak Pól</pre>
      </div>
      : <Formik initialValues={{}} onSubmit={() => { }}>{
        ({ values, errors, touched }) =>
          <div className='inline-flex justify-between items-start flex-wrap w-full'>
            {fragment.children.map((element, index) =>

              <Button onClick={() => {
                const newQuery = cloneDeep(router.query)
                newQuery.field = (index).toString()
                router.push({ pathname: router.pathname, query: newQuery });
              }}
                className='font-normal normal-case  p-1 pb-0 hover:bg-transparent h-auto border-transparent mb-1' style={element.fullWidth ? { width: '100%' } : { width: '49%' }}>
                <span className='pointer-events-none w-full'>
                  <UserField display fullWidth  {...{ element, formDescription: description } as FieldProps<FieldDescription>} />
                </span>
              </Button>
            )}
          </div>
      }</Formik>}
  </div>;
}

export default EditorFragment;