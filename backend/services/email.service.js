// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_APP_PASSWORD,
//   },
// });

// export const sendResetOTPEmail = async (to, otp) => {
//   await transporter.sendMail({
//     from: `"ServerOps" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: "Password Reset OTP",
//     text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
//     html: `
//       <div style="font-family: Arial, sans-serif;">
//         <h2>Password Reset</h2>
//         <p>Your OTP is:</p>

//         <h1 style="letter-spacing: 5px;">
//           ${otp}
//         </h1>

//         <p>This OTP expires in <strong>10 minutes</strong>.</p>

//         <p>If you didn't request a password reset, you can ignore this email.</p>
//       </div>
//     `,
//   });
// };
