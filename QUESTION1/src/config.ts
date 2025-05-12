import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  testServerUrl: process.env.TEST_SERVER_URL || 'http://20.244.56.144/evaluation-service',
  clientId: process.env.CLIENT_ID || '',
  clientSecret: process.env.CLIENT_SECRET || '',
  accessCode: process.env.ACCESS_CODE || '',
  email: process.env.EMAIL || '',
  name: process.env.NAME || '',
  rollNo: process.env.ROLL_NO || '',
};