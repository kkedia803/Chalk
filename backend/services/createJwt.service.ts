import jwt from "jsonwebtoken";

import { UserData } from "../types";

export const createJwt = async (user: UserData) => {
  const jwt_secret = process.env.JWT_SECRET_KEY ?? "";

  try {
    const token = jwt.sign(
      {
        data: user.id,
      },
      jwt_secret,
      {
        expiresIn: "24h",
      },
    );

    return token;
  } catch (err) {
    console.log(err);
  }
};
