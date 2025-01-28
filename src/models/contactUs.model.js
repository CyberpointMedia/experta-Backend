// models/contactUs.model.js
const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema({
  phone: { type: Number, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

const ContactUs = mongoose.model("ContactUs", contactUsSchema);

module.exports = ContactUs;