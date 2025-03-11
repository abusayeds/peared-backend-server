import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import httpStatus from "http-status";
import { JWT_SECRET_KEY } from '../config';

export const tokenDecoded = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
   
    
   
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(httpStatus.UNAUTHORIZED,
            "No token provided or invalid format.",
        );
    }
    const token = authHeader.split(" ")[1];
   
    const decoded = jwt.verify(token, JWT_SECRET_KEY as string) 
    return { decoded, token }
}

