import {
  addDoc,
  collection,
  deleteDoc,
  doc, getDocs, query, updateDoc, where
} from "@firebase/firestore";
import { Edit } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, Skeleton } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { firestore } from "../../../buildtime-deps/firebase";
import { useAuth } from "../../../providers/AuthProvider";
import { SidenavContent } from "../../../providers/SidenavProvider";

export interface IArticleContents {
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
  const [articles, setArticles] = React.useState<IArticleContents[] | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<IArticleContents | null>(null);
  const [confirmVisibility, setConfirmVisibility] = React.useState<IArticleContents | null>(null)
  const [deleting, setDeleting] = React.useState<boolean>(false);
  const [adding, setAdding] = React.useState<boolean>(false);
  const [makingPublic, setMakingPublic] = React.useState<boolean>(false);

  const router = useRouter();

  const { user, userProfile } = useAuth();

  const toggleVisibility = async (article: IArticleContents) => {
    setMakingPublic(true);
    await updateDoc(doc(firestore, `articles/${article.id}`), {
      visible: !article.visible,
    });
    (articles as IArticleContents[])[(articles as IArticleContents[]).indexOf(article as IArticleContents)].visible = !articles?.[articles?.indexOf(article)].visible;
    setArticles([...articles as IArticleContents[]]);

    setTimeout(() => {
      setMakingPublic(false);
      setConfirmVisibility(null);
    }, 1000)
  }

  const addNewArticle = async () => {
    setAdding(true);
    const data = {
      title: "",
      subtitle: "",
      authorPictureURL: user?.photoURL,
      coverURL: "",
      visible: false,
      date: (new Date()).toLocaleDateString('pl-PL'),
      author: user?.uid || "",
      authorName: user?.displayName || "",
      contents: []
    } as IArticleContents;
    addDoc(collection(firestore, "articles"), data).then((reference) => {
      setTimeout(() => {
        router.push(`/account/editor/edit?id=${reference.id}&type=article`)
      },
        1000)
    }
    );
  };

  const deleteArticle = (id: string) =>
    deleteDoc(doc(firestore, `articles/${id}`)).then(() => {
      setTimeout(() => {
        setArticles(articles?.filter((article) => article.id !== id) as IArticleContents[]);
        setDeleting(false);
        setConfirmDelete(null);
      }, 1000);
    }
    );


  React.useEffect(() => {
    if (userProfile) {
      getDocs(query(collection(firestore, `articles`),
        where("author", "==", userProfile?.uid as string))).then((snapshot) => {
          const articlesData: IArticleContents[] = [];

          snapshot.forEach((article) => {
            const data = article.data();

            articlesData.push({
              id: article.id,
              ...data,
            } as IArticleContents);
          });

          setArticles(articlesData);
        })
    }
  }, [userProfile])

  return (<>
    <article className="w-full flex flex-col items-stretch">
      <h1><Edit className="-translate-y-0.5" color='primary' /> Twoje artykuły</h1>
      <p className="mb-3">Tutaj możesz tworzyć i edytować swoje artykuły.</p>

      {articles && userProfile ? <>
        {!articles.length ? (
          <div
            className={
              "p-4 flex items-center justify-center rounded-lg border h-32 mt-2"
            }
          >
            <div className={"flex flex-col"}>
              <pre>BRAK ARTYKUŁÓW</pre>
              <p className={"mt-1"}>Napisz swój pierwszy artykuł.</p>
            </div>
          </div>
        ) : (
          articles.map((article, index) => (
            <>
              <div
                className={"p-4 flex flex-col rounded-lg justify-between border h-32 mt-2 "}
              >
                <div className={'flex justify-between'}>
                  <h4 className={'text-ellipsis'}>
                    {article.title || <i>BRAK TYTUŁU</i>}
                  </h4>
                  <div style={{ minWidth: 50 }} />

                  <Link passHref href={`/account/editor/edit?id=${article.id}&type=article`}>
                    <a>
                      <Button
                        size={'small'}
                        disabled={makingPublic}
                        className='p-0'
                        sx={{ border: 'none' }}
                      >

                        Edytuj
                      </Button>
                    </a>
                  </Link>
                </div>
                <div className={"mt-1 flex items-start justify-between "}>
                  <p onClick={() => setConfirmVisibility(article)}
                    className={"text-sm text-blue-500 cursor-pointer " + (makingPublic ? 'text-slate-400 cursor-default' : '')}>
                    {article.visible ? "Ukryj" : "Opublikuj"}</p>
                  <div style={{ minWidth: 50 }} />
                  <p
                    className={"text-sm cursor-pointer text-red-500 " + (makingPublic ? 'text-slate-400 cursor-default' : '')}
                    onClick={makingPublic ? () => {
                    } : () => setConfirmDelete(article)}
                  >
                    Usuń
                  </p>
                </div>
              </div>
            </>
          ))
        )}
        <LoadingButton loading={adding} className={"w-full mt-6 mb-8"} onClick={addNewArticle}>
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

      <Dialog open={!!confirmVisibility}>
        <div className={"p-5"}>
          <pre className={"mb-4"}>{confirmVisibility?.title || "Brak tytułu"}</pre>
          <p className={"text-sm"}>Czy na pewno chcesz {confirmVisibility?.visible ? 'ukryć' : 'uwidocznić'} ten artykuł?</p>
        </div>
        <DialogActions>
          <LoadingButton
            disabled={makingPublic}
            onClick={() => setConfirmVisibility(null)}
            variant={"text"}
            sx={{ border: "none" }}
          >
            Anuluj
          </LoadingButton>
          <LoadingButton
            loading={makingPublic}
            onClick={async () => {
              await toggleVisibility(confirmVisibility as IArticleContents);
            }}
            variant={"text"}
            sx={{ border: "none" }}
          >
            {confirmVisibility?.visible ? 'Ukryj' : 'Opublikuj'}
          </LoadingButton>
        </DialogActions>
      </Dialog> <Dialog open={!!confirmDelete}>
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
              deleteArticle(confirmDelete?.id as string)
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

