import ContentsList, { headingToId } from '../components/ContentsList';
import { useAuth } from '../providers/AuthProvider';
import { SidenavContent } from '../providers/SidenavProvider';

//export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
//}


const Dashboard = (props: any) => {
  const { userProfile } = useAuth();
  return (
    <>
      <article>
        <h4>To jest strona startowa.</h4>
      </article>
      <SidenavContent>
        <ContentsList></ContentsList>
      </SidenavContent>

    </>
  )
}

export const AnchorableHeading = ({ type, children }: { type: 'h2' | 'h3', children: string }) => {
  return <span>
    <a id={`h-${headingToId(children)}`} className='invisible absolute' style={{ marginTop: '-4rem' }} />
    {
      type === 'h2'
        ? <h2 id={headingToId(children)}>{children}</h2>
        : <h3 id={headingToId(children)}>{children}</h3>
    }
  </span>
}

export default Dashboard
