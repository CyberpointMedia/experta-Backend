const logger = require("../utils/logger");

const { generateSecret } = require("../utils/secureOps");

logger.info("Generating New Salt..");
const salt = generateSecret(); // Default length is 16 bytes

logger.info(salt);

return salt;
