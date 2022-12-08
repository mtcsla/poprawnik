import { NextApiRequest, NextApiResponse } from "next";
import { firebaseAdmin } from "../../buildtime-deps/firebaseAdmin";
import { getStaticPaths as getFormPaths } from "../forms/list/[category]/[page]";
import { getStaticPaths as getArticlePaths } from "../articles/list/[category]/[page]";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.query.secret || req.query.secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: "Invalid token" });
  }
  const docs = (
    await firebaseAdmin.firestore().collection("revalidate").get()
  ).docs.map((doc) => doc.data());

  const formCategories = docs
    .filter((doc) => doc.type === "forms")
    .map((doc) => doc.category as string);
  const articleCategories = docs
    .filter((doc) => doc.type === "articles")
    .map((doc) => doc.category as string);

  let paths: string[] = [];
  try {
    const formPaths = (await getFormPaths()).paths.filter((path) => {
      let included = false;
      formCategories.forEach((category) => {
        if (path.includes(`${category}`)) included = true;
      });
      return included;
    });
    const articlePaths = (await getArticlePaths()).paths.filter((path) => {
      let included = false;
      articleCategories.forEach((category) => {
        if (path.includes(`${category}`)) included = true;
      });
      return included;
    });
    paths = [...formPaths, ...articlePaths];
  } catch (e) {
    console.error(`[${new Date().toISOString()}]Error getting static paths:`);
    console.error(e);
    return res.status(500).json({ message: "Error getting static paths" });
  }

  try {
    console.info(`[${new Date().toISOString()}] Revalidating /...`);
    await res.revalidate("/");
    console.info(`[${new Date().toISOString()}] Succesfully revalidated /`);
  } catch (e) {
    console.error(`[${new Date().toISOString()}]Error revalidating /:`);
    console.error(e);
    return res.status(500).json({ message: "Error revalidating /" });
  }

  try {
    await Promise.all(
      paths.map(async (path) => {
        console.info(`[${new Date().toISOString()}] Revalidating ${path}...`);
        await res.revalidate(path);
        console.info(
          `[${new Date().toISOString()}] Succesfully revalidated ${path}`
        );
      })
    );
  } catch (e) {
    console.error(
      `[${new Date().toISOString()}]Error revalidating list paths:`
    );
    console.error(e);
    return res.status(500).json({ message: "Error revalidating list paths" });
  }
  try {
    await Promise.all(
      docs.map(async (doc) => {
        console.info(
          `[${new Date().toISOString()}] Revalidating /${doc.type}/${doc.id}...`
        );
        await res.revalidate(`/${doc.type}/${doc.id}`);
        console.info(
          `[${new Date().toISOString()}] Succesfully revalidated /${doc.type}/${
            doc.id
          }`
        );
      })
    );
  } catch (e) {
    console.error(
      `[${new Date().toISOString()}]Error revalidating detail paths:`
    );
    console.error(e);
    return res.status(500).json({ message: "Error revalidating detail paths" });
  }
  return res.status(200).json({ message: "Success", ok: true });
};
