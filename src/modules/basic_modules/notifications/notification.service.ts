import queryBuilder from "../../../builder/queryBuilder";
import { NotificationModel } from "./notification.model";

// const getConversationDB = async (conversationId: string, query: Record<string, unknown>) => {

//     const messageQuery = new queryBuilder(messageModel.find({ conversationId: conversationId }), query).sort()
//     const { totalData } = await messageQuery.paginate(messageModel.find({ conversationId: conversationId }))
//     const data = await messageQuery.modelQuery.exec()
//     const currentPage = Number(query?.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const pagination = messageQuery.calculatePagination({
//         totalData,
//         currentPage,
//         limit,
//     });
//     return { pagination, data, };
// }


const getMyNotification = async (userId: string, query: Record<string, unknown>) => {
    const notificationQuery = new queryBuilder(NotificationModel.find({ userId: userId }), query).sort();
    const { totalData } = await notificationQuery.paginate(NotificationModel.find({ userId: userId }))
    const notifications = await notificationQuery.modelQuery.exec()
    const currentPage = Number(query?.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = notificationQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, notifications, };
}

export const notificationService = {
    getMyNotification
}