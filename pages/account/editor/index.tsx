import {
  addDoc,
  collection,
  deleteDoc, doc, getDocs, query, setDoc, updateDoc, where
} from "@firebase/firestore";
import { Add, Bookmark, Delete, Edit, Visibility, VisibilityOff } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Dialog, DialogActions, IconButton, Skeleton } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { firestore } from "../../../buildtime-deps/firebase";
import { useAuth } from "../../../providers/AuthProvider";
import { SidenavContent } from "../../../providers/SidenavProvider";

export interface ArticleContents {
  id?: string;
  authorPictureURL?: string;
  coverURL: string;
  authorName: string;
  date: string;
  visible: boolean;
  title: string;
  subtitle: string;
  contents: {
    type: "markdown" | "alert" | "image";
    value:
    | string
    | { title: string; text: string }
    | { url: string; caption: string };
  }[];
}


export const getStaticProps = async () => {
  return { props: {} }
};

const YourArticles = () => {
  const [articleDrafts, setArticleDrafts] = React.useState<ArticleContents[] | null>(null);
  const [articles, setArticles] = React.useState<ArticleContents[] | null>(null);


  const [confirmDelete, setConfirmDelete] = React.useState<ArticleContents | null>(null);
  const [confirmVisibility, setConfirmVisibility] = React.useState<ArticleContents | null>(null)
  const [deleting, setDeleting] = React.useState<boolean>(false);
  const [adding, setAdding] = React.useState<boolean>(false);
  const [makingPublic, setMakingPublic] = React.useState<boolean>(false);

  const router = useRouter();

  const { user, userProfile } = useAuth();


  const toggleVisibility = async (article: ArticleContents) => {
    setMakingPublic(true);
    await updateDoc(doc(firestore, `article-drafts/${article.id}`), {
      visible: !article.visible,
    });
    (articleDrafts as ArticleContents[])[(articleDrafts as ArticleContents[]).indexOf(article as ArticleContents)].visible = !articleDrafts?.[articleDrafts?.indexOf(article)].visible;
    setArticleDrafts([...articleDrafts as ArticleContents[]]);

    setTimeout(() => {
      setMakingPublic(false);
      setConfirmVisibility(null);
    }, 1000)
  }

  const addArticleDraft = async (article?: ArticleContents) => {
    setAdding(true);
    const data = article ?? {
      title: "",
      subtitle: "",
      authorPictureURL: user?.photoURL,
      coverURL: "",
      visible: false,
      date: (new Date()).toLocaleDateString('pl-PL'),
      author: user?.uid || "",
      authorName: user?.displayName || "",
      contents: []
    } as ArticleContents;

    const reference =
      article
        ? await setDoc(doc(collection(firestore, "article-drafts"), article.id), data)
        : await addDoc(collection(firestore, "article-drafts"), data);

    if (!article)
      setTimeout(() => {
        router.push(`/account/editor/edit?id=${reference!.id}&type=article`)
      },
        1000)
    else {
      setArticleDrafts(
        [...articleDrafts!, article]
      )
    }
    setAdding(false);
  };

  const removeArticleDraft = async (id: string) => {
    setDeleting(true);
    await deleteDoc(doc(firestore, `article-drafts/${id}`))
    setArticleDrafts(articleDrafts?.filter((article) => article.id !== id) as ArticleContents[]);
    setDeleting(false);
    setConfirmDelete(null);
  }

  const addArticle = async (article: ArticleContents) => {
    setAdding(true);
    const data = { ...article };
    delete data.id;

    await setDoc(doc(collection(firestore, "articles"), article.id), data);

    setAdding(false);
    articles?.push(article);
  }
  const removeArticle = async (id: string) => {
    setDeleting(true);
    await deleteDoc(doc(firestore, `articles/${id}`))

    setArticles(articles?.filter((article) => article.id !== id) as ArticleContents[]);
    setDeleting(false);
    setConfirmDelete(null);
  }

  const unpublishArticle = async (article: ArticleContents) => {
    await removeArticle(article.id as string);
    await addArticleDraft(article);
  }
  const publishArticle = async (article: ArticleContents) => {
    await removeArticleDraft(article.id as string);
    await addArticle(article);
  }


  React.useEffect(() => {
    if (userProfile) {
      getDocs(query(collection(firestore, `article-drafts`),
        where("author", "==", userProfile?.uid as string))).then((snapshot) => {
          const articlesData: ArticleContents[] = [];

          snapshot.forEach((article) => {
            const data = article.data();

            articlesData.push({
              id: article.id,
              ...data,
            } as ArticleContents);
          });

          setArticleDrafts(articlesData);
        })
      getDocs(query(collection(firestore, `articles`),
        where("author", "==", userProfile?.uid as string))).then((snapshot) => {
          const articlesData: ArticleContents[] = [];

          snapshot.forEach((article) => {
            const data = article.data();

            articlesData.push({
              id: article.id,
              ...data,
            } as ArticleContents);
          });

          setArticles(articlesData);
        })
    }
  }, [userProfile])

  return (<>
    <article className="w-full flex flex-col items-stretch">
      <h1><Edit className="-translate-y-0.5 mr-2" color='primary' />Projekty artykułów</h1>
      <p className="mb-3">Tutaj możesz tworzyć i edytować swoje artykuły.</p>

      {articleDrafts && userProfile ? <>
        {!articleDrafts.length ? (
          <div
            className={
              "p-12 flex items-center justify-center rounded-lg bg-slate-100  mt-4"
            }
          >
            <div className={"flex flex-col"}>
              <pre>brak artykułów</pre>
              <p className={"mt-1"}>Nie masz żadnych projektów artykułów.</p>
              <img src='/empty-street.svg' className='max-w-[30rem] mt-4' />
            </div>
          </div>
        ) : (
          articleDrafts.map((article, index) => (
            <>
              <div
                className={"p-4 flex flex-col rounded-lg w-full justify-between bg-slate-50 mt-8 "}
              >
                <div className={'flex justify-between w-full flex-wrap'}>
                  <div className="flex flex-col w-full">
                    <h4 className={'font-bold truncate'}>
                      {article.title || 'BRAK TYTUŁU'}
                    </h4>

                    <div className="w-full inline-flex justify-between items-center">
                      <p className="truncate">
                        {article.subtitle || 'Brak podtytułu.'}
                      </p>

                      <div className={"mt-1 flex items-center justify-end "}>
                        <Link passHref href={`/account/editor/edit?id=${article.id}&type=article`}>
                          <a >
                            <IconButton
                              size={'small'}
                              disabled={makingPublic}
                              sx={{ border: 'none' }}
                            >
                              <Edit />
                            </IconButton>
                          </a>
                        </Link>
                        <IconButton onClick={() => setConfirmVisibility(article)}
                          className={"text-sm text-blue-500 cursor-pointer " + (makingPublic ? 'text-slate-400 cursor-default' : '')}>
                          <VisibilityOff />
                        </IconButton>
                        <div />
                        <IconButton
                          className={"text-sm cursor-pointer text-red-500 " + (makingPublic ? 'text-slate-400 cursor-default' : '')}
                          onClick={makingPublic ? () => {
                          } : () => setConfirmDelete(article)}
                        >
                          <Delete />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ))
        )}
        <LoadingButton loading={adding} className={`w-full mt-6 p-4 ${adding || deleting ? 'bg-gray-300 text-transparent' : 'bg-blue-500 text-white'} mb-8`} onClick={() => addArticleDraft()}>
          <Add className="mr-2 " />
          Nowy artykuł
        </LoadingButton> </>
        : <>
          <Skeleton variant='rectangular' className='mt-6 rounded' height={110} />
          <span className='flex items-center w-full mt-1'>
            <Skeleton className='mb-4 flex-1 mr-4' /> <Skeleton className='mb-4' style={{ flex: 0.2 }} />
          </span>
          <Skeleton variant='rectangular' className='rounded' height={110} />
          <span className='flex items-center w-full mt-1'>
            <Skeleton className='mb-4 flex-1 mr-4' /> <Skeleton className='mb-4' style={{ flex: 0.2 }} />
          </span>
          <Skeleton variant='rectangular' className='rounded' height={110} />
          <span className='flex items-center w-full mt-1'>
            <Skeleton className='mb-4 flex-1 mr-4' /> <Skeleton className='mb-4' style={{ flex: 0.2 }} />
          </span>
        </>}

      <h1><Bookmark className="-translate-y-0.5 mr-2" color='primary' />Opublikowane artykuły</h1>
      <p className="mb-3">Wyłącz publikację, aby edytować.</p>
      {!articles || !articles.length ? <div
        className={
          "p-12 mb-6 flex items-center justify-center rounded-lg bg-slate-100  mt-4"
        }
      >
        <div className={"flex flex-col"}>
          <pre>brak artykułów</pre>
          <p className={"mt-1"}>Nie masz żadnych opublikowanych artykułów.</p>
          <img src='/no-published.svg' className='self-center max-w-[15rem] mt-4' />
        </div>
      </div>
        : articles.map((article, index) => (
          <>
            <div
              className={"p-4 flex flex-col rounded-lg w-full justify-between bg-slate-50 mt-8 "}
            >
              <div className={'flex justify-between w-full flex-wrap'}>
                <div className="flex flex-col w-full">
                  <h4 className={'font-bold truncate'}>
                    {article.title}
                  </h4>

                  <div className="w-full inline-flex justify-between items-center">
                    <p className="truncate">
                      {article.subtitle}
                    </p>

                    <div className={"mt-1 flex items-center justify-end "}>
                      <IconButton disabled={adding || deleting} onClick={() => unpublishArticle(article)}
                        className={"text-sm text-blue-500 cursor-pointer " + (adding || deleting ? 'text-slate-400 cursor-default' : '')}>
                        <Visibility /></IconButton>
                      <div />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ))}
      <div className="mb-8" />
      <SidenavContent>
        <pre>WSKAZÓWKI I WYTYCZNE</pre>
        <ul className={"mt-3"}>
          <li className={""}>
            <Link href={"/"} passHref>
              <a>Interfejs tworzenia artykułów</a>
            </Link>
          </li>
          <li className={"mt-2"}>
            <Link href={"/"} passHref>
              <a>Wytyczne formatowania tekstu</a>
            </Link>
          </li>
        </ul>
      </SidenavContent>

      <Dialog scroll="body" open={!!confirmVisibility}>
        <div className={"p-5"}>
          <pre className={"mb-4"}>{confirmVisibility?.title || "Brak tytułu"}</pre>
          <p className={"text-sm"}>Czy na pewno chcesz opublikować ten artykuł?</p>
        </div>
        <DialogActions>
          <LoadingButton
            disabled={adding || deleting}
            onClick={() => setConfirmVisibility(null)}
            variant={"text"}
            sx={{ border: "none" }}
          >
            Anuluj
          </LoadingButton>
          <LoadingButton
            loading={adding || deleting}
            onClick={async () => {
              await publishArticle(articleDrafts?.find((x) => x.id === confirmVisibility?.id)!)
              setConfirmVisibility(null);
            }}
            variant={"text"}
            sx={{ border: "none" }}
          >
            Opublikuj
          </LoadingButton>
        </DialogActions>
      </Dialog> <Dialog scroll="body" open={!!confirmDelete}>
        <div className={"p-5"}>
          <pre className={"mb-4"}>{confirmDelete?.title || "Brak tytułu"}</pre>
          <p className={"text-sm"}>Czy na pewno chcesz usunąć ten artykuł?</p>
        </div>
        <DialogActions>
          <LoadingButton
            disabled={deleting}
            onClick={() => setConfirmDelete(null)}
            variant={"text"}
            sx={{ border: "none" }}
          >
            Anuluj
          </LoadingButton>
          <LoadingButton
            loading={deleting}
            onClick={() => {
              setDeleting(true);
              removeArticleDraft(confirmDelete?.id as string)
            }}
            variant={"text"}
            sx={{ border: "none" }}
          >
            Usuń
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </article>
  </>
  );
};

export default YourArticles;

