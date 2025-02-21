import { Request, Response } from "express";
import AppError from "../errors/AppError";

const notFound = (req: Request, res: Response) => {
  throw new AppError(404,
     `Route Not Found for ${req.originalUrl}`
  );
};

export default notFound;
