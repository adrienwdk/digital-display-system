// server/config/azureConfig.js - Version avec validation
require('dotenv').config();

const azureConfig = {
  clientId: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  tenantId: process.env.AZURE_TENANT_ID,
  redirectUri: 'http://localhost:3000/auth/callback',
  scopes: ['openid', 'profile', 'email', 'User.Read', 'Directory.Read.All'],
  authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`
};

// Debug pour vérifier la validité du client secret
console.log('🔧 Validation Azure Config:');
console.log('- Client ID:', azureConfig.clientId ? '✅ Défini' : '❌ Manquant');
console.log('- Client Secret:', azureConfig.clientSecret ? `✅ Défini (${azureConfig.clientSecret.length} caractères)` : '❌ Manquant');
console.log('- Tenant ID:', azureConfig.tenantId ? '✅ Défini' : '❌ Manquant');
console.log('- Authority:', azureConfig.authority);
console.log('- Redirect URI:', azureConfig.redirectUri);

// Vérifier que le client secret n'est pas expiré ou invalide
if (!azureConfig.clientSecret || azureConfig.clientSecret.length < 10) {
  console.error('❌ ATTENTION: Client Secret semble invalide ou manquant');
  console.error('   Vérifiez votre fichier .env et régénérez le secret si nécessaire');
}

module.exports = azureConfig;