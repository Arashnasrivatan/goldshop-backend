import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import { AppError } from "./../errors/AppError";

type AllowedType = "image" | "zip";

const getFileFilter = (type: AllowedType) => {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const imageMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    const zipMimes = ["application/zip", "application/x-zip-compressed"];

    if (type === "image" && imageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else if (type === "zip" && zipMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
};

interface UploadField {
  name: string;
  type: AllowedType;
  maxCount?: number;
  required?: boolean;
}

const uploader = (fields: UploadField[], fileSizeMB: number = 10) => {
  const limits = { fileSize: fileSizeMB * 1024 * 1024 };

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const field = fields.find((f) => f.name === file.fieldname);
    if (!field) return cb(null, false);
    return getFileFilter(field.type)(req, file, cb);
  };

  const upload = multer({ limits, fileFilter });

  const multerFields = fields.map((f) => ({
    name: f.name,
    maxCount: f.maxCount ?? (f.type === "image" ? 10 : 1),
  }));

  const middleware = upload.fields(multerFields);

  return (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err) => {
      if (err) return next(err);

      for (const field of fields) {
        const files = (req.files as { [key: string]: Express.Multer.File[] })?.[
          field.name
        ];
        const isRequired = field.required ?? false;

        if (
          isRequired &&
          (!files || (Array.isArray(files) && files.length === 0))
        ) {
          throw new AppError(`${field.name} is required.`, 400);
        }
      }

      next();
    });
  };
};

export default uploader;
