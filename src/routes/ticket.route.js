// routes/ticket.routes.js
const {authMiddleware} = require("../middlewares/auth.middleware");
const routes = require("../constants/route.url");
const ticketController = require("../controllers/ticket.controller");

module.exports = (app) => {
  const router = require("express").Router();

  router.post("/raise-ticket", authMiddleware, ticketController.createTicket);
  router.get("/tickets", authMiddleware, ticketController.getTickets);

  app.use(routes.API, router);
};


