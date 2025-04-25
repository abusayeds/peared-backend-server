
import { Request, Response } from "express";
import httpStatus from "http-status";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "../../../config";
import AppError from "../../../errors/AppError";
import { tokenDecoded } from "../../../middlewares/decoded";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { UserModel } from "../user/user.model";
import { webhookService } from "./payment.service";
export const stripe = require("stripe")(STRIPE_SECRET_KEY);
const createCheckoutSession = async (customerEmail: string, amount: number, projectData?: any) => {

  if (!customerEmail) {
    throw new AppError(httpStatus.BAD_REQUEST, "customerEmail is requred !")
  }
  if (!amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "amount is requred !")
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: amount * 100,
        product_data: { name: "Project Payment" },
      },
      quantity: 1,
    }],
    customer_email: customerEmail,
    success_url: `https://peared-client.vercel.app/paymentSuccess`,
    cancel_url: `https://peared-client.vercel.app/payment-cancel`,
    metadata: {
      customerEmail,
      amount: amount,
      projectData: JSON.stringify(projectData) || null
    },
  });
  return { url: session.url, sessionId: session.id };
};

const webhookController = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    const webhookSecret = STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Webhook Secret Key Missing!");
    }
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    await webhookService.processWebhookEvent(event);

  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  res.json({ received: true });
};


const addBalance = catchAsync(
  async (req: Request, res: Response) => {
    const { amount } = req.body
    if (!amount || amount <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "amount is required ");
    }
    const { decoded, }: any = await tokenDecoded(req, res)
    const email = decoded.user.email;
    const user = await UserModel.findOne({ email: email })
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User Not Found ! ");
    }
    const { url } = await createCheckoutSession(email, amount, user)
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: " Please add your balance ",
      data: url
    });

  })
const myWallat = catchAsync(async (req, res) => {
  const { decoded }: any = await tokenDecoded(req, res)
  const email = decoded.user.email;
  const result = await webhookService.myWallatDB(email)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ' recived my wallat',
    data: result
  });

});
const paymentHistory = catchAsync(async (req, res) => {
  const { decoded }: any = await tokenDecoded(req, res)
  console.log(decoded);

  const email = decoded.user.email;
  const role = decoded.user.role


  const paymentHistory = await webhookService.paymentHistoryDB(email, req.query, role)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ' recived my payment history',
    data: paymentHistory
  });

});







const providerWithdraw = catchAsync(async (req, res) => {
  const { decoded }: any = await tokenDecoded(req, res)
  const email = decoded.user.email;
  if (
    req.body.amount === undefined ||
    req.body.amount <= 0 ||
    !Number.isInteger(req.body.amount)
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Amount is required, must be greater than 0, and should be an integer.');
  }
  const data = await webhookService.providerWithdrawDB(req.body, email)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ' writhdraw request sent ! ',
    data: data
  });
})



export const paymentController = {
  createCheckoutSession,
  webhookController,
  addBalance,
  myWallat,
  paymentHistory,
  providerWithdraw
}