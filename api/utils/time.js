/**
 * Module: Time
 * Info: Utility for time related functions
 **/

/**
 * @method sleep
 * Async method for sleep for ms time to process further
 * @param {milliseconds} ms
 **/
const sleep = (ms = 2000) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = {
  sleep,
};
