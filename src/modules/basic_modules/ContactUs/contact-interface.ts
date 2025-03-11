import { Types } from "mongoose"

export type TContact = {
    userId: Types.ObjectId
    name: string,
    email: string,
    message: string
}