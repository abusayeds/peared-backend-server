import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Express, NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { max_file_size } from "../config";
import { uploadToCloudinary } from "../utils/cloudinary";

const MAX_FILE_SIZE = Number(max_file_size) || 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  ".jpg",
  ".jpeg",
  ".png",
  ".xlsx",
  ".xls",
  ".csv",
  ".pdf",
  ".doc",
  ".docx",
  ".mp3",
  ".wav",
  ".ogg",
  ".mp4",
  ".avi",
  ".mov",
  ".mkv",
  ".webm",
  ".svg",
  "jfif",
];

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const extName = path.extname(file.originalname).toLocaleLowerCase();
  const isAllowedFileType = ALLOWED_FILE_TYPES.includes(extName);
  if (!isAllowedFileType) {
    return cb(createHttpError(400, "File type not allowed"));
  }

  cb(null, true);
};

const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

const cloudinaryUploadSingle = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (req.file) {
      req.body.image = await uploadToCloudinary(req.file, "peared/images");
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const uploadSingle = (fieldName: string) => [
  multerUpload.single(fieldName),
  cloudinaryUploadSingle,
];
