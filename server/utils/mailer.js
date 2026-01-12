import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // NOT your login password
  },
  logger: true, // <--- Add this
  debug: true,  // <--- Add this
});

export const sendPurchaseEmail = async (userEmail, itemName, price) => {
    try {
        const mailOptions = {
            from: `"Point Shop" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Purchase Successful: ${itemName}`,
            html: `
                <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
                    <h2>Thank you for your purchase!</h2>
                    <p>You have successfully redeemed <strong>${itemName}</strong>.</p>
                    <p><strong>Points Deducted:</strong> ${price}</p>
                    <p>Your item is now available in your history.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Nodemailer Error:', error);
    }
};