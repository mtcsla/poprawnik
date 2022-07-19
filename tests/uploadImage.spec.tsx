import { fireEvent, render, waitFor } from '@testing-library/react';
import ArticleImage from '../components/edit-article/ImageUpload';



const throwError = jest.fn((err: any) => { })
const progressCallback = jest.fn()
const uploadBytesResumable = jest.fn((ref: any, arrayBuffer: any) => ({
  on: jest.fn(
    (
      event: 'state_changed',
      callback: (snapshot: { bytesTransferred: number; totalBytes: number }) => any,
      err: (err: any) => any,
      complete: () => any
    ): void => {
      for (
        let i = 1;
        i <= 100;
        i++
      ) {
        progressCallback();
        callback({
          bytesTransferred: i,
          totalBytes: 100,
        });
      }
      if (arrayBuffer.throwError) {
        err(new Error('Error uploading file'));
        throwError("bruh")
      }
      complete();
    }
  )
}));


jest.mock('../buildtime-deps/firebase', () => ({
  auth: {},
  firestore: {},
  storage: {},
}))
jest.mock('@firebase/storage', () => ({
  uploadBytesResumable: (ref: any, path: any) => uploadBytesResumable(ref, path),
  getDownloadURL: async (ref: any) => { return "image-url"; },
  ref: (storage: any, path: string) => { }
}))

describe("Image upload component", () => {
  let file: File;
  let fileUrl: string;

  beforeEach(() => {
    file = new File(['(⌐□_□)'], 'chucknorris.png', { type: "image/png" });
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(0));
  })

  describe("When not uploading", () => {
    it("should render an upload button when url is falsy", () => {
      const { getByText } = render(<ArticleImage url='' articleId='' onChange={() => { }} />);
      expect(getByText("dodaj obraz")).toBeTruthy();
    })
    it("should render a change button when url is truthy", () => {
      const { getByText } = render(<ArticleImage url='image-url' articleId='' onChange={() => { }} />);
      expect(getByText("zmień obraz")).toBeTruthy();
    })
  }
  )
  describe("Handling uploads", () => {

    it("should upload file", async () => {
      const { getByTestId } = render(<ArticleImage url='' articleId='' onChange={({ url }) => { fileUrl = url }} />);
      const fileInput = getByTestId('file-input');
      await waitFor(() => fireEvent.change(fileInput, { target: { files: [file] } }));
      expect(uploadBytesResumable).toBeCalledTimes(1);
    });

    it("should update file url after upload", () => {
      expect(fileUrl).toBeDefined();
      expect(fileUrl).toBe("image-url");
    })

    it("should update progress", () => {
      expect(progressCallback).toBeCalledTimes(100);
    })

    it("should render a cancel button while uploading", async () => {
      const { getByText, getByTestId } = render(<ArticleImage url='' articleId='' onChange={() => { }} />);
      const fileInput = getByTestId('file-input');

      await waitFor(() => fireEvent.change(fileInput, { target: { files: [file] } }));

      expect(getByText("anuluj")).toBeTruthy();
    })
  });

  describe("Error handling", () => {

    let getByTestId: any;

    beforeEach(() => {
      getByTestId = render(<ArticleImage url='' articleId='' onChange={() => { }} />).getByTestId;
    })

    it("should handle error", async () => {
      //@ts-ignore
      file.arrayBuffer = () => ({ throwError: true })
      const fileInput = getByTestId('file-input');

      await waitFor(() => fireEvent.change(fileInput, { target: { files: [file] } }));
      expect(throwError).toBeCalledTimes(1);
    })
  });

})