import { AnyZodObject } from "zod";

import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";

const zodValidation = (schema: AnyZodObject) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const parsed = await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        if (parsed?.body) {
            req.body = parsed.body;
        }
        next()
    })
}
export default zodValidation