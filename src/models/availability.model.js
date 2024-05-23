const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the AvailabilitySlot schema
const AvailabilitySlotSchema = new Schema({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    weeklyRepeat: { type: [String], enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] }
});

const AvailabilitySchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    slots: [AvailabilitySlotSchema]
});

const Availability = mongoose.model('Availability', AvailabilitySchema);

module.exports = Availability;