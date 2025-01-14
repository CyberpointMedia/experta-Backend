// allUsersRoutes.js
const express = require('express');
const allUsersRouters = express.Router();
const { createUser, getAllUsers, getUserById, updateUser, deleteUser , blockStatus } = require('../controllers/allUser.controller'); 
const { authMiddleware } = require("../middlewares/auth.middleware");
const {hasRole}=require("../middlewares/role.middleware")
const routes = require("../constants/route.url");
const { paginate } = require('../middlewares/paginate.middleware');

//route to create the user
allUsersRouters.post('/create-user',authMiddleware, hasRole('admin'), createUser);

// Route to get all users
allUsersRouters.get('/all-users',authMiddleware, hasRole('admin'), paginate('User') , getAllUsers);

// Route to get a user by ID
allUsersRouters.get('/user/:id',authMiddleware ,hasRole('admin'), getUserById);

// Route to update a user's details
allUsersRouters.put('/user/:id',authMiddleware , hasRole('admin'),  updateUser);

// Route to delete a user
allUsersRouters.delete('/delete-user/:id',authMiddleware , hasRole('admin'), deleteUser);
allUsersRouters.delete('/delete-user',authMiddleware , hasRole('admin'), deleteUser);

allUsersRouters.put('/block-user/:id',authMiddleware , hasRole('admin'),  blockStatus);
allUsersRouters.put('/block-user',authMiddleware , hasRole('admin'),  blockStatus);

module.exports = (app) => {
    app.use(routes.API, allUsersRouters); 
};
