// server/config/azureConfig.js
require('dotenv').config();

const azureConfig = {
  clientId: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  tenantId: process.env.AZURE_TENANT_ID,
  redirectUri: process.env.NODE_ENV === 'production' 
    ? 'https://votre-domaine.com/auth/callback'
    : 'http://localhost:3000/auth/callback',
  scopes: ['openid', 'profile', 'email', 'User.Read'],
  authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`
};

module.exports = azureConfig;