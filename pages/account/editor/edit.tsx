import { doc, getDoc, updateDoc } from '@firebase/firestore';
import { deleteObject, ref } from "@firebase/storage";
import { EditRounded, ImageRounded, ModeEdit } from "@mui/icons-material";
import { Button, Chip, Menu, MenuItem, Skeleton, TextField } from "@mui/material";
import debounce from "debounce";
import Link from "next/link";
import { useRouter } from 'next/router';
import React, { Reducer, useEffect, useReducer } from "react";
import RichMarkdownEditor from "rich-markdown-editor";
import { firestore, storage } from "../../../buildtime-deps/firebase";
import ArticleImage from "../../../components/edit-article/ImageUpload";
import { useAuth } from "../../../providers/AuthProvider";
import { SidenavContent } from "../../../providers/SidenavProvider";

const updateFirestore = async (article: IArticleContents) => {

  await updateDoc(doc(firestore, `/articles/${article.id}`), {
    ...article,
  });
};

const debouncedUpdate =
  debounce(updateFirestore, 500, false);


const Edit = () => {
  const [article, modify] = useReducer<
    Reducer<IArticleContents | null, [ArticleEditAction, any]>,
    IArticleContents | null
  >(reducer, null, () => null);

  const [addingNew, setAddingNew] = React.useState(false);
  const menuAnchor = React.useRef<HTMLButtonElement>(null)

  const { user, userProfile } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (article)
      debouncedUpdate(article);
  }, [article]);
  useEffect(() => {
    if (!article && router.isReady && userProfile) {
      getDoc(doc(firestore, `/articles/${router.query.id}`)).then((snapshot) => {
        if (!snapshot.data()) {
          router.push('/account/editor')
          return
        }
        modify(['set', { ...snapshot.data(), id: snapshot.id } as IArticleContents]);
      });
    }
  }, [userProfile, router.isReady])

  return (
    <>
      <article className='flex flex-col w-full'>
        <h1><ModeEdit className='-translate-y-0.5 mr-2' color='primary' />Edytujesz artykuł</h1>
        <p className='mb-2'>Edycja zapisuje się automatycznie.</p>
      </article>

      {article && user ? <>
        <TextField
          className={"w-full mt-4"}
          label={"tytuł"}
          size={"small"}
          value={article.title}
          onChange={(title) => modify(["set-title", title.target.value])}
        />
        <TextField
          className={"w-full mt-4"}
          label={"podtytuł"}
          size={"small"}
          value={article.subtitle}
          onChange={(title) => modify(["set-subtitle", title.target.value])}
        />
        <div className={"mt-10 mb-8 border-b w-full"} />
        <article className={"flex flex-col"}>
          <h1>{article.title}</h1>
          <h4>{article.subtitle}</h4>
          <ArticleImage
            url={article.coverURL}
            articleId={article.id || ""}
            noCaption
            onChange={({ url }) => modify(["set-cover-url", url])}
          />

          {article.contents.map((item, index) => (
            <div className={"w-full mb-6 flex flex-col"}>
              <span className={"flex justify-between"}>
                <Chip label={index + 1} size={"small"} />
                <Button
                  sx={{ border: "none", marginRight: "-1rem" }}
                  size={"small"}
                  color={"error"}
                  onClick={() => modify([`delete-fragment-${index}`, null])}
                >
                  USUŃ FRAGMENT
                </Button>
              </span>
              {item.type === "markdown" ? (
                <RichMarkdownEditor
                  onChange={(markdown) =>
                    modify([`set-fragment-value-${index}`, markdown()])
                  }
                  defaultValue={article.contents[index].value as string}
                  style={{ width: "100%" }}
                  disableExtensions={["table"]}
                />
              ) : item.type === "image" ? (
                <ArticleImage
                  url={(item.value as { url: string; caption: string }).url}
                  caption={
                    (item.value as { url: string; caption: string }).caption
                  }
                  articleId={article.id || ""}
                  shapeless
                  onChange={({ url, caption }) =>
                    modify([
                      `set-fragment-value-${index}`,
                      { url, caption },
                    ])
                  }
                />
              ) : null}
            </div>
          ))}
        </article>

        <Button
          onClick={() => setAddingNew(true)}
          className={"w-full mb-4"}
          ref={menuAnchor}
        >
          DODAJ FRAGMENT
        </Button>
        <Menu
          open={addingNew}
          className={"mt-2"}
          anchorEl={menuAnchor.current}
          onClose={() => setAddingNew(false)}
        >
          <MenuItem
            onClick={() =>
              modify(["append-fragment", { type: "markdown", value: "" }])
            }
          >
            <EditRounded color={"primary"} className={"mr-2"} /> <p>Paragraf</p>
          </MenuItem>
          <MenuItem
            onClick={() =>
              modify([
                "append-fragment",
                { type: "image", value: { url: "", subtitle: "" } },
              ])
            }
          >
            <ImageRounded color={"primary"} className={"mr-2"} /> <p>Obraz</p>
          </MenuItem>
        </Menu>

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
      </> : <>
        <Skeleton variant='rectangular' className='mt-6 rounded' height={110} />
        <span className='flex items-center w-full mt-1'>
          <Skeleton className='mb-4 flex-1 mr-4' /> <Skeleton className='mb-4' style={{ flex: 0.2 }} />
        </span>
      </>}</>
  );
};
export default Edit;

function reducer(
  state: IArticleContents | null,
  action: [ArticleEditAction, any]
): IArticleContents {
  if (state == null)
    return action[1];
  if (action[0].includes("set-fragment-value")) {
    const index: number = parseInt(action[0].split("-")[3]);

    return {
      ...state,
      contents: state.contents.map((item, i) =>
        i === index ? { ...item, value: action[1] } : item
      ),
    };
  }

  if (action[0].includes("delete-fragment")) {
    const index: number = parseInt(action[0].split("-")[2]);

    if (
      state.contents[index].type === "image" &&
      (state.contents[index].value as { url: string; caption: string }).url
    ) {
      deleteObject(
        ref(
          storage,
          (state.contents[index].value as { url: string; caption: string }).url
        )
      );
    }

    return {
      ...state,
      contents: state.contents.filter(
        (value, filterIndex) => filterIndex !== index
      ),
    };
  }

  switch (action[0]) {
    case "set-title":
      return {
        ...state,
        title: action[1],
      };
    case "set-subtitle":
      return {
        ...state,
        subtitle: action[1],
      };
    default:
      return state;
    case "set-cover-url":
      return {
        ...state,
        coverURL: action[1],
      };
    case "append-fragment":
      return {
        ...state,
        contents: [...state.contents, action[1]],
      };
  }
}

type ArticleEditAction =
  "set"
  | "set-title"
  | "set-subtitle"
  | "set-cover-url"
  | "append-fragment"
  | `set-fragment-value-${number}`
  | `delete-fragment-${number}`
  | `insert-fragment-${number}`;

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

