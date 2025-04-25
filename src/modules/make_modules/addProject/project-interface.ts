import { Date, Document, Types } from "mongoose";


export type TProject = {
    _id?: any
    userId: Types.ObjectId
    street: string;
    city: string;
    projectName: string;
    projectCategory: string;
    postCode: string;
    locationType: "Home" | "Business";
    time: "Urgent(1 - 2 days)" | "Within 2 weeks" | "More than 2 weeks" | "Not sure - still planning";
    priceRange: string;
    backgroundCertificate: boolean,
    oshaCertificate: boolean
    image: string
    workDetails: string;
    payment: boolean,
    isApprove: boolean,
    expiredDate: Date
} & Document; 