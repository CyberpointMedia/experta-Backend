// routes/dashboardHome.route.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');  
const { hasRole } = require('../middlewares/role.middleware');
const dashboardController = require('../controllers/dashboardHome.controller');
const { paginate } = require('../middlewares/paginate.middleware');
const routes = require('../constants/route.url');

// Define the route for the dashboard home (total users)
router.get('/total-users',authMiddleware, hasRole('admin'), dashboardController.getTotalUsers);

// Route to get the total number of verified users
router.get('/verified-users',authMiddleware, hasRole('admin'), dashboardController.getVerifiedUsers);

// Route to get the total number of non-verified users
router.get('/non-verified-users',authMiddleware, hasRole('admin'), dashboardController.getNonVerifiedUsers);

//Route to get all new users 
router.get('/new-users',authMiddleware, hasRole('admin'),paginate('User'), dashboardController.getNewUsers);

module.exports = (app) => {
    app.use(routes.API, router);  // Prefix all routes with `/api`
};