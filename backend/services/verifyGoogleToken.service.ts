import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();

export const verifyGoogleToken = async (googleToken: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const userData = ticket.getPayload();

    if (!userData) {
      throw new Error("Invalid Google token");
    }

    return userData;
  } catch (error) {
    console.log(error);
  }
};
