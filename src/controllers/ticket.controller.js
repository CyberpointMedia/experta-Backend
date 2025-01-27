// controllers/ticket.controller.js
const ticketService = require("../services/ticket.service");
const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");
const config = require('../config/config');
const zendesk = require('node-zendesk');
const Ticket = require('../models/ticket.model');
const axios = require('axios');
const fileUploadService = require('../services/fileUpload.service');

const zendeskClient = zendesk.createClient({
  username: config.zendeskClient.username,
  token: config.zendeskClient.token,
  remoteUri: config.zendeskClient.remoteUri,
  zendeskEmail: config.zendeskClient.zendeskEmail
});

exports.createTicket = async (req, res) => {
  try {
    console.log('Request:', req.body);
    let user;
    if (req.body.user) {
      user = JSON.parse(req.body.user);
    } else {
      return res.status(400).json(createResponse.invalid("User information is required"));
    }

    const userId = user._id;
    
    const { subject, description } = req.body;
    const files=req.files;
    console.log('Files:', files);

    if (!subject || !description) {
      return res
        .status(400)
        .json(createResponse.invalid("Subject and description are required"));
    }

    const authString = `${config.zendeskClient.zendeskEmail}/token:${config.zendeskClient.token}`;
    const auth = Buffer.from(authString).toString('base64');
    console.log('Zendesk Ticket:', zendeskClient);
    console.log('Auth String:', authString);
    
    let attachments = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => 
         ticketService.uploadFileToZendesk(file,auth,config.zendeskClient.remoteUri)
      );
      attachments = await Promise.all(uploadPromises);
    }
    console.log('Attachments:', attachments);
    // Step 1: Save ticket data in the database
    const ticketData = {
      userId,
      subject,
      description,
      attachments,
    };

    const savedTicket = await ticketService.createTicket(ticketData);
    console.log("saved in database",savedTicket);
    // Step 2: Prepare Zendesk ticket data
    const zendeskTicket = {
      ticket: {
        subject: subject,
        priority: 'normal',
        comment: {
          body: description,
          uploads: attachments,
        },
        requester: {
          name: user.name,
          email: user.email,
        },
      },
    };
 
    // Step 3: Send ticket to Zendesk
    const zendeskResponse = await axios.post(
      `${config.zendeskClient.remoteUri}/tickets.json`,
      zendeskTicket,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );
    // Step 4: Update database with Zendesk ticket ID
    const zendeskData = zendeskResponse.data.ticket;
    const filteredResponse = {
      url: zendeskData.url,
      id: zendeskData.id,
      created_at: zendeskData.created_at,
      updated_at: zendeskData.updated_at,
      type: zendeskData.type,
      subject: zendeskData.subject,
      raw_subject: zendeskData.raw_subject,
      description: zendeskData.description,
      priority: zendeskData.priority,
      status: zendeskData.status,
    };
    await ticketService.updateTicket(savedTicket.data._id, { zendeskResponse: zendeskData });
    res.json(
      { 
        zendeskResponse: filteredResponse 
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
    const status = req.query.status;
    const { page, limit, skip } = req.pagination;

    const query = { userId: userId };
    if (status) {
      query['zendeskResponse.status'] = status;
    }

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTickets = await Ticket.countDocuments(query);

    const filteredTickets = tickets.map((ticket) => {
      const zendeskResponse = ticket.zendeskResponse || {};
      return {
        url: zendeskResponse.url,
        id: zendeskResponse.id,
        created_at: zendeskResponse.created_at,
        updated_at: zendeskResponse.updated_at,
        type: zendeskResponse.type,
        subject: zendeskResponse.subject,
        raw_subject: zendeskResponse.raw_subject,
        description: zendeskResponse.description,
        priority: zendeskResponse.priority,
        status: zendeskResponse.status,
      };
    });

    res.json(createResponse.success({
      tickets : filteredTickets,
      pagination: {
        total: totalTickets,
        page,
        limit,
        totalPages: Math.ceil(totalTickets / limit),
      },
    }));
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

exports.getTicket = async (req, res) => {
  try {
    const { ticketId } = req.params; // Ticket ID from params

    if (!ticketId) {
      return res.status(400).json(createResponse.invalid("Ticket ID is required"));
    }

    const authString = `${config.zendeskClient.zendeskEmail}/token:${config.zendeskClient.token}`;
    const auth = Buffer.from(authString).toString('base64');

    // Fetch all comments for the specific ticket from Zendesk
    const zendeskResponse = await axios.get(
      `${config.zendeskClient.remoteUri}/tickets/${ticketId}/comments.json`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const comments = zendeskResponse.data.comments;

    res.json(createResponse.success(comments));
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

exports.addCommentToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params; // Ticket ID from params
    const { commentBody, userEmail , userName } = req.body; // User email and comment body from request body

    // Validate input
    if (!ticketId || !commentBody || !userEmail || !userName) {
      return res.status(400).json({
        status: "failed",
        message: "Ticket ID, comment body, and user email are required",
      });
    }

    // Authorization for Zendesk API
    const authString = `${config.zendeskClient.zendeskEmail}/token:${config.zendeskClient.token}`;
    const auth = Buffer.from(authString).toString("base64");

    // Step 1: Retrieve the requester's Zendesk User ID
    const userResponse = await axios.get(
      `${config.zendeskClient.remoteUri}/users/search.json?query=${userEmail}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    const zendeskUser = userResponse.data.users.find(
      (user) => user.email === userEmail
    );

    if (!zendeskUser) {
      return res.status(404).json({
        status: "failed",
        message: "Requester not found in Zendesk",
      });
    }

    const authorId = zendeskUser.id; // Zendesk User ID of the requester
 // Step 2: Update the requester's name (if different)
 if (zendeskUser.name !== userName) {
  await axios.put(
    `${config.zendeskClient.remoteUri}/users/${authorId}.json`,
    {
      user: {
        name: userName, // Update the name to the one provided in the request
      },
    },
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    }
  );
}
    // Step 2: Add the comment to the ticket
    const payload = {
      ticket: {
        comment: {
          body: commentBody, // The comment content
          public: true, // The comment is public and visible to the company
          author_id: authorId, // Use the requester's Zendesk User ID
        },
      },
    };

    const response = await axios.put(
      `${config.zendeskClient.remoteUri}/tickets/${ticketId}.json`,
      payload,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Step 3: Respond with the updated ticket data
    res.status(200).json({
      status: "success",
      message: "Comment added successfully",
      data: response.data.ticket,
    });
  } catch (error) {
    console.error("Error adding comment to ticket:", error.response?.data || error.message);
    res.status(500).json({
      status: "failed",
      message: "Failed to add comment to the ticket",
      error: error.response?.data || error.message,
    });
  }
};


//webhook to handle zendesk responses 
exports.handleZendeskWebhook = async (req, res) => {
  try{
    const {id,comment}=req.body.ticket;
    const ticket = await ticketService.getTicketByZendeskId(id);

    if(!ticket){
      return res.send(404).json(createResponse.invalid("Ticket not found"));
    }
    const newComment={
      authorID:comment.author_id,
      body:comment.body,
      plainBody:comment.plain_body,
      public:comment.public,
      metadata:comment.metadata,
    }
    ticket.comments.push(newComment);
    await ticket.save();
    res.json(createResponse.success("Ticket updated successfully",ticket));
  }
  catch(error){
    console.error(error);
    res.status(500).json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    ); 
  }
};
