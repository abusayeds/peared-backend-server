import httpStatus from "http-status";
import multer from "multer";
import AppError from "../errors/AppError";
import { uploadToCloudinary } from "../utils/cloudinary";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/gif",
    "application/pdf",
  ];
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        httpStatus.BAD_REQUEST,
        "Only image files and PDFs are allowed!",
      ),
      false,
    );
  }
};

const uploadFiles = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).fields([
  { name: "image", maxCount: 5 },
  { name: "certificate", maxCount: 5 },
  { name: "backgroundCertificat", maxCount: 1 },
  { name: "oshaCertificat", maxCount: 1 },
]);

const handleFileUpload = (req: any, res: any, next: any) => {
  uploadFiles(req, res, async (err: any) => {
    if (err) {
      return next(err);
    }

    try {
      if (req.files?.image?.length > 0) {
        req.body.image = await uploadToCloudinary(
          req.files.image[0],
          "peared/images",
        );
      }

      if (req.files?.certificate?.length > 0) {
        const certificateUrls: string[] = [];
        for (const file of req.files.certificate) {
          certificateUrls.push(
            await uploadToCloudinary(file, "peared/certificates"),
          );
        }
        req.body.certificate = certificateUrls;
      }

      if (req.files?.oshaCertificat?.length > 0) {
        const oshaCertificat = req.files.oshaCertificat[0];
        if (oshaCertificat.mimetype !== "application/pdf") {
          return next(
            new AppError(httpStatus.BAD_REQUEST, "PDF only for OSAH Certificat."),
          );
        }
        req.body.oshaCertificat = await uploadToCloudinary(
          oshaCertificat,
          "peared/certificates",
        );
      }

      if (req.files?.backgroundCertificat?.length > 0) {
        const backgroundCertificat = req.files.backgroundCertificat[0];
        if (backgroundCertificat.mimetype !== "application/pdf") {
          return next(
            new AppError(
              httpStatus.BAD_REQUEST,
              "PDF only for Background Certificat.",
            ),
          );
        }
        req.body.backgroundCertificat = await uploadToCloudinary(
          backgroundCertificat,
          "peared/certificates",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  });
};

export default handleFileUpload;
