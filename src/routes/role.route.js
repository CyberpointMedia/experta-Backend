const roleController = require("../controllers/role.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { hasRole } = require("../middlewares/role.middleware");
const routes = require("../constants/route.url");

module.exports = (app) => {
  const router = require("express").Router();

  router.post(
    "/roles",
    [authMiddleware, hasRole('admin')],
    roleController.createRole
  );

  router.post(
    "/assign-role",
    [authMiddleware, hasRole('admin')],
    roleController.assignRole
  );

  router.get(
    "/roles",
    [authMiddleware, hasRole('admin')],
    roleController.getRoles
  );

  app.use(routes.API, router);
};