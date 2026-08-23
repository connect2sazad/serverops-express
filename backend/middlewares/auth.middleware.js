import jwt from 'jsonwebtoken';

import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';
import TokenBlacklist from '../models/token-blacklist.model.js';

import { JWT_EXPIRES_IN, JWT_SECRET_KEY } from '../config/config.js';

export const authenticate = async (req, res, next) => {

    try{
        const authorization = req.headers.authorization;

        if(!authorization){
            throw new AppException(
                'Authorization token is required',
                HTTP_STATUS.HTTP_401_UNAUTHORIZED
            );
        }

        const [type, token] = authorization.split(' ');

        if(type !== 'Bearer' || !token){
            throw new AppException(
                'Invalid Authorization format.',
                HTTP_STATUS.HTTP_401_UNAUTHORIZED
            );
        }

        // verify jwt token
        const decoded = jwt.verify(
            token,
            JWT_SECRET_KEY
        );

        // check if the token is in blacklist table
        const blacklistedToken = await TokenBlacklist.findOne({
            where: {
                token,
            },
        });

        if(blacklistedToken){
            throw new AppException(
                'Authentication token has been revoked.',
                HTTP_STATUS.HTTP_401_UNAUTHORIZED
            );
        }

        // store authenticated user
        req.auth = decoded;

        // store authenticated jwt token
        req.token = token;

        next();

    } catch (error) {

        if(error instanceof AppException){
            return next(error);
        }

        return next(
            new AppException(
                'Invalid or expired authentication token.',
                HTTP_STATUS.HTTP_401_UNAUTHORIZED
            )
        );

    }

};

export const generate = (data) => {

    const token = jwt.sign(
        {
            id: data.id,
            userid: data.userid,
            email: data.email
        },
        JWT_SECRET_KEY,
        {
            expiresIn: JWT_EXPIRES_IN
        }
    );

    return {
        token: token,
        token_type: 'Bearer',
        expires_in: JWT_EXPIRES_IN
    };
    
}