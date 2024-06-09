class AuthenticationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "AuthenticationError";
        this.errorCode = code;
    }
}

module.exports = { AuthenticationError }