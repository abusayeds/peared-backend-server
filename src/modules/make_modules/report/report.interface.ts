import { Types } from "mongoose"

export type TReport = {
    bitProjectId: Types.ObjectId,
    repoterId: Types.ObjectId,
    userId: Types.ObjectId
    details: string,
    image: string
}