import { PaymentModel } from "../../basic_modules/payment/payment.model"
import { UserModel } from "../../basic_modules/user/user.model"
import projectModel from "../addProject/project-model"

const adminDashBoard = async (email: string) => {

    const Earnings : any = await PaymentModel.findOne({ customerEmail: email })
    const project = await projectModel.find() 
    const provider =  await  UserModel.find({role: 'provider'})
    const user =  await  UserModel.find({role: 'user'})
    const dashBoard  = {
        earnings : Earnings.amount,
        project : project.length,
        user : user.length,
        provider : provider.length
    }
    return  dashBoard
}

export const adminService = {
    adminDashBoard
}