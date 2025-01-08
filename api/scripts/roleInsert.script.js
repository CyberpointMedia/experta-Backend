const dotenv = require('dotenv'); // Load environment variables from .env file
const inquirer = require('inquirer'); // Library for interactive command line prompts
const mongoose = require('mongoose'); // MongoDB object modeling tool
const { Role } = require('../models/role.model.js'); // Import Role model
const { User } = require('../models/user.model.js'); // Import User model
const { connectDatabase, disconnectDatabase } = require('../bootstrap/database.js'); // Import database connection functions

dotenv.config(); // Load environment variables

const MONGODB_URI = process.env.MONGODB_URI; // MongoDB URI from environment variables
const MONGODB_NAME = process.env.MONGODB_NAME; // MongoDB database name from environment variables

(async function () {
    try {
        await connectDatabase(MONGODB_URI, MONGODB_NAME); // Connect to the database
        console.log('Successfully connected to MongoDB.');

        console.log('User model loaded:', User); // Check if User model is correctly imported

        const roles = await Role.find().select('name'); // Fetch available roles
        const roleChoices = roles.map(role => role.name); // Map roles to their names
        const role = roleChoices[0]; // Select the first role

        const mainUser = await User.findOne({ roles: "SuperAdmin" }); // Check if SuperAdmin already exists
        if (mainUser) {
            console.log("A SuperAdmin user already exists in the system.");
            process.exit(1); // Exit if SuperAdmin exists
        }

        // Define questions for user input
        const questions = [
            {
                type: 'input',
                name: 'first_name',
                message: 'Please enter the first name of the user:',
                validate: function (value) {
                    if (value) {
                        return true;
                    }
                    return 'First name is required.';
                },
            },
            {
                type: 'input',
                name: 'last_name',
                message: 'Please enter the last name of the user:',
                validate: function (value) {
                    if (value) {
                        return true;
                    }
                    return 'Last name is required.';
                },
            },
            {
                type: 'input',
                name: 'username',
                message: 'Please enter the username:',
                validate: function (value) {
                    if (value) {
                        return true;
                    }
                    return 'Username is required.';
                }
            },
            {
                type: 'input',
                name: 'email',
                message: 'Please enter the email address of the user:',
                validate: function (value) {
                    const pass = value.match(
                        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i
                    );
                    if (pass) {
                        return true;
                    }
                    return 'A valid email address is required.';
                },
            },
            {
                type: 'input',
                name: 'phoneNo',
                message: 'Please enter the 10-digit phone number of the user:',
                validate: function (value) {
                    const pass = value.match(/^\d{10}$/);
                    if (pass) {
                        return true;
                    }
                    return 'A valid 10-digit phone number is required.';
                },
            },
        ];

        const answers = await inquirer.prompt(questions); // Prompt user for input

        const { first_name, last_name, username, email, phoneNo } = answers; // Destructure answers

        // Display entered details for confirmation
        console.log('\nPlease review the entered details:');
        console.log(`First Name: ${first_name}`);
        console.log(`Last Name: ${last_name}`);
        console.log(`Username: ${username}`);
        console.log(`Email: ${email}`);
        console.log(`Phone Number: ${phoneNo}`);
        console.log(`Role: ${role}`);

        const confirm = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'proceed',
                message: 'Do you want to proceed with these details?',
                default: true,
            },
        ]);

        if (!confirm.proceed) {
            console.log('Operation cancelled. Please run the script again to enter the details.(yes/no)');
            process.exit(1); // Exit if user does not confirm
        }

        let user = await User.findOne({ email, phone: phoneNo }); // Check if user already exists

        if (!user) {
            console.log('User not found. Creating a new user...');
            user = new User({ email, phone: phoneNo, roles: role }); // Create new user
            await user.save(); // Save new user to database
            console.log('New user created successfully.');
        }
    } catch (error) {
        console.error('An error occurred:', error.message); // Log any errors
    } finally {
        await disconnectDatabase(); // Disconnect from the database
        console.log('Database connection closed.');
    }
})();