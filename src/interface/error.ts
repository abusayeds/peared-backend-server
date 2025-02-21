// export type IErrorResponse = {
//   success: false;
//   message: string;
//   errorMessage: string;
//   statusCode: number;
//   errorDetails: Record<string, unknown>;
// };
// export type TErrorSoureces = {
//   path: string | number;
//   message: string;
// }[];
// export type TGenericErrorResponse ={
//   statusCode: number;
//   message: string
//   errorSoures : TErrorSoureces
  
// }
export type TErrorSoureces = {
  path: string | number;
  message: string;
}[];
export type TGenericErrorResponse ={
  statusCode: number;
  message: string
  errorSoures : TErrorSoureces
  
}