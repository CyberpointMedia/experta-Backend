require('dotenv').config(); // Load environment variables from .env file

const fs = require('fs'); // File system module
const path = require('path'); // Path module
const mongoose = require('mongoose'); // Mongoose for MongoDB
const { connectDatabase, disconnectDatabase } = require('../bootstrap/database'); // Database connection functions
const logger = require("../utils/logger"); // Logger utility

const migrationsDir = path.resolve(__dirname, '../database/migrations'); // Directory for migration files
const migrateCollection = 'migrate'; // Collection name for migration records

const MONGODB_URI = process.env.MONGODB_URI; // MongoDB URI from environment variables
const MONGODB_NAME = process.env.MONGODB_NAME; // MongoDB database name from environment variables

(async function () {
  const args = process.argv.slice(2); // Get command line arguments
  const command = args[0]; // First argument is the command

  if (!['create', 'up', 'down'].includes(command)) { // Validate command
    logger.info('Invalid command. Use "create <name>", "up", or "down".');
    process.exit(1);
  }
  
  const migrationName = args[1]; // Second argument is the migration name (for create command)

  try {
    await connectDatabase(MONGODB_URI, MONGODB_NAME); // Connect to the database
    const db = mongoose.connection.db; // Get the database instance

    if (!fs.existsSync(migrationsDir)) { // Check if migrations directory exists
      fs.mkdirSync(migrationsDir); // Create migrations directory if it doesn't exist
      logger.info(`Created migrations directory: ${migrationsDir}`);
    }

    if (command === 'create') { // Handle 'create' command
      if (!migrationName) { // Check if migration name is provided
        logger.info('Please provide a migration name.');
        process.exit(1);
      }

      const timestamp = new Date(); // Get current timestamp
      const formattedDate = timestamp.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/ /g, '-'); // Format date
      const formattedTimestamp = `${formattedDate}.${timestamp.getMilliseconds()}`; // Format timestamp
      logger.info(formattedTimestamp);
      const fileName = `${formattedTimestamp}_${migrationName}.js`; // Create migration file name
      const filePath = path.join(migrationsDir, fileName); // Create migration file path

      const template = `
        module.exports = {
          async up(db) {
            // Write migration code here
          },

          async down(db) {
            // Write rollback code here
          }
        };
      `; // Migration file template

      fs.writeFileSync(filePath, template.trim()); // Write migration file
      logger.info(`Created migration file: ${fileName}`);
    } else if (command === 'up') { // Handle 'up' command
      const collections = await db.listCollections().toArray(); // List all collections
      const migrateCollectionExists = collections.some(coll => coll.name === migrateCollection); // Check if migrate collection exists
      if (!migrateCollectionExists) {
        await db.createCollection(migrateCollection); // Create migrate collection if it doesn't exist
        logger.info(`Created migrate collection: ${migrateCollection}`);
      }

      const appliedMigrations = await db.collection(migrateCollection).find().toArray(); // Get applied migrations
      const appliedFileNames = appliedMigrations.map(m => m.fileName); // Get applied migration file names

      const migrationFiles = fs.readdirSync(migrationsDir).sort(); // Get all migration files
      for (const file of migrationFiles) {
        if (!appliedFileNames.includes(file)) { // Check if migration is not applied
          logger.info(`Running migration: ${file}`);
          const migration = require(path.join(migrationsDir, file)); // Require migration file
          await migration.up(db); // Run migration
          await db.collection(migrateCollection).insertOne({ fileName: file, appliedAt: new Date() }); // Record migration
          logger.info(`Migration applied: ${file}`);
        }
      }
    } else if (command === 'down') { // Handle 'down' command
      const appliedMigrations = await db.collection(migrateCollection).find().sort({ appliedAt: -1 }).toArray(); // Get applied migrations in reverse order

      if (appliedMigrations.length === 0) { // Check if there are no migrations to roll back
        logger.info('No migrations to roll back.');
        process.exit(0);
      }

      for (const migrationRecord of appliedMigrations) {
        const filePath = path.join(migrationsDir, migrationRecord.fileName); // Get migration file path
        if (!fs.existsSync(filePath)) { // Check if migration file exists
          logger.info(`Migration file not found: ${migrationRecord.fileName}`);
          process.exit(1);
        }

        logger.info(`Rolling back migration: ${migrationRecord.fileName}`);
        const migration = require(filePath); // Require migration file
        await migration.down(db); // Roll back migration
        await db.collection(migrateCollection).deleteOne({ _id: migrationRecord._id }); // Remove migration record
        logger.info(`Migration rolled back: ${migrationRecord.fileName}`);
      }
    }
  } catch (err) {
    logger.info('Error:', err.message); // Log error message
  } finally {
    await disconnectDatabase(); // Disconnect from the database
    logger.info("Database connection closed.");
  }
})();