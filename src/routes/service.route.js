// routes/service.routes.js
const serviceController = require("../controllers/service.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { hasRole } = require("../middlewares/role.middleware");
const routes = require("../constants/route.url");

module.exports = (app) => {
  const router = require("express").Router();

  router.post(
    "/services",
    [authMiddleware, hasRole('admin')],
    serviceController.createService
  );

  router.get(
    "/services/level/:level",
    serviceController.getServicesByLevel
  );

  router.get(
    "/services/:id",
    serviceController.getServiceById
  );

  router.put(
    "/services/:id",
    [authMiddleware, hasRole('admin')],
    serviceController.updateService
  );

  router.delete(
    "/services/:id",
    [authMiddleware, hasRole('admin')],
    serviceController.deleteService
  );

  app.use(routes.API, router);
};