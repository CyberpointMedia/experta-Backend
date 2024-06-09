const mongoose = require("mongoose");
const dbConfig = require("../config/config").database;
const connectDB = async () => {
  try {
    await mongoose.connect(dbConfig.url, {});
    console.log("CONNECTED TO DATABASE SUCCESSFULLY");
  } catch (error) {
    console.error("COULD NOT CONNECT TO DATABASE:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
