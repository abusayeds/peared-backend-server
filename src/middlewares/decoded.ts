import { Request, Response } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from '../config';
import AppError from "../errors/AppError";

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
export const socketTokenDecoded = async (token: any) => {
    if (!token || typeof token !== 'string') {
        return { decoded: null, token };
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY as string);
        return { decoded, token };
    } catch (error: any) {
        return { decoded: null, token };
    }
};

