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
exports.updateTermsInDB = exports.getAllTermsFromDB = exports.createTermsInDB = void 0;
const Terms_model_1 = require("./Terms.model");
const createTermsInDB = (termsData) => __awaiter(void 0, void 0, void 0, function* () {
    const newTerms = new Terms_model_1.TermsModel({ description: termsData.sanitizedContent });
    const savedTerms = yield newTerms.save();
    return savedTerms;
});
exports.createTermsInDB = createTermsInDB;
const getAllTermsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const terms = yield Terms_model_1.TermsModel.find().sort({ createdAt: -1 });
    return terms;
});
exports.getAllTermsFromDB = getAllTermsFromDB;
const updateTermsInDB = (newData) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedTerms = yield Terms_model_1.TermsModel.findOneAndUpdate({}, { description: newData }, { new: true, upsert: true });
    return updatedTerms;
});
exports.updateTermsInDB = updateTermsInDB;
