// services/ticket.service.js
const Ticket = require("../models/ticket.model");
const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");
const zendesk = require("node-zendesk");
const axios = require("axios");
const config = require("../config/config");

const zendeskClient = zendesk.createClient({
  username: config.zendeskClient.username,
  token: config.zendeskClient.token,
  remoteUri: config.zendeskClient.remoteUri,
  zendeskEmail: config.zendeskClient.zendeskEmail
});

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

exports.getTicketsByUserId = async (userId, status) => {
  try {
    const query = { userId: userId };
    if (status) {
      query['zendeskResponse.status'] = status;
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    console.log("saved in database", tickets);
    return createResponse.success(tickets);
  } catch (error) {
    console.error("Error getting tickets:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.updateTicket = async (id, updateData) => {
  try {
    const ticket = await Ticket.findOneAndUpdate(
      {_id:id},
      {$set:updateData},
      {new:true}
    );
    console.log("update ticket in database",ticket);
    if(!ticket){
      return createResponse.error({
        errorCode:errorMessageConstants.NOT_FPUND_ERROR_CODE,
        errorMessage:"Ticket not found"
      });
    }
      return createResponse.success({
        status:"success data update in database",
        ticket});
    }catch(error){
      console.error("Error updating ticket:", error);
      return createResponse.error({
        errorCode:errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage:error.message
      });
    }
};

exports.getTicketByZendeskId = async (zendeskId) => {
  try {
    const ticket = await Ticket.findOne({'zendeskResponse.id':zendeskId,isDeleted:false});
    if(!ticket){
      return null;
    }
    return ticket;
  }catch(error){
    console.error("Error getting ticket by zendesk id:", error);
    return null;
  }
};

exports.uploadFileToZendesk = async(file,auth,remoteUri)=>{
  try{
    const response = await axios.post(
      `${remoteUri}/uploads.json?filename=${file.originalname}`,
      file.buffer,
      {
        headers:{
          Authorization:`Basic ${auth}`,
          'Content-Type':file.mimetype,
        },
      }
    );
    return response.data.upload.token;
  }catch(error){
    console.error("Error uplaoding file to zendesk :",error.response?.data || error.message);
    throw new Error("Error uploading file to zendesk");
  }
};