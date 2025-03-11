import { Types } from "mongoose"

export type TBitProject = {
    projectId: Types.ObjectId
    providerId  : Types.ObjectId, 
    price: number,
    serviceTime: number;
    startTime: Date
    Workdetails: string
    isComplete : "pending" | "running" | "complete";
}
 