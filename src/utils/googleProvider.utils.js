// Import Module dependencies.
const axios = require('axios');
const config = require('../config/config');
const googleProvider = (() => {
  const clientId =config.social.google.clientId;
  const clientSecret = config.social.google.clientSecret;
  const redirectUri = config.social.google.googleCallback;
  const tokenEndpoint = "https://oauth2.googleapis.com/token";
  const userInfoEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";
  const authorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
  const scopes = ["openid", "profile", "email"];

  const generateAuthUrl = () => {
    const scope = encodeURIComponent(scopes.join(" "));
    return `${authorizationEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&access_type=offline`;
  };

  const getAccessToken = async (code) => {
    const body = {
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };
    try {
      const response = await axios.post(tokenEndpoint, body);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getUserInfo = async (accessToken) => {
    try {
      const response = await axios.get(userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      throw  error;
    }
  };

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return {
        email: response.data.email,
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        picture: response.data.picture,
        name: response.data.name,
      };
    } catch (error) {
      throw new Error("Invalid Google token");
    }
  };

  return {
    generateAuthUrl,
    getAccessToken,
    getUserInfo,
    verifyToken,
  };
})();

module.exports = googleProvider;