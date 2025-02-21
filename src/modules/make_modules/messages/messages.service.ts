import { conversationModel, messageModel } from "./messages.model"

const getConversationDB = async (conversationId: string) => {
    const result = await messageModel.find({

        conversationId: conversationId
    })

    return result

}

export const messageservice = {
    getConversationDB
}