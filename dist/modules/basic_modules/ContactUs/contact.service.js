"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactService = void 0;
const user_model_1 = require("../user/user.model");
const contact_model_1 = require("./contact.model");
const createContactDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createContact = yield contact_model_1.ContactkModel.create(payload);
    return createContact;
});
const getContactMessageDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getContact = yield contact_model_1.ContactkModel.find().populate({
            path: "userId",
            select: "name email image",
        });
        const uniqueUsers = {};
        getContact.forEach((contact) => {
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
    }
    catch (error) {
        console.error("Error fetching contact messages:", error);
        return [];
    }
});
const getContactUserMessageDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    const userData = {
        name: user.name,
        email: user.email,
        image: user.image
    };
    const message = yield contact_model_1.ContactkModel.find({ userId: userId });
    return { userData, message };
});
exports.contactService = {
    createContactDB,
    getContactMessageDB,
    getContactUserMessageDB
};
