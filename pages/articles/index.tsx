import { Avatar } from "@mui/material";
import { GetStaticPropsContext } from "next";
import { firebaseAdmin } from "../../buildtime-deps/firebaseAdmin";
import { SidenavContent } from "../../providers/SidenavProvider";
import { IArticleContents } from "../account/editor/edit";

import Link from 'next/link';

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const articles: IArticleContents[] = [];
  try {
    (
      await firebaseAdmin
        .firestore()
        .collection("articles")
        .where("visible", "==", true)
        .get()
    ).forEach((doc) =>
      articles.push({ id: doc.id, ...doc.data() } as IArticleContents)
    );

    return {
      props: {
        articles,
      },
      revalidate: 60 * 60 * 12,
    };
  } catch {
    return { props: { articles: [] } };
  }
};

const Articles = ({ articles }: { articles: IArticleContents[] }) => {
  return (
    <>
      <h1>Wszystkie artykuły</h1>
      {articles.map((article) => (
        <Link href={`articles/${article.id}`} passHref>
          <a>
            <div className={"flex flex-col w-full"}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(20px)",
                }}
                className={
                  "flex flex-col w-full rounded-xl hover:border-blue-400 hover:bg-slate-50 mt-4 transition-transform cursor-pointer border"
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
    </>
  );
};
export default Articles;
