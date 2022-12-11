import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { firebaseAdmin } from "../../../buildtime-deps/firebaseAdmin";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

const stripe = new Stripe(process.env.STRIPE_TEST_KEY_SECRET as string, {
  apiVersion: "2022-08-01",
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.cookies["--user-token"]) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (!("id" in req.body) && !("data" in req.body)) {
    res.status(400).json({ message: "Bad request" });
    return;
  }

  try {
    let token: DecodedIdToken | null = null;

    try {
      token = await firebaseAdmin
        .auth()
        .verifyIdToken(req.cookies["--user-token"]);
    } catch {
      throw new Error(
        JSON.stringify({ message: "Invalid user token", code: 400 })
      );
    }
    const user = await firebaseAdmin.auth().getUser(token.uid);

    let formDoc: firebaseAdmin.firestore.DocumentSnapshot | null = null;
    try {
      formDoc = await firebaseAdmin
        .firestore()
        .collection("forms")
        .doc(req.body.id)
        .get();
    } catch {
      throw new Error(
        JSON.stringify({ message: "Failed to get form", code: 500 })
      );
    }
    let productDoc: firebaseAdmin.firestore.DocumentSnapshot | null = null;
    try {
      productDoc = await firebaseAdmin
        .firestore()
        .collection("products")
        .doc(req.body.id)
        .get();
    } catch {
      throw new Error(
        JSON.stringify({ message: "Failed to get product", code: 500 })
      );
    }

    let dataDoc: firebaseAdmin.firestore.WriteResult | null = null;
    delete req.body?.data?.["§valuesValid"];
    try {
      dataDoc = await firebaseAdmin
        .firestore()
        .collection("user-data")
        .doc(user.uid)
        .collection("data")
        .doc(req.body.id)
        .set(req.body.data);
    } catch {
      throw new Error(
        JSON.stringify({ message: "Failed to save data", code: 500 })
      );
    }

    let paymentIntent: Stripe.PaymentIntent | null = null;

    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: productDoc.data()?.price,
        currency: "pln",
        automatic_payment_methods: {
          enabled: true,
        },

        metadata: {
          formId: req.body.id,
          userId: user.uid,
        },
      });
    } catch (err) {
      console.log(err);
      throw new Error(
        JSON.stringify({
          message: "Failed to create payment intent",
          code: 500,
        })
      );
    }

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    return res.status(500).json({
      message: JSON.parse(error.message).message,
      code: JSON.parse(error.message).code,
    });
  }
};
