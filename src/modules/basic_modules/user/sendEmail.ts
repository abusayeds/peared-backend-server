import nodemailer from "nodemailer";
import { Nodemailer_GMAIL, Nodemailer_GMAIL_PASSWORD } from "../../../config";

export const sendEmail = (otp: any, email: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: Nodemailer_GMAIL,
      pass: Nodemailer_GMAIL_PASSWORD,
    },
  });

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
  <h1 style="text-align: center; color: #2c3e50; font-family: 'Times New Roman', Times, serif;">
    Peare<span style="color:#d35400; font-size: 0.9em;">d </span>
  </h1>
  
  <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color:#d35400; margin-bottom: 10px;">Hello!</h2>
    <p style="color: #333; font-size: 16px;">You are receiving this email because we received a request to reset your password.</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <h3 style="background: #d35400; color: white; display: inline-block; padding: 10px 20px; border-radius: 5px;">
        Your OTP: <strong>${otp}</strong>
      </h3>
    </div>

    <p style="color: #666; font-size: 15px;">This OTP will expire in <strong>10 minutes.</strong></p>
    <p style="color: #666; font-size: 15px;">If you did not request this, please ignore this email.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

    <p style="color: #333; font-size: 14px; text-align: center;">
      Regards, <br><strong style="color:#d35400;">Magy Team</strong>
    </p>
  </div>

  <p style="font-size: 12px; color: #777; margin-top: 10px; text-align: center;">
    If you're having trouble copying the OTP, please try again.
  </p>
</div>`;

  const receiver = {
    from: "khansourav58@gmail.com",
    to: email,
    subject: "Reset Password OTP",
    html: emailContent,
  };

  transporter.sendMail(receiver);
}