const jwt = require("jsonwebtoken");
const JWT_SECRET = "w456789ol,mnhytrsxcvt#$rfvZx789&(&C5@#$RDG124gcjpoi5";

const AuthCheck = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (token) {
      const decoded = await jwt.verify(token, JWT_SECRET);
      req.body.userid = decoded.userid;
      req.body.role = decoded.role;
      next();
    } else {
      // in the case of token not found
      return res.status(400).json({
        errors: true,
        message: "token not found",
      });
    }
  } catch (error) {
    return res.status(400).json({
      errors: true,
      message: "Authentication failed",
    });
  }
};

module.exports = AuthCheck;
