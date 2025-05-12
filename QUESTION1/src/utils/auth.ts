import axios from 'axios';
import { config } from '../config';

interface AuthResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

export const getAuthToken = async (): Promise<string> => {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post<AuthResponse>(
      `${config.testServerUrl}/auth`,
      {
        email: config.email,
        name: config.name,
        rollNo: config.rollNo,
        accessCode: config.accessCode,
        clientID: config.clientId,
        clientSecret: config.clientSecret,
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;
    return accessToken;
  } catch (error) {
    throw new Error('Failed to authenticate with test server');
  }
};