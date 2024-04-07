import jwt  from "jsonwebtoken";
import { config } from 'dotenv';

config();

export const checkRole= (roles, req, res, next)=> {
        
    const token = req.headers.authorization.split(' ')[1]; 
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN); 
    (roles.includes(decodedToken.role)) ? next() : res.status(403).json({error: 'access denieted'})
};