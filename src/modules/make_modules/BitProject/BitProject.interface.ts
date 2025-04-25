import { Types } from "mongoose"

export type TBitProject = {
    projectId: Types.ObjectId
    providerId: Types.ObjectId,
    price: number,
    serviceTime: number;
    startTime: Date
    Workdetails: string
    certificate: string[];
    estimatedServiceTime: boolean
    isComplete: "pending" | "running" | "complete";
}
