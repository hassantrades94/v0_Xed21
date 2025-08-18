import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify?token=${token}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Xed21 Account</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0891b2 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Xed21!</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">AI-Powered Educational Assessment Platform</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin-top: 0;">🎉 Get 500 Free Coins!</h2>
        <p>Thank you for signing up with Xed21. To complete your registration and claim your <strong>500 free coins</strong>, please verify your email address.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: linear-gradient(135deg, #0891b2 0%, #10b981 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(8, 145, 178, 0.3);">
            Verify Email & Claim Coins
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #0891b2; word-break: break-all;">${verificationUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          This verification link will expire in 24 hours. If you didn't create an account with Xed21, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
        <p>© 2025 Xed21. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"Xed21" <noreply@xed21.com>`,
    to: email,
    subject: "🎉 Verify Your Email & Get 500 Free Coins - Xed21",
    html: htmlContent,
  })
}
