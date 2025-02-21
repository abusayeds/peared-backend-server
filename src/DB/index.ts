import { paymentController } from './../modules/basic_modules/payment/payment.controller';
import { PaymentModel } from "../modules/basic_modules/payment/payment.model";
import { UserModel } from "../modules/basic_modules/user/user.model";
import { create } from 'domain';


const admin = {
  name: "MD Admin",
  email: "admin@gmail.com",
  password: "1qazxsw2",
  role: "admin",
  isDeleted: false,
};

export const seedSuperAdmin = async () => {
  const isSuperAdminExists = await UserModel.findOne({ email: admin.email });
  const isSuperAdminPaymentExists = await PaymentModel.findOne({ customerEmail: admin.email });

  if (!isSuperAdminPaymentExists) {
    await PaymentModel.create({
      sessionId: "admin123",
      projectId: "income",
      customerEmail: admin.email,
      amount: 0,
      currency: "usd",
      paymentStatus: "pending"
    });
    await PaymentModel.create({
      sessionId: "admin1234",
      projectId: "transaction",
      customerEmail: admin.email,
      amount: 0,
      currency: "usd",
      paymentStatus: "pending"
    });
  }

  if (!isSuperAdminExists) {
    await UserModel.create(admin);
  }
};

export default seedSuperAdmin;
