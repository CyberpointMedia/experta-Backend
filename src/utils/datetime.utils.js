const moment = require('moment-timezone');

module.exports.convertToIST = function (timestamp) {
  return moment(timestamp)
    .utcOffset('+05:30')
    .format('YYYY-MM-DDTHH:mm:ss.SSSZ');
};
