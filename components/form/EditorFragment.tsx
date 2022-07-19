import { Formik } from 'formik';
import { cloneDeep } from 'lodash';
import { useRouter } from 'next/router';
import { FragmentDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import UserField from './Field';
const EditorFragment = ({ fragment, editor, }: { editor: boolean, fragment: FragmentDescription }) => {
  const router = useRouter();

  return <div className='w-full'>
    {fragment.title ?
      <h2 className='p-1 pb-0'>{fragment.title}</h2>
      : editor ? <h2 className='p-1 pb-0'>BRAK TYTUŁU</h2> : null
    }
    {fragment.subtitle ?
      <p className='pl-1 pr-1 mb-6' >{fragment.subtitle}</p>
      : editor ? <p className='pl-1 pr-1 text-sm mb-6  text-slate-500'>BRAK OPISU</p> : null}

    {!fragment.children.length
      ? <div className='m-1 flex items-center justify-center border p-4 w-full h-24 bg-slate-50 mt-4'>
        <pre>Brak Pól</pre>
      </div>
      : <Formik initialValues={{}} onSubmit={() => { }}>{
        ({ values, errors, touched }) =>
          <div className='inline-flex justify-between items-start flex-wrap w-full'>
            {fragment.children.map((field, index) =>
              <span onClick={() => {
                const newQuery = cloneDeep(router.query)
                newQuery.field = (index).toString()
                router.push({ pathname: router.pathname, query: newQuery });
              }}
                className='hover:bg-blue-50 p-1 h-auto hover:rounded-lg cursor-pointer hover:border hover:border-blue-500 mb-1' style={field.fullWidth ? { width: '100%' } : { width: '49%' }}>
                <span className='pointer-events-none w-full'>
                  <UserField  {...{ field, values, errors, touched, inEditor: true }} />
                </span>
              </span>
            )}
          </div>
      }</Formik>}
  </div>;
}

export default EditorFragment;