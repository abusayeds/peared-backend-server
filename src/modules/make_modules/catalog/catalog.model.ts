import mongoose, { Schema } from "mongoose";

export type TServiceCatalog = {
  name: string;
  nameLower: string;
};

const serviceCatalogSchema = new Schema<TServiceCatalog>(
  {
    name: { type: String, required: true, trim: true },
    nameLower: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

serviceCatalogSchema.index({ name: "text" });

export const ServiceCatalogModel =
  mongoose.models.ServiceCatalog ||
  mongoose.model<TServiceCatalog>("ServiceCatalog", serviceCatalogSchema);

export type TEducationCatalog = {
  name: string;
  nameLower: string;
};

const educationCatalogSchema = new Schema<TEducationCatalog>(
  {
    name: { type: String, required: true, trim: true },
    nameLower: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

educationCatalogSchema.index({ name: "text" });

export const EducationCatalogModel =
  mongoose.models.EducationCatalog ||
  mongoose.model<TEducationCatalog>("EducationCatalog", educationCatalogSchema);
