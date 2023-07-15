import { Avatar, FormControl, InputLabel, MenuItem, Pagination, PaginationItem, Select } from "@mui/material";
import { GetStaticPropsContext } from "next";
import { firebaseAdmin } from "../../../../buildtime-deps/firebaseAdmin";
import { SidenavContent } from "../../../../providers/SidenavProvider";
import { ArticleContents } from "../../../account/editor/edit";

import { Bookmark } from "@mui/icons-material";
import Link from 'next/link';
import { useRouter } from "next/router";
import React from "react";




export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const category = ctx.params?.["category"];
  const page = ctx.params?.["page"];

  let articles: ArticleContents[]
  let pagesNumber: number = 1;
  let allCategoriesDocsNumber: number = 0;
  let categories: string[] = [];

  try {
    (await firebaseAdmin.firestore().collection('article-categories').get()).docs.forEach(doc => {
      categories.push(doc.id);
      allCategoriesDocsNumber += doc.data().count;
      if (
        doc.id === category
      ) {
        pagesNumber = Math.ceil(doc.data().count / 10);
      }
    });

    if (parseInt(page as string) === 1) {
      if (category !== 'all') {
        articles = (await firebaseAdmin.firestore().collection(`articles`).where('category', '==', category).limit(10).get()).docs.map(
          (doc) => ({ ...doc.data(), id: doc.id })
        ) as ArticleContents[];
        articles = [...articles, ...((await firebaseAdmin.firestore().collection(`articles`).where('newCategory', '==', category).limit(10).get()).docs.map(
          (doc) => ({ ...doc.data(), id: doc.id })
        ) as ArticleContents[])];
      } else {

        articles = (await firebaseAdmin.firestore().collection(`articles`).limit(10).get()).docs.map(
          (doc) => ({ ...doc.data(), id: doc.id })
        ) as ArticleContents[];
      }
    }
    else {
      if (category !== 'all') {
        const firstDocs = (await firebaseAdmin.firestore().collection(`articles`).where('category', '==', category).limit(10 * (parseInt(page as string) - 1)).get()).docs
        articles = (await firebaseAdmin.firestore().collection(`articles`).where('category', '==', category).startAfter(firstDocs[firstDocs.length - 1]).limit(10).get()).docs.map(
          (doc) => ({ ...doc.data(), id: doc.id })
        ) as ArticleContents[];
        articles = [...articles, ...((await firebaseAdmin.firestore().collection(`articles`).where('newCategory', '==', category).startAfter(firstDocs[firstDocs.length - 1]).limit(10).get()).docs.map(
          (doc) => ({ ...doc.data(), id: doc.id })
        ) as ArticleContents[])];
      }
      else {
        const firstDocs = (await firebaseAdmin.firestore().collection(`articles`).limit(10 * (parseInt(page as string) - 1)).get()).docs
        articles = (await firebaseAdmin.firestore().collection(`articles`).startAfter(firstDocs[firstDocs.length - 1]).limit(10).get()).docs.map(
          (doc) => ({ ...doc.data(), id: doc.id })
        ) as ArticleContents[];
      }
    }
    if (articles.length === 0)
      return {
        props: {},
        notFound: true,
      }
    return {
      props: {
        articles,
        category,
        pagesNumber: category === 'all' ? Math.ceil(allCategoriesDocsNumber / 10) : pagesNumber,
        categories,
        page: parseInt(page as string)
      },
    }
  } catch (e) {
    return {
      props: {
      },
      notFound: true
    }
  }
}
export const getStaticPaths = async () => {
  const categories = (await firebaseAdmin.firestore().collection('article-categories').get()).docs.map(
    (doc) => ({ category: doc.id, count: doc.data().count, pages: Math.floor(doc.data().count / 10) + 1 })
  );
  const allCount = categories.reduce((acc, cur) => acc + cur.count, 0);
  const paths: string[] = [];
  for (let i = 1; i <= Math.floor(allCount / 10) + 1; i++) {
    paths.push(`/articles/list/all/${i}`);
  }
  for (const category of categories) {
    for (let i = 1; i <= category.pages; i++) {
      paths.push(`/articles/list/${category.category}/${i}`);
    }
  }

  return {
    paths: paths,
    fallback: 'blocking'
  }
}



const Articles = ({ articles, category, pagesNumber, page, categories }: {
  articles: ArticleContents[],
  category: string,
  pagesNumber: number,
  categories: string[],
  page: number
}) => {
  const selectRef = React.useRef(null);
  const router = useRouter();

  React.useEffect(
    () => {
      const handler = (e: any) => { }


    }, []
  )

  return (
    <>
      <h1><Bookmark color='primary' className="mr-2 -translate-y-[0.15rem]" />Blog</h1>
      <p>
        Dowiedz się więcej o swojej sprawie czytając nasze artykuły.
      </p>
      <div className="flex items-end my-4 w-full flex-col">
        <FormControl className='w-fit self-end'>
          <InputLabel>kategoria</InputLabel>

          <Select defaultValue={category} onChange={
            (e) => {
              router.push(
                `/articles/list/${e.target.value}/1`
              )
            }
          } value={category} size='small' label='kategoria'>
            <MenuItem value='all'>
              wszystkie artykuły
            </MenuItem>
            {
              categories.map(category => <MenuItem value={category}>
                {category}
              </MenuItem>)
            }
          </Select>

        </FormControl>
      </div>
      {articles.map((article) => (
        <Link href={`/articles/${article.id}`} passHref>
          <a>
            <div className={"flex flex-col w-full"}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(20px)",
                }}
                className={
                  "flex flex-col w-full rounded-xl hover:bg-blue-50 mt-4 transition-transform cursor-pointer"
                }
              >
                <div
                  className={
                    "w-full flex items-center justify-center rounded-t-xl bg-slate-100 h-40"
                  }
                  style={{
                    backgroundImage: `url(${article.coverURL})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <div className={"flex flex-col p-4 "}>
                  <h3 className={"mb-0 truncate"}>{article.title}</h3>
                  <div className={"flex"}>
                    <p className={"min-w-0 truncate"}>{article.subtitle}</p>
                    <div className={"flex-1"}></div>
                  </div>
                </div>

                <div
                  className={"p-4 text-sm pt-0 flex items-center justify-between"}
                >
                  <div className={"flex items-center"}>
                    <Avatar
                      src={article.authorPictureURL}
                      className={"mr-2"}
                      sx={{ height: "1.5rem", width: "1.5rem" }}
                    />
                    <p>{article.authorName}</p>
                  </div>
                  <p>{article.date}</p>
                </div>
              </div>
            </div>
          </a>
        </Link>
      ))}
      <div className={'mb-4'} />

      <SidenavContent>
        <pre>Kategorie</pre>
      </SidenavContent>

      <Pagination shape="rounded" color={'primary'} renderItem={(props) =>

        props.page && (props.page > pagesNumber || props.page < 1) || !props.page
          ? <PaginationItem {...props} />
          : <Link passHref href={`/articles/list/${category}/${props.page}`}>
            <a>
              <PaginationItem {...props} />
            </a>
          </Link>} className='mb-4 mt-8' count={pagesNumber} page={page} />
    </>
  );
};
export default Articles;
