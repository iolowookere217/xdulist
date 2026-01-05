import { Request, Response, NextFunction } from "express";

export const requirePremium = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as any;
  if (!user || user.tier !== "premium") {
    return res
      .status(403)
      .json({ success: false, message: "Premium subscription required" });
  }
  next();
};
