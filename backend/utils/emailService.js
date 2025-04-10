const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send email function
const sendEmail = async (emailData) => {
    try {
        const { to, subject, html } = emailData;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

// Email templates
const emailTemplates = {
    interviewScheduled: (data) => {
        const { candidateName, interviewerName, scheduledTime, duration, topic, meetingLink } = data;
        
        return {
            subject: 'Interview Scheduled',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">Interview Scheduled</h1>
                    <p>Hello ${candidateName},</p>
                    <p>Your interview has been scheduled with ${interviewerName}.</p>
                    <p><strong>Details:</strong></p>
                    <ul>
                        <li><strong>Date & Time:</strong> ${new Date(scheduledTime).toLocaleString()}</li>
                        <li><strong>Duration:</strong> ${duration} minutes</li>
                        <li><strong>Topic:</strong> ${topic}</li>
                    </ul>
                    <p>Click the button below to join the interview:</p>
                    <a href="${meetingLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Join Interview</a>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p>${meetingLink}</p>
                    <p>Good luck with your interview!</p>
                    <p>Best regards,<br>Interview Platform Team</p>
                </div>
            `
        };
    },
    
    interviewReminder: (data) => {
        const { candidateName, interviewerName, scheduledTime, duration, topic, meetingLink } = data;
        
        return {
            subject: 'Interview Reminder',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">Interview Reminder</h1>
                    <p>Hello ${candidateName},</p>
                    <p>This is a reminder that your interview with ${interviewerName} is coming up soon.</p>
                    <p><strong>Details:</strong></p>
                    <ul>
                        <li><strong>Date & Time:</strong> ${new Date(scheduledTime).toLocaleString()}</li>
                        <li><strong>Duration:</strong> ${duration} minutes</li>
                        <li><strong>Topic:</strong> ${topic}</li>
                    </ul>
                    <p>Click the button below to join the interview:</p>
                    <a href="${meetingLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Join Interview</a>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p>${meetingLink}</p>
                    <p>Good luck with your interview!</p>
                    <p>Best regards,<br>Interview Platform Team</p>
                </div>
            `
        };
    }
};

module.exports = {
    sendEmail,
    emailTemplates
};

