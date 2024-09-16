const bcrypt = require("bcrypt")
const salt_rounds = 10


module.exports.encrypt = function(text) {
    return bcrypt.genSalt(salt_rounds)
    .then(salt => {
      return bcrypt.hash(text, salt);
    })
    .catch(err => console.error(err.message))
}

module.exports.compare = function (hash, password){
    return bcrypt.compare(password, hash)
    .then(res => {
      return res;
    })
    .catch(err => console.error(err.message)) 
}