const express = require('express');
const pageRouter = express.Router();
const {
  createPage,
  getAllPages,
  getPageBySlug,
  updatePage,
  deletePage
} = require('../controllers/page.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');  
const { hasRole } = require('../middlewares/role.middleware');
const { paginate } = require('../middlewares/paginate.middleware');
const routes = require('../constants/route.url');

// Route to create a new page
pageRouter.post('/create-page',authMiddleware, hasRole('admin'), createPage);

// Route to get all pages (admin or general users)
pageRouter.get('/pages', authMiddleware, hasRole('admin'),paginate('Page'), getAllPages);

// Route to get a page by its slug
pageRouter.get('/page/:slug', getPageBySlug);

// Route to update a page
pageRouter.put('/page/:pageId', authMiddleware, hasRole('admin'), updatePage);

// Route to delete a page
pageRouter.delete('/page/:pageId',authMiddleware, hasRole('admin'), deletePage);

module.exports = (app) => {
  app.use(routes.API, pageRouter);
};
