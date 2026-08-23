import jwt from 'jsonwebtoken';

import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';

import { JWT_SECRET_KEY } from '../config/config.js';

export const authenticate = (req, res, next) => {

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

        const decoded = jwt.verify(
            token,
            JWT_SECRET_KEY
        );

        req.auth = decoded;

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