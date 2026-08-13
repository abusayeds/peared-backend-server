import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import catagoryModel from "../addProject/projectCatagory/ctegory.model";
import { EducationCatalogModel, ServiceCatalogModel } from "./catalog.model";

const normalizeName = (name: string) =>
  String(name || "")
    .trim()
    .replace(/\s+/g, " ");

const toLowerKey = (name: string) => normalizeName(name).toLowerCase();

const searchServicesDB = async (q?: string, limit = 30) => {
  const query: any = {};
  if (q && q.trim()) {
    query.name = { $regex: q.trim(), $options: "i" };
  }
  return ServiceCatalogModel.find(query).sort({ name: 1 }).limit(Number(limit) || 30);
};

const findOrCreateServiceDB = async (rawName: string) => {
  const name = normalizeName(rawName);
  if (!name) throw new AppError(httpStatus.BAD_REQUEST, "Service name is required");
  const nameLower = toLowerKey(name);

  let doc = await ServiceCatalogModel.findOne({ nameLower });
  if (!doc) {
    doc = await ServiceCatalogModel.create({ name, nameLower });
  }

  // Keep legacy catagory collection in sync for older UI
  const existsCat = await catagoryModel.findOne({
    catagory: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  });
  if (!existsCat) {
    await catagoryModel.create({ catagory: name });
  }

  return doc;
};

const searchEducationsDB = async (q?: string, limit = 30) => {
  const query: any = {};
  if (q && q.trim()) {
    query.name = { $regex: q.trim(), $options: "i" };
  }
  return EducationCatalogModel.find(query).sort({ name: 1 }).limit(Number(limit) || 30);
};

const findOrCreateEducationDB = async (rawName: string) => {
  const name = normalizeName(rawName);
  if (!name) throw new AppError(httpStatus.BAD_REQUEST, "Education name is required");
  const nameLower = toLowerKey(name);

  let doc = await EducationCatalogModel.findOne({ nameLower });
  if (!doc) {
    doc = await EducationCatalogModel.create({ name, nameLower });
  }
  return doc;
};

export const catalogService = {
  searchServicesDB,
  findOrCreateServiceDB,
  searchEducationsDB,
  findOrCreateEducationDB,
};
