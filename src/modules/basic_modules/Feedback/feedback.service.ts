import { IFeedback } from "./feedback.interface";
import { FeedbackModel } from "./feedback.model";

export const createFeedback = async (feedbackData: {
  heard: string;
  feedback: string;
  enjoy: "yes" | "no";

  name: string | undefined;
  email: string | undefined;
  rating: string;
}): Promise<IFeedback> => {
  const promoCode = await FeedbackModel.create(feedbackData);
  return promoCode.toObject() as IFeedback; // Convert to plain object
};

export const feedbackList = async (
  page: number = 1,
  limit: number = 10,
  date?: string,
  name?: string,
  email?: string,
): Promise<{
  feedbacks: IFeedback[];
  totalFeedbacks: number;
  totalPages: number;
}> => {
  const skip = (page - 1) * limit;
  const query: any = { isDeleted: { $ne: true } }; // Filter out promo codes where isDeleted is true
  if (name) {
    query.name = { $regex: name, $options: "i" };
  }
  if (email) {
    query.email = { $regex: email, $options: "i" };
  }

  if (date) {

    const [day, month, year] = date.split("-").map(Number);


    const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, -1));


    query.createdAt = { $gte: startDate, $lte: endDate };
  }

  const feedbacks = await FeedbackModel.aggregate<IFeedback>([
    { $match: query },
    {
      $setWindowFields: {
        sortBy: { createdAt: -1 },
        output: {
          serial: {
            $documentNumber: {},
          },
        },
      },
    },
    {
      $project: {
        serial: 1,
        rating: 1,
        email: 1,
        enjoy: 1,
        heard: 1,
        name: 1,
        feedback: 1,
        createdAt: 1,
      },
    },
    { $skip: skip },
    { $limit: limit },
  ]);


  const totalFeedbacks = await FeedbackModel.countDocuments(query);
  const totalPages = Math.ceil(totalFeedbacks / limit);

  return { feedbacks, totalFeedbacks, totalPages };
};
