import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization || req.headers.Token;
  let token = null;

  if (authorizationHeader) {
    if (authorizationHeader.startsWith("Bearer ")) {
      token = authorizationHeader.split(" ")[1];
    } else {
      token = authorizationHeader;
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token is missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid token." });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Access denied, admin only" });
  }
};
