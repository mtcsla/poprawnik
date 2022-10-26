import { NextApiRequest, NextApiResponse } from "next";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { firebaseAdmin } from "../../../buildtime-deps/firebaseAdmin";
import { IFormData } from "../../account/lawyer/index";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_TEST_KEY_SECRET as string, {
  apiVersion: "2022-08-01",
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.cookies["--user-token"]) {
    console.log("no token");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const decodedToken: DecodedIdToken = await firebaseAdmin
      .auth()
      .verifyIdToken(req.cookies["--user-token"]);

    if (!decodedToken.admin && !decodedToken.verifier) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!("id" in req.query) || !("price" in req.query)) {
      res.status(400).json({ error: "Bad Request" });
      return;
    }
    const id = req.query.id as string;

    const data: IFormData = (
      await firebaseAdmin.firestore().collection("forms").doc(id).get()
    ).data() as IFormData;

    if (!data) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    if (data.price == null) {
      res.status(400).json({ error: "Bad Request" });
      return;
    }

    const product = await stripe.products.create({
      name: data.title,
    });
    const price = await stripe.prices.create({
      product: product.id,
      currency: "pln",
      unit_amount: (parseFloat(req.query.price as string) ?? 100) * 100,
    });

    await firebaseAdmin.firestore().collection("forms").doc(id).update({
      published: true,
      awaitingVerification: false,
    });
    await firebaseAdmin
      .firestore()
      .doc(`/products/${id}`)
      .set({
        productId: product.id,
        priceId: price.id,

        formData: data.formData,
        title: data.title,
        description: data.description,

        price: parseFloat(req.query.price as string) * 100 ?? 100,

        author: data.author,
        authorName: data.authorName,
        authorPictureURL: data.authorPictureURL,

        verifiedBy: decodedToken.admin ? "admin" : decodedToken.uid,
      });

    res.status(200).send({ message: "OK" });
  } catch (err) {
    res.status(500).send({ message: "Unexpected server error." });
  }
};
