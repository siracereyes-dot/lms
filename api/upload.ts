
/**
 * THIS IS A REFERENCE FILE FOR THE NEXT.JS API ROUTE (/api/upload).
 * It uses the googleapis library to handle secure uploads from a server environment.
 */

/*
import { google } from 'googleapis';
import stream from 'stream';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { fileName, fileContent, contentType, userName, activityName } = req.body;
    
    // Auth with Google Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // CRITICAL REQUIREMENT: Rename every uploaded file to: loggedUserName_activityName.extension
    const extension = fileName.split('.').pop();
    const newFileName = `${userName}_${activityName}.${extension}`;

    const bufferStream = new stream.PassThrough();
    bufferStream.end(Buffer.from(fileContent, 'base64'));

    const response = await drive.files.create({
      requestBody: {
        name: newFileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: contentType,
        body: bufferStream,
      },
      fields: 'id, webViewLink',
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
*/
