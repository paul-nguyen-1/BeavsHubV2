import { Injectable } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';

/*
Refer to this doc 
https://developers.google.com/sheets/api/reference/rest
*/

@Injectable()
export class CourseService {
  private sheets: sheets_v4.Sheets;

  constructor() {
    this.init();
  }

  private async init() {
    const config = {
      type: process.env.SHEETS_CREDENTIALS_TYPE,
      project_id: process.env.SHEETS_CREDENTIALS_PROJECT_ID,
      private_key_id: process.env.SHEETS_CREDENTIALS_PRIVATE_KEY_ID,
      private_key: process.env.SHEETS_CREDENTIALS_PRIVATE_KEY.replace(
        /\\n/g,
        '\n',
      ),
      client_email: process.env.SHEETS_CREDENTIALS_CLIENT_EMAIL,
      client_id: process.env.SHEETS_CREDENTIALS_CLIENT_ID,
      auth_uri: process.env.SHEETS_CREDENTIALS_AUTH_URI,
      token_uri: process.env.SHEETS_CREDENTIALS_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.SHEETS_CREDENTIALS_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.SHEETS_CREDENTIALS_CLIENT_CERT_URL,
      universe_domain: process.env.SHEETS_CREDENTIALS_UNIVERSE_DOMAIN,
    };

    const auth = new GoogleAuth({
      credentials: config,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const authClient = (await auth.getClient()) as OAuth2Client;

    this.sheets = google.sheets({
      version: 'v4',
      auth: authClient,
    });
  }

  async getAllValues(
    spreadsheetId: string,
    sheetName: string,
  ): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: sheetName,
      });
      return response.data.values || [];
    } catch (error) {
      console.error(
        `Error fetching data for spreadsheetId: ${spreadsheetId}, sheetName: ${sheetName}`,
      );
      console.error(`Error details: ${error.response?.data || error.message}`);
      throw new Error('Failed to fetch all course data.');
    }
  }
}
