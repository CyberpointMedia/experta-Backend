const nodemailer = require('nodemailer');
const config = require('../config/config');

module.exports.transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtp.gmail.com",
       auth: {
            user: config.mail.user,
            pass: config.mail.pass,
         },
    secure: true,
});

module.exports.sendMail = async function (to, subject, text, html) {
    const mailOptions = {
        from: config.mail.user,
        to,
        subject,
        text,
        html,
    };

    try {
        const info = await module.exports.transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.response}`);
        return info;
    } catch (error) {
        console.error(`Error sending email: ${error}`);
        throw error;
    }
};
