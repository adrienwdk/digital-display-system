// client/src/config/msalConfig.js
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID || "VOTRE_CLIENT_ID",
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID || "VOTRE_TENANT_ID"}`,
    redirectUri: 'http://localhost:3000/auth/callback',
    postLogoutRedirectUri: 'http://localhost:3000'
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"]
};

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};