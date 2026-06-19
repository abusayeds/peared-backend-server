import { v2 as cloudinary } from "cloudinary";
import { Express } from "express";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../config";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder = "peared",
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const resourceType =
      file.mimetype === "application/pdf" ? "raw" : "auto";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result.secure_url);
      },
    );

    uploadStream.end(file.buffer);
  });
};
