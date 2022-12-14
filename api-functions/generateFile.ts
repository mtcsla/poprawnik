import axios from "axios";

export const generateFile = async (
  htmlString: string,
  convertTo: "pdf" | "docx"
) => {
  let file: Buffer | null = null;

  await axios
    .get(`${process.env.HTML_CONVERT_URL}/${convertTo}`, {
      params: {
        secret: process.env.HTML_CONVERT_SECRET,
        payload: htmlString,
      },
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    })
    .then((res) => res.data)
    .then((data) => {
      console.log(data);
      file = Buffer.from(data, "binary");
    })
    .catch((err) => {
      console.error(`Error generating ${convertTo} file:\n`, err);
      throw err;
    });

  return file;
};
