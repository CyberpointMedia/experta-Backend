const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
dotenv.config();
const config = require("./config/config");
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());
connectDB();

app.get("/", (req, res) => {
  res.json({
    message: "Service is healthy. Current time: " + new Date(Date.now()),
  });
});
require("./routes/auth.route")(app);
require("./routes/user.route")(app);
require("./routes/account.route")(app)
require('./routes/profile.route')(app)

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
