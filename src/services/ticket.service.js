// services/ticket.service.js
const Ticket = require("../models/ticket.model");
const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");

exports.createTicket = async (ticketData) => {
  try {
    const ticket = new Ticket(ticketData);
    const savedTicket = await ticket.save();
    return createResponse.success(savedTicket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.getTicketsByUserId = async (userId) => {
  try {
    const tickets = await Ticket.find({ userId }).sort({ createdAt: -1 });
    return createResponse.success(tickets);
  } catch (error) {
    console.error("Error getting tickets:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};
