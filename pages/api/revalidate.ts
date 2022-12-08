import { NextApiRequest, NextApiResponse } from "next";

const SECRET =
  "-xxhMHYY*`}J/~`tTVVT_hMj8|B>zTAE?rVW++`;PoRKt!Ib8UFmNM#EpY.7.`Q";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.query.secret !== SECRET) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  if (!req.query.path) {
    return res.status(400).json({
      message: "Missing path",
    });
  }

  try {
    await res.revalidate(req.query.path as string);
  } catch (e) {
    return res.status(500).json({
      message: "Failed to revalidate",
    });
  }
  return res.status(200).json({
    time: new Date().toISOString(),
    message: `revalidated ${req.query.path}`,
  });
};
