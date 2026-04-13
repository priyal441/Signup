const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const sessionId = req.headers['x-session-id']; // ← sessionStorage se aayega

  if (!token) {
    return res.status(401).json({ message: 'Token nahi hai!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ sessionId bhi database se verify karo
    if (sessionId) {
      const session = await prisma.sessions.findFirst({
        where: {
          session_id: sessionId,
          user_id: decoded.id,
          expires_at: { gt: new Date() } // expired toh nahi?
        }
      });

      if (!session) {
        return res.status(401).json({ message: 'Session expired!' });
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid hai!' });
  }
};

module.exports = verifyToken;
// const jwt = require('jsonwebtoken');
// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ message: 'Token nahi hai!' });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Token invalid hai!' });
//   }
// };
// module.exports = verifyToken;