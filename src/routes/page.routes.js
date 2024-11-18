const express = require('express');
const pageRouter = express.Router();
const {
  createPage,
  getAllPages,
  getPageBySlug,
  updatePage,
  deletePage
} = require('../controllers/page.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');  // Optional, for admin routes
const { hasRole } = require('../middlewares/role.middleware');  // Optional, for admin routes
const routes = require('../constants/route.url');

// Route to create a new page
pageRouter.post('/create-page',authMiddleware, hasRole('admin'), createPage);

// Route to get all pages (admin or general users)
pageRouter.get('/pages', authMiddleware, hasRole('admin'), getAllPages);

// Route to get a page by its slug
pageRouter.get('/page/:slug',authMiddleware, hasRole('admin'), getPageBySlug);

// Route to update a page
pageRouter.put('/page/:pageId', authMiddleware, hasRole('admin'), updatePage);

// Route to delete a page
pageRouter.delete('/page/:pageId',authMiddleware, hasRole('admin'), deletePage);

module.exports = (app) => {
  app.use(routes.API, pageRouter);  // Prefix all routes with `/api`
};
