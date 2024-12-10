// controllers/ticket.controller.js
const ticketService = require("../services/ticket.service");
const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");

exports.createTicket = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { subject, description, fileUrl } = req.body;

    if (!subject || !description) {
      return res
        .status(400)
        .json(createResponse.invalid("Subject and description are required"));
    }

    const ticketData = {
      userId,
      subject,
      description,
      fileUrl,
    };

    const savedTicket = await ticketService.createTicket(ticketData);
    res.json(savedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.getTickets = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const tickets = await ticketService.getTicketsByUserId(userId);
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};
