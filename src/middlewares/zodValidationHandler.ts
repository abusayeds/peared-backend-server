import { AnyZodObject } from "zod";

import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";

const zodValidation = (schema: AnyZodObject) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await schema.parseAsync(req)

        next()
    })
}
export default zodValidation