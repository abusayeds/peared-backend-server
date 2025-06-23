import { paymentHistoryModel, PaymentModel } from "../../basic_modules/payment/payment.model"
import { UserModel } from "../../basic_modules/user/user.model"
import projectModel from "../addProject/project-model"
import { withdrawModel } from "../withdraw/withdraw.model"

const adminDashBoard = async () => {

    const Earnings: any = await PaymentModel.findOne({ sessionId: "admin123" })
    const project = await projectModel.find()
    const provider = await UserModel.find({ role: 'provider' })
    const user = await UserModel.find({ role: 'user' })
    const dashBoard = {
        earnings: Earnings.amount,
        project: project.length,
        user: user.length,
        provider: provider.length
    }
    return dashBoard
}
const earningsDB = async () => {
    const Earnings: any = await PaymentModel.findOne({ sessionId: "admin123" })
    const totalIncome: any = await PaymentModel.findOne({ sessionId: "admin1234" })
    const totalAmount: any = await withdrawModel.find()
    console.log(totalAmount);

    const total = totalAmount.reduce((sum: number, withdrawal: any) => sum + withdrawal.amount, 0);
    const dashBoard = {
        earnings: Earnings.amount,
        totalAmount: totalIncome.amount,
        totalWithdrawAmount: total
    }
    return dashBoard
}
// const adminIncomeDB = async () => {
//     const adminIncome = await paymentHistoryModel.find({ admin: "admin123" })
//     console.log(adminIncome);

// }

const adminIncomeDB = async (year: number) => {


    const result = await paymentHistoryModel.aggregate([
        {
            $match: {
                admin: "admin123",
                createdAt: {
                    $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                    $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
                },
            },
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                totalIncome: { $sum: "$balance" },
            },
        },
        {
            $sort: { _id: 1 },
        },
        {
            $project: {
                month: "$_id",
                totalIncome: 1,
                _id: 0,
            },
        },
    ]);


    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    const formattedResult = monthNames.map((name, index) => {
        const monthData = result.find(item => item.month === index + 1);
        return {
            month: name,
            totalAmount: monthData ? monthData.totalIncome : 0,
        };
    });

    return formattedResult;
};
const adminTransactionDB = async (year: number) => {

    const result = await paymentHistoryModel.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                    $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`)
                }
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                totalIncome: { $sum: "$balance" }
            }
        },
        {
            $sort: { _id: 1 }
        },
        {
            $project: {
                month: "$_id",
                totalIncome: 1,
                _id: 0
            }
        }
    ]);



    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    const formattedResult = monthNames.map((name, index) => {
        const monthData = result.find(item => item.month === index + 1);
        return {
            month: name,
            totalAmount: monthData ? monthData.totalIncome : 0,
        };
    });

    return formattedResult;
};




export const adminService = {
    adminDashBoard,
    adminIncomeDB,
    adminTransactionDB,
    earningsDB
}


