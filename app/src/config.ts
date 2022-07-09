export default {
    oidc: {
      clientId: import.meta.env.VITE_CLIENT_ID,
      issuer: import.meta.env.VITE_ISSUER_URI,
      redirectUri: window.location.origin + '/login/callback',
      scopes: ['openid', 'profile', 'email']
    }
  }
  