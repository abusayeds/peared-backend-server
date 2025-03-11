
import { UserModel } from "../user/user.model";
import { TContact } from "./contact-interface";
import { ContactkModel } from "./contact.model";

const createContactDB = async (payload: TContact) => {
    const createContact = await ContactkModel.create(payload)
    return createContact
};

const getContactMessageDB = async (): Promise<any[]> => {
    try {
        const getContact: any[] = await ContactkModel.find().populate({
            path: "userId",
            select: "name email image",
        });
        const uniqueUsers: { [key: string]: any } = {};
        getContact.forEach((contact: any) => {
            if (contact.userId && !uniqueUsers[contact.userId._id]) {
                uniqueUsers[contact.userId._id] = {
                    userId: contact.userId._id,
                    name: contact.userId.name,
                    email: contact.userId.email,
                    image: contact.userId.image,
                };
            }
        });

        return Object.values(uniqueUsers);
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        return [];
    }
};


const getContactUserMessageDB = async (userId: string) => {
    const user = await UserModel.findById(userId)
    const userData = {
        name: user.name,
        email: user.email,
        image: user.image
    }
    const message = await ContactkModel.find({ userId: userId })
    return { userData, message }
};


export const contactService = {
    createContactDB,
    getContactMessageDB,
    getContactUserMessageDB
}