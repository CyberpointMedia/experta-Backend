const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
dotenv.config();
const config = require("./config/config");
const connectDB = require("./config/db");
const {configureSocketEvents} = require("./config/socket");
const {notFoundHandler,appErrorHandler} =require("./middlewares/error.middleware")

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
require("./routes/account.route")(app);
require("./routes/profile.route")(app);
require("./routes/master.route")(app);
require("./routes/message.routes")(app);
require("./routes/chat.route")(app);
require("./routes/file.route")(app);
require("./routes/ticket.route")(app);
require("./routes/booking.routes")(app);
require("./routes/kyc.routes")(app);
require("./routes/notification.route")(app);
require("./routes/rating.route")(app);
require("./routes/role.route")(app);
require("./routes/allUser.routes")(app);
require("./routes/userDetails.routes")(app);
require("./routes/page.routes")(app);
require("./routes/dashboardHome.routes")(app);
require("./routes/service.route")(app);
const port = process.env.PORT || 5000;

// Error middlewares
app.all("*", notFoundHandler);
app.use(appErrorHandler);
const server = app.listen(port, () =>
  console.log(`📍 Server started at port ${port}`)
);

configureSocketEvents(server);
