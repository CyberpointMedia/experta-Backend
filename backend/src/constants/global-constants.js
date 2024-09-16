module.exports = Object.freeze({
  APPLICATION_PROPERTY_FILE_NAME: "application.properties",
  SUCCESS: "success",
  FAILED: "failed",
  VALIDATION_FAILED: "validation_failed",
  AUTHENTICATION_FAILED: "authentication_failed",
  TOKEN_ISSUE_CODE: 450,

  UNAUTHORIZED_ACCESS_CODE: 451,
  INVALID_USER_CODE: 453,
  REVISION_QUESTION_ECT: 30,
  REVISION_SLIDE_ECT: 15,
  PASSWORD_REGEX: new RegExp(/^(?=.*\d).{8,}$/),
  PASSWORD_POLICY: "Minimum 8 characters, Minimum 1 number.",
  USER_ALREADY_EXISTS: "user_already_exists",
  INVALID_INPUT_CODE:500,
});
