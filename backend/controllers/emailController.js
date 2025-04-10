const nodemailer = require('nodemailer');

const sendMeetingEmail = async (data) => {
    console.log("📩 Start Sending Email");

    // Handle both request object and plain object
    const emailData = data.body || data;

    // Destructure email data
    const {
        receiverEmail,
        candidateName = "Not Assigned",
        interviewerName = 'Not Assigned',
        roomLink,
        interviewTime,
        message
    } = emailData;

    console.log("➡️ Email Data:", emailData);

    // ✅ Input Validation
    if (!receiverEmail || !candidateName || !roomLink) {
        throw new Error('Missing required fields: receiverEmail, candidateName, or roomLink');
    }

    // ✅ Ensure Email Config is Set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Missing email credentials in environment variables.');
        throw new Error('Email configuration is missing');
    }

    try {
        // ✅ Create Transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            timeout: 10000
        });

        // ✅ Verify Transporter
        await transporter.verify();

        // ✅ Email Content
        const mailOptions = {
            from: `"Live Coding Platform" <${process.env.EMAIL_USER}>`,
            to: receiverEmail,
            subject: `📩 Interview Request from ${candidateName}`,
            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                    color: #333;
                    max-width: 600px;
                    margin: 20px auto;
                ">
                    <h2 style="color: #4CAF50; margin-bottom: 10px;">🎯 New Interview Request</h2>
                    
                    <p style="font-size: 16px; line-height: 24px;">
                        <strong>👤 Candidate Name:</strong> ${candidateName} <br>
                        <strong>👨‍💼 Interviewer Name:</strong> ${interviewerName} <br>
                        <strong>📅 Scheduled Time:</strong> ${interviewTime || 'To be confirmed'} <br>
                        <strong>🔗 Room Link:</strong> <a href="${roomLink}" target="_blank" style="color: #4CAF50; text-decoration: none;">Join Meeting</a>
                    </p>

                    ${message ? `
                        <div style="
                            margin-top: 20px;
                            padding: 15px;
                            background-color: #f1f1f1;
                            border-left: 5px solid #4CAF50;
                        ">
                            <strong>📝 Message:</strong>
                            <p>${message}</p>
                        </div>
                    ` : ''}

                    <hr style="border: 0; height: 1px; background-color: #e0e0e0; margin: 20px 0;">
                    <p style="color: #555; font-size: 14px; text-align: center;">
                        🚀 Kindly join the session on time. If you have any issues, contact support.
                    </p>
                </div>
            `
        };

        console.log("➡️ Sending email to:", receiverEmail);

        // ✅ Send Email
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw error;
    }
};

module.exports = {
    sendMeetingEmail
};



