// import mongoose from "mongoose";
// import { IErrorResponse } from "../interface/error";

import { TErrorSoureces, TGenericErrorResponse } from "../interface/error";

// const handlerDuplicateError = (
//   err: mongoose.Error.ValidationError,
// ): IErrorResponse => {
//   const regex = /"(.*?)"/;
//   const matches = err.message.match(regex);
//   return {
//     success: false,
//     statusCode: 409,
//     message: "Duplicate Error",
//     errorMessage: `${matches![1]} is already exists!`,
//     errorDetails: { err },
//   };
// };

// export default handlerDuplicateError;

const handleDuplicateError = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any): TGenericErrorResponse => {
    
  const match = err.message.match(/"([^"]*)"/);
  const extractedMessage = match && match[1];
  const  errorSoures: TErrorSoureces = [
    {
        path: '',
        message: `${extractedMessage} is already exists`,
    }
  ];

  const statusCode = 400;
  return {
    statusCode,
    message: errorSoures[0].message,
     errorSoures,
  };
};
export default handleDuplicateError ;