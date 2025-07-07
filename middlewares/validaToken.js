import jwt from "jsonwebtoken";
import { TOKEN_SECRETO } from '../config.js';

export const authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "no autorizado" });
  }
  
  const token = authHeader.substring(7); // Quitar "Bearer " del inicio
  
  if (!token) return res.status(401).json({ message: "no autorizado" });
  
  jwt.verify(token, TOKEN_SECRETO, (err, user) => {
    if (err) return res.status(403).json({ message: "token invalido" });
    
    req.user = user;
    next();
  });
};