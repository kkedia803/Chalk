import { Request, Response } from "express";
import { z } from "zod";

import { verifyGoogleToken } from "../services/verifyGoogleToken.service";
import { findOrCreateUser } from "../services/findOrCreateUser.service";
import { createJwt } from "../services/createJwt.service";

import { UserData } from "../types"

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
    
    res.status(200).json({token:userToken});
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
