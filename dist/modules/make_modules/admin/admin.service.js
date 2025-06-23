"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const payment_model_1 = require("../../basic_modules/payment/payment.model");
const user_model_1 = require("../../basic_modules/user/user.model");
const project_model_1 = __importDefault(require("../addProject/project-model"));
const withdraw_model_1 = require("../withdraw/withdraw.model");
const adminDashBoard = () => __awaiter(void 0, void 0, void 0, function* () {
    const Earnings = yield payment_model_1.PaymentModel.findOne({ sessionId: "admin123" });
    const project = yield project_model_1.default.find();
    const provider = yield user_model_1.UserModel.find({ role: 'provider' });
    const user = yield user_model_1.UserModel.find({ role: 'user' });
    const dashBoard = {
        earnings: Earnings.amount,
        project: project.length,
        user: user.length,
        provider: provider.length
    };
    return dashBoard;
});
const earningsDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const Earnings = yield payment_model_1.PaymentModel.findOne({ sessionId: "admin123" });
    const totalIncome = yield payment_model_1.PaymentModel.findOne({ sessionId: "admin1234" });
    const totalAmount = yield withdraw_model_1.withdrawModel.find();
    console.log(totalAmount);
    const total = totalAmount.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
    const dashBoard = {
        earnings: Earnings.amount,
        totalAmount: totalIncome.amount,
        totalWithdrawAmount: total
    };
    return dashBoard;
});
// const adminIncomeDB = async () => {
//     const adminIncome = await paymentHistoryModel.find({ admin: "admin123" })
//     console.log(adminIncome);
// }
const adminIncomeDB = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_model_1.paymentHistoryModel.aggregate([
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
});
const adminTransactionDB = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_model_1.paymentHistoryModel.aggregate([
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
});
exports.adminService = {
    adminDashBoard,
    adminIncomeDB,
    adminTransactionDB,
    earningsDB
};
