import styled from "@emotion/styled";
import { Avatar } from "@mui/material";
import { GetStaticPathsContext, GetStaticPropsContext } from 'next';
import RichMarkdownEditor from "rich-markdown-editor";
import { firebaseAdmin } from "../../buildtime-deps/firebaseAdmin";
import ContentsList from "../../components/ContentsList.jsx";
import { SidenavContent } from "../../providers/SidenavProvider";
import { ArticleContents } from "../account/editor/edit";

export const getStaticPaths = async (ctx: GetStaticPathsContext) => {
  const articles = await firebaseAdmin
    .firestore()
    .collection(`articles`)
    .get();

  const paths = articles.docs.map((article) => ({
    params: {
      article: article.id,
    },
  }));


  return {
    paths,
    fallback: 'blocking',
  };
}

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const articleId = ctx.params?.["article"];
  const article = (
    await firebaseAdmin.firestore().doc(`articles/${articleId}`).get()
  ).data();

  let notFound = !article;

  return {
    props: {
      article,
    },
    revalidate: 60 * 60 * 12,
    notFound,
  };
};

const Article = ({ article }: { article: ArticleContents }) => {
  return <>
    <div className={'w-full flex items-center justify-between'}>
      <div className={'flex items-center'}>
        <Avatar src={article.authorPictureURL} className={'mr-2'} sx={{ width: '1.5rem', height: '1.5rem' }} />
        <p>{article.authorName}</p>
      </div>
      <p>{article.date}</p>
    </div>
    <div className={'mb-8 mt-6'} />
    <h1>{article.title}</h1>
    <h4>{article.subtitle}</h4>
    <div
      className={
        "w-full flex items-center justify-center rounded-t border rounded-lg mb-8 mt-4 bg-slate-100 h-40"
      }
      style={{
        backgroundImage: `url(${article.coverURL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
    {
      article.contents.map((content, index) => {
        return <>
          {content.type === 'markdown' ?
            <div className={'w-full mb-4 mt-4'}>
              <RichMarkdownEditor readOnly defaultValue={content.value as string} />
            </div>
            :
            <div className={'flex flex-col items-center'}>
              <div
                className={'mt-4 mb-4 w-full flex-col items-center justify-center bg-slate-50 rounded'}>
                <SizedImage alt={(content.value as { url: string, caption: string }).caption}
                  className={'mx-auto'}
                  src={(content.value as { url: string, caption: string }).url} />
              </div>
              <p className={'italic'}>{(content.value as { url: string, caption: string }).caption}</p>
            </div>

          }
        </>
      })
    }
    <SidenavContent>
      <ContentsList />
    </SidenavContent>
  </>
}
export default Article;

const SizedImage = styled.img`
  width: 55%;
  @media (max-width: 900px) {
    width: 75%
  };
  @media (max-width: 600px) {
    width: 90%;
  }
  @media (max-width: 450px) {
    width: 100%;
    background: transparent;
  }

  border-radius: 20px;
`;
