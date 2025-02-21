// import { ZodError, ZodIssue } from "zod";
// import { IErrorResponse } from "../interface/error";

// const handlerZodError = (err: ZodError): IErrorResponse => {
//   const errorMessageArray: string[] = err.issues.map(
//     (issue: ZodIssue) =>
//       issue.path[issue.path.length - 1] +
//       " is " +
//       issue.message.split(",")[0].toLowerCase(),
//   );
//   return {
//     success: false,
//     statusCode: 400,
//     message: "Validation Error",
//     errorMessage: errorMessageArray.join(". "),
//     errorDetails: { ...err },
//   };
// };

// export default handlerZodError;


import { ZodError, ZodIssue } from "zod";
import { TErrorSoureces, TGenericErrorResponse } from "../interface/error";
const hendleZodError = (err: ZodError) :TGenericErrorResponse => {
  const errorSoures: TErrorSoureces = err.issues.map((issue: ZodIssue) => {
    return {
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    };
  });
  const statusCode = 400;
  return {
    statusCode,
    message: errorSoures[0].message,
    errorSoures,
  };
};
export default hendleZodError;