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
