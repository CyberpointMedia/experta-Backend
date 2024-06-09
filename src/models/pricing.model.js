const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PricingSchema = new Schema({
  audioCallPrice: { type: Number, required: true },
  videoCallPrice: { type: Number, required: true },
  messagePrice: { type: Number, default: 0 },
});

const Pricing = mongoose.model("Pricing", PricingSchema);
module.exports = Pricing;

// // booking
// 1.accept/reject  --> reject -- trigger
// 2.user:
// 3.expertId:
// 4.duration:
// 5.appointmentData:
// 6.coins deducted : coins deducted
// 7.coins remaining: user coin remaning
// 8.bookingStatus: pending,waiting
