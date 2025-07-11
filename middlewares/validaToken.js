import jwt from "jsonwebtoken";
import { TOKEN_SECRETO } from '../config.js';

// middlewares/validaToken.js
export const authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "no autorizado" });
  }
  
  const token = authHeader.substring(7);
  
  if (!token) return res.status(401).json({ message: "no autorizado" });
  
  jwt.verify(token, TOKEN_SECRETO, (err, user) => {
    if (err) {
      console.error('Error verificando token:', err.message);
      return res.status(401).json({ message: "token invalido" }); // Cambiar a 401
    }
    
    req.user = user;
    next();
  });
};