import { NextApiRequest, NextApiResponse } from "next";
import { firebaseAdmin } from "../../../buildtime-deps/firebaseAdmin";

export default async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const revalidateList = req.query["revalidateList"] as string;
  const secret = req.query["secret"];

  if (secret !== process.env.REVALIDATE_SECRET) {
    res.status(403).send("For application logic use only.");
    return;
  } else if (!["1", "0"].includes(revalidateList)) {
    res.status(400).send("Wrong revalidate instruction.");
    return;
  }

  const type = !!parseInt(revalidateList) ? "LIST" : "ARTICLE";

  if (type === "ARTICLE") {
    try {
      await res.unstable_revalidate("/articles/" + req.query["articleId"]);
      return res.json({ revalidated: true });
    } catch (err) {
      return res.status(500).send("Error revalidating");
    }
  } /*else {
    try {
      const article_count = (await firebaseAdmin.firestore().collection("articles").doc('visible-count').get()).data()?.count || 0;
      for (let i = 0; i < article_count; i++) { 
        await res.unstable_revalidate("/articles/" + i + 0);
      }
      
      await res.unstable_revalidate("/articles/" + req.query["articleId"]);
      return res.json({ revalidated: true });
    } catch (err) {
      return res.status(500).send("Error revalidating");
    }
  }*/
};
