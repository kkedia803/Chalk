import { TokenPayload } from "google-auth-library";
import { db } from "../db";
import { Users } from "../db/schema";
import { eq } from "drizzle-orm";

export const findOrCreateUser = async (userData: TokenPayload) => {
  try {
    if (!userData.email) {
      throw new Error("Email not found in Google token");
    }
    const user = await db.query.Users.findFirst({
      where: eq(Users.google_id, userData.sub),
    });

    if(user){
        return user
    }

    const addUser = await db.insert(Users).values({
        id:crypto.randomUUID(),
        email:userData.email,
        name:userData.name ?? "",
        avatar_url: userData.picture ?? null,
        google_id: userData.sub
    }).returning()

    const u = addUser[0];
    
    return u;
  } catch (e) {
    console.log(e)
  }
};
