import { TOKEN_SECRETO } from "../config.js";
import jwt from 'jsonwebtoken'

export function creaToken(payload){
   return new Promise ((resolve,reject) => {
    jwt.sign(
        payload,
       TOKEN_SECRETO,
      {
        expiresIn: "1d",
      },
      (err,token)=>{
        if (err)reject(err);
        resolve(token);
      }
    )
   })
}