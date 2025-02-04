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

    // Combine and sort all comments by creation time
    const sortedComments = comments
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) // Sort comments by created_at (ascending)
      .map((comment) => ({
        id: comment.id,
        author_id: comment.author_id,
        body: comment.body,
        created_at: comment.created_at,
        channel: comment.via.channel, // Include the channel (web/api)
        attachments: comment.attachments.map((attachment) => ({
          id: attachment.id,
          file_name: attachment.file_name,
          content_url: attachment.content_url,
          content_type: attachment.content_type,
          size: attachment.size,
          thumbnails: attachment.thumbnails || [],
        })),
      }));

    res.json(
      createResponse.success({
        comments: sortedComments,
      })
    );
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
    const { commentBody, userEmail, userName, ticketId } = req.body;
    const files = req.files; // Attachments from request

    if (!ticketId || !commentBody || !userEmail || !userName) {
      return res.status(400).json({
        status: "failed",
        message: "Ticket ID, comment body, user email, and user name are required",
      });
    }

    const authString = `${config.zendeskClient.zendeskEmail}/token:${config.zendeskClient.token}`;
    const auth = Buffer.from(authString).toString("base64");

    const userResponse = await axios.get(
      `${config.zendeskClient.remoteUri}/users/search.json?query=${userEmail}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    const zendeskUser = userResponse.data.users.find((user) => user.email === userEmail);
    if (!zendeskUser) {
      return res.status(404).json({
        status: "failed",
        message: "Requester not found in Zendesk",
      });
    }

    const authorId = zendeskUser.id;

    if (zendeskUser.name !== userName) {
      await axios.put(
        `${config.zendeskClient.remoteUri}/users/${authorId}.json`,
        {
          user: { name: userName },
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let attachments = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => 
        ticketService.uploadFileToZendesk(file, auth, config.zendeskClient.remoteUri)
      );
      attachments = await Promise.all(uploadPromises);
    }

    const payload = {
      ticket: {
        comment: {
          body: commentBody,
          public: true,
          author_id: authorId,
          uploads: attachments,
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

    res.status(200).json({
      status: "success",
      message: "Comment added successfully with attachments",
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
    console.log('Webhook received:', req.body);
    const zendeskTicket = req.body.ticket;
    if (!zendeskTicket) {
      return res.status(400).json({ message: 'Invalid payload' });
    }
    const updatedTicketData = {
      'zendeskResponse.url': zendeskTicket.url,
      'zendeskResponse.id': zendeskTicket.id,
      'zendeskResponse.created_at': zendeskTicket.created_at,
      'zendeskResponse.updated_at': zendeskTicket.updated_at,
      'zendeskResponse.type': zendeskTicket.type,
      'zendeskResponse.subject': zendeskTicket.subject,
      'zendeskResponse.raw_subject': zendeskTicket.raw_subject,
      'zendeskResponse.description': zendeskTicket.description,
      'zendeskResponse.priority': zendeskTicket.priority,
      'zendeskResponse.status': zendeskTicket.status,
    };

await Ticket.findOneAndUpdate(
      { 'zendeskResponse.id': zendeskTicket.id }, // Match based on Zendesk ticket ID
      { $set: updatedTicketData },
      { new: true }
    );
    
    console.log('Ticket updated in database:', updatedTicketData); 
    res.json(createResponse.success("Ticket updated successfully"));
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
