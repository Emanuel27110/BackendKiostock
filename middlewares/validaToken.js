import jwt from "jsonwebtoken";
import { TOKEN_SECRETO } from '../config.js';

export const authRequired= (req, res, next) =>{
    const token = req.cookies?.token; // Acceso a la cookie 'token'

    if(!token) return  res.status(401).json({message:"no autorizado"});
    jwt.verify(token, TOKEN_SECRETO, (err,user)=>{
        if (err) return res.status(403).json({message:"token invalido"})

        req.user=user 

        next();
    });


}