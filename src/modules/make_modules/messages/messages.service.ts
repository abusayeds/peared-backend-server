import queryBuilder from "../../../builder/queryBuilder"
import { conversationModel, messageModel } from "./messages.model"

const getConversationDB = async (conversationId: string, query: Record<string, unknown>) => {
    const messageQuery = new queryBuilder(messageModel.find({ conversationId: conversationId }), query).sort()
    const { totalData } = await messageQuery.paginate(messageModel.find({ conversationId: conversationId }))
    const data = await messageQuery.modelQuery.exec()
    const currentPage = Number(query?.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = messageQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, data, };
}


export const messageservice = {
    getConversationDB
}