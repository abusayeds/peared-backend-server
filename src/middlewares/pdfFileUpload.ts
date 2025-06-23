import httpStatus from "http-status";
import multer from "multer";
import { UPLOAD_FOLDER } from "../config";
import AppError from "../errors/AppError";

const UPLOAD_PATH = UPLOAD_FOLDER || "public/images";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_PATH);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif", "application/pdf"];
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new AppError(httpStatus.BAD_REQUEST, "Only image files and PDFs are allowed!"), false);
  }
};

const uploadFiles = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).fields([
  { name: "image", maxCount: 5 },
  { name: "certificate", maxCount: 5 },
  { name: "backgroundCertificat", maxCount: 1 },
  { name: "oshaCertificat", maxCount: 1 }
]);


const handleFileUpload = (req: any, res: any, next: any) => {
  uploadFiles(req, res, (err: any) => {
    if (err) {
      return next(err);
    }
    if (req.files && req.files.image && req.files.image.length > 0) {
      req.body.image = `/images/${req.files.image[0].filename}`;
    }
    if (req.files && req.files.certificate && req.files.certificate.length > 0) {
      const certificatePaths: string[] = [];
      req.files.certificate.forEach((file: any) => {
        certificatePaths.push(`/images/${file.filename}`);
      });
      req.body.certificate = certificatePaths;
    }

    if (req.files && req.files.oshaCertificat && req.files.oshaCertificat.length > 0) {
      const oshaCertificat = req.files.oshaCertificat[0]
      if (oshaCertificat.mimetype !== 'application/pdf') {
        return next(new AppError(httpStatus.BAD_REQUEST, 'PDF only for OSAH Certificat.'));
      }
      req.body.oshaCertificat = `/images/${oshaCertificat.filename}`;
    }

    if (req.files && req.files.backgroundCertificat && req.files.backgroundCertificat.length > 0) {
      const backgroundCertificat = req.files.backgroundCertificat[0];
      if (backgroundCertificat.mimetype !== 'application/pdf') {
        return next(new AppError(httpStatus.BAD_REQUEST, 'PDF only for Background Certificat.'));
      }
      req.body.backgroundCertificat = `/images/${backgroundCertificat.filename}`;
    }


    next();
  });
};


export default handleFileUpload;
