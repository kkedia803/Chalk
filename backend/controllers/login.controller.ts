import { Request, Response } from "express";
import { eq } from "drizzle-orm";

import { db } from "../db";
import { Users } from "../db/schema";
import { verifyGoogleToken } from "../services/verifyGoogleToken.service";
import { findOrCreateUser } from "../services/findOrCreateUser.service";
import { createJwt } from "../services/createJwt.service";

export const loginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {googleToken} = req.body;

    const userData = await verifyGoogleToken(googleToken);

    if (!userData) {
      res.status(400).json({ message: "Invalid Google token" });
      return;
    }

    const user = await findOrCreateUser(userData);

    if(!user){
        res.status(400).json({message:"Error creating user"});
        return
    }

    const userToken = await createJwt(user);
    
    res.cookie("token", userToken, { httpOnly: true, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 });
    res.status(200).json({token:userToken});
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const meController = async (req: Request, res: Response): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const [userData] = await db
    .select()
    .from(Users)
    .where(eq(Users.id, req.userId))
    .limit(1);

  if (!userData) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({ userData });
};
