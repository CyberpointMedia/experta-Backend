class AuthenticationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "AuthenticationError";
        this.errorCode = code;
    }
}
class ValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ValidationError";
    this.errorCode = code;
  }
}

module.exports = { AuthenticationError, ValidationError };