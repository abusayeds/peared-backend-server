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
exports.updatePrivacyInDB = exports.getAllPrivacyFromDB = exports.createPrivacyInDB = void 0;
const Privacy_model_1 = require("./Privacy.model");
const createPrivacyInDB = (privacyData) => __awaiter(void 0, void 0, void 0, function* () {
    const newPrivacy = new Privacy_model_1.PrivacyModel({
        description: privacyData.sanitizedContent,
    });
    const savedPrivacy = yield newPrivacy.save();
    return savedPrivacy;
});
exports.createPrivacyInDB = createPrivacyInDB;
const getAllPrivacyFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const privacy = yield Privacy_model_1.PrivacyModel.find().sort({ createdAt: -1 });
    return privacy;
});
exports.getAllPrivacyFromDB = getAllPrivacyFromDB;
const updatePrivacyInDB = (newData) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedPrivacy = yield Privacy_model_1.PrivacyModel.findOneAndUpdate({}, { description: newData }, { new: true, upsert: true });
    return updatedPrivacy;
});
exports.updatePrivacyInDB = updatePrivacyInDB;
