import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

type JwtPayload = {
  data?: string;
};

const getTokenFromCookie = (cookieHeader?: string) => {
  if (!cookieHeader) return undefined;

  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("token="))
    ?.split("=")[1];
};

export const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;
  const token = bearerToken ?? getTokenFromCookie(req.header("cookie"));

  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(
      decodeURIComponent(token),
      process.env.JWT_SECRET_KEY ?? "",
    ) as JwtPayload;

    if (!decoded.data) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    req.userId = decoded.data;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
