const nodemailer = require('nodemailer');
const config = require('../config/config');
console.log("config", config.mail.user , config.mail.pass);
module.exports.transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtp.gmail.com",
       auth: {
            user: config.mail.user,
            pass: process.env.MailPASS,
         },
    secure: true,
});
