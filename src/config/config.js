const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

module.exports = {
  frontend_url: process.env.FRONTEND_URL,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
};
