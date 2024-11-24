const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userAccountSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  username: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const UserAccount = mongoose.model('UserAccount', userAccountSchema);

module.exports = UserAccount;