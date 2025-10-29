import {google} from "googleapis";

/**
 * Configuração OAuth 2.0 para Google Calendar
 */
export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google Calendar credentials não configuradas. Verifique variáveis de ambiente."
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Gera URL de autorização para o admin
 */
export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();

  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events"
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline", // Para obter refresh token
    scope: scopes,
    prompt: "consent", // Força consentimento para receber refresh token
    approval_prompt: "force" // Força nova autorização (backward compatibility)
  });
}

/**
 * Troca código de autorização por tokens
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();

  const {tokens} = await oauth2Client.getToken(code);

  return tokens;
}

/**
 * Configura cliente OAuth com tokens salvos
 */
export function getAuthenticatedClient(tokens: {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}) {
  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date
  });

  return oauth2Client;
}
