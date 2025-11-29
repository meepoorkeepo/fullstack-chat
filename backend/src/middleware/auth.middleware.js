import jwt from 'jsonwebtoken';
import User from '../models/users.models.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            res.status(400).json({message:'error no access to token'})
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        if (!decoded) {
            res.status(400).json({message:'the token is invalid'})
        }
        const user = await User.findById(decoded.userId).select('-password')
        if (!user) {
            res.status(404).json({message:'user not found'})
        }

        req.user = user

        next()
    } catch (error) {
        console.log('error in route protect middleware', error.message);
            res.status(500).json({message:'Internalserver error'})
        
        
    }
}