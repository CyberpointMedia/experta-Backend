// controllers/ticket.controller.js
const ticketService = require("../services/ticket.service");
const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");
const zendeskClient = require("../config/zendesk");

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

    const zendeskTicket = {
      ticket: {
        subject: subject,
        description: description,
        requester: {
          id: userId
        }
      }
    };
    zendeskClient.tickets.create(zendeskTicket, (err, req, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(
          createResponse.error({
            errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
            errorMessage: err.message,
          })
        );
      }
      res.json(savedTicket);
    });
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

    const zendeskTicketsPromises = tickets.map(ticket => {
      return new Promise((resolve, reject) => {
        zendeskClient.tickets.show(ticket.zendeskId, (err, req, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        });
      });
    });

    const zendeskTickets = await Promise.all(zendeskTicketsPromises);

    res.json(zendeskTickets);
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
