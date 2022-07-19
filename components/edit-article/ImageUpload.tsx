import styled from "@emotion/styled";
import { deleteObject, getDownloadURL, ref, StorageError, StorageReference, uploadBytesResumable, UploadTask } from "@firebase/storage";
import { ErrorRounded, ImageRounded } from "@mui/icons-material";
import { Alert, Button, LinearProgress, Snackbar, TextField } from '@mui/material';
import React, { useEffect } from "react";
import { storage } from "../../buildtime-deps/firebase";

const ImgIcon = styled(ImageRounded)`
  font-size: 40px !important;
`;

const SizedImage = styled.img`
  width: 55%; 
  @media (max-width: 900px)
  {width: 75%};
  @media (max-width: 600px) {
    width: 90%;
  }
  @media (max-width: 450px)  {
    width: 100%;
    background: transparent;
  }
  border-radius: 20px;
`;

const ArticleImage = ({
  url,
  caption,
  articleId,
  noCaption,
  onChange,
  shapeless
}: {
  url: string;
  articleId: string;
  noCaption?: boolean;
  caption?: string;
  shapeless?: boolean;
  onChange: ({ url, caption }: { url: string; caption: string }) => any;
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [imgUrl, setImgUrl] = React.useState<string>(url || "");
  const [imgCaption, setImgCaption] = React.useState<string>(caption || "");
  const [progress, setProgress] = React.useState<number>(0);
  const [task, setTask] = React.useState<UploadTask | null>(null);
  const [error, setError] = React.useState<string>("");

  const uploadCallbacks = {
    error: () => (snapshot: { bytesTransferred: number; totalBytes: number }) => {
      setProgress(snapshot.bytesTransferred / snapshot.totalBytes)
    },
    uploadErrorCallback: () => (error: StorageError) => {
      setTimeout(() => setError(""), 5000);
    },
    uploadFinishedCallback: (newFileRef: StorageReference) => async () => {
      await removeFile(imgUrl);

      setProgress(1);
      setTask(null);
      setImgUrl(await getDownloadURL(newFileRef));

      setTimeout(async () => {
        setProgress(0);
      }, 500);
    },
  }

  const uploadFile = async (newFile?: File) => {
    if (!newFile)
      return;

    const newFileRef = ref(
      storage,
      `articles/${articleId}/${encodeURI(newFile.name)}`
    );
    const newTask = uploadBytesResumable(
      newFileRef,
      await newFile.arrayBuffer()
    );

    setTask(newTask);
    setProgress(0.01);

    newTask.on(
      "state_changed",
      uploadCallbacks.error(),
      uploadCallbacks.uploadErrorCallback(),
      uploadCallbacks.uploadFinishedCallback(newFileRef)
    );
  };

  const removeFile = async (url?: string) => {
    if (!url) return;
    try {
      const fileToDelete = ref(storage, url);
      await deleteObject(fileToDelete);
    } catch (e) {

    }
  };

  useEffect(
    () => onChange({ url: imgUrl, caption: imgCaption }),
    [imgUrl, imgCaption]
  );

  return (

    <div className={'mb-4 flex-col items-center w-full'}>
      {/**Error toast*/}
      <Snackbar open={!!error} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert className='bg-red-500 text-white flex items-center flex-wrap' icon={<ErrorRounded className='text-white' />}>
          Wystąpił błąd.
          <Button
            data-testid="error-alert"
            className='ml-3 text-xs bg-white bg-opacity-20 border-0 text-white'
            onClick={() => alert("Treść błędu:\n\n" + error)}
          >
            Więcej
          </Button>
        </Alert>
      </Snackbar>


      {
        imgUrl
          ?
          shapeless
            ? <div className={'w-full bg-slate-50 mb-2 mt-2'}><SizedImage src={imgUrl} className={'mx-auto'} /></div>
            : <div
              className={
                "w-full flex items-center justify-center rounded-lg border mt-4 bg-slate-100 h-40"
              }
              style={{
                backgroundImage: `url(${imgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {imgUrl ? null : <ImgIcon />}
            </div>
          : null
      }

      {
        imgCaption
          ? <p className={'text-base w-full text-center italic mb-2'}>{imgCaption}</p>
          : null
      }

      <input
        data-testid="file-input"
        type={"file"}
        accept={"image/*"}
        onChange={async (file) => {
          await uploadFile(file.target?.files?.[0]);
        }}
        className={"hidden"}
        ref={fileInputRef}
      />

      {
        progress
          ? (
            <div className={"flex flex-col mt-3"}>
              <p className={"text-xs"}>Przesyłanie...</p>
              <LinearProgress variant="determinate" value={progress * 100} />
            </div>
          )
          : null
      }

      <div
        className={
          "cursor-pointer w-full justify-end flex mb-6 " +
          (progress && progress < 1
            ? "text-red-500"
            : progress == 1
              ? "opacity-0"
              : "text-blue-500")
        }

        onClick={() => {
          if (progress == 1) return;
          if (!progress) fileInputRef?.current?.click();
          if (progress) {
            task?.cancel();
            setProgress(0);
          }
        }}
      >
        {
          progress == 0
            ? imgUrl
              ? <span data-testid='change-button'>zmień obraz</span>
              : <span data-testid='upload-button'>dodaj obraz</span>
            : <span data-testid='cancel-button'>anuluj</span>
        }
      </div>

      {
        noCaption
          ? null
          : <TextField
            label={'podpis'}
            value={imgCaption}
            onChange={({ target }) => setImgCaption(target.value)}
            className={'w-full'}
            size={'small'} />
      }
    </div>
  );
};

export default ArticleImage;