// allUsersRoutes.js
const express = require('express');
const allUsersRouters = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/allUser.controller'); 
const { authMiddleware } = require("../middlewares/auth.middleware");
const {hasRole}=require("../middlewares/role.middleware")
const routes = require("../constants/route.url");
const { paginate } = require('../middlewares/paginate.middleware');

// Route to get all users
allUsersRouters.get('/all-users',authMiddleware, hasRole('admin'), paginate('User') , getAllUsers);

// Route to get a user by ID
allUsersRouters.get('/user/:id',authMiddleware ,hasRole('admin'), getUserById);

// Route to update a user's details
allUsersRouters.put('/user/:id',authMiddleware , hasRole('admin'),  updateUser);

// Route to delete a user
allUsersRouters.delete('/user/:id',authMiddleware , hasRole('admin'), deleteUser);

// Export the routes as middleware to be used in app.js
module.exports = (app) => {
    app.use(routes.API, allUsersRouters);  // Prefix your routes with `/api`
};
