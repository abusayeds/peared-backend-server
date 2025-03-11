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
exports.updateAboutInDB = exports.getAllAboutFromDB = exports.createAboutInDB = void 0;
const About_model_1 = require("./About.model");
const createAboutInDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const crateAbout = About_model_1.AboutModel.create(payload);
    return crateAbout;
});
exports.createAboutInDB = createAboutInDB;
const getAllAboutFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const about = yield About_model_1.AboutModel.find().sort({ createdAt: -1 });
    return about;
});
exports.getAllAboutFromDB = getAllAboutFromDB;
const updateAboutInDB = (newData) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedAbout = yield About_model_1.AboutModel.findOneAndUpdate({}, { description: newData }, { new: true, upsert: true });
    return updatedAbout;
});
exports.updateAboutInDB = updateAboutInDB;
