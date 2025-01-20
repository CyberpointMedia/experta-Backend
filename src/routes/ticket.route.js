// routes/ticket.routes.js
const {authMiddleware} = require("../middlewares/auth.middleware");
const routes = require("../constants/route.url");
const ticketController = require("../controllers/ticket.controller");
const paginationMiddleware = require("../middlewares/paginate.middleware");
const multer = require("multer");
const upload = multer();

module.exports = (app) => {
  const router = require("express").Router();

  router.post("/raise-ticket", authMiddleware,upload.array('files'), ticketController.createTicket);
  router.get("/tickets", authMiddleware,paginationMiddleware.paginate(), ticketController.getTickets);
  router.get('/tickets/:ticketId/comments', ticketController.getTicket);
  router.put("/tickets/:ticketId/comments", ticketController.addCommentToTicket);
  router.post("/zendesk-webhook", ticketController.handleZendeskWebhook);

  app.use(routes.API, router);
};


