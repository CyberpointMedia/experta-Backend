const express = require("express");
const { getallinvoices, downloadInvoice } = require("../controllers/zohobooks.controller");
const routes = require("../constants/route.url");
const Router = express.Router();

Router.get("/test", (req, res) => {
  res.send("Zoho Books API is working");
});
Router.get("/invoices", getallinvoices);
Router.get("/downloadinvoice/:invoiceId", downloadInvoice);

module.exports = (app) => {
  app.use(routes.API, Router); 
};