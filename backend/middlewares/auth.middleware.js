import jwt from 'jsonwebtoken';

import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';
import { TokenBlacklist, User, UserRole } from '../models/index.js';
import { JWT_EXPIRES_IN, JWT_SECRET_KEY } from '../config/config.js';
import { PermissionResponseSchema } from '../schemas/user-role.schema.js';

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

        // check the current account user
        const user = await User.findByPk(decoded.id);

        if(!user || !user.status){
            throw new AppException(
                "Your account is unavailable or disabled",
                HTTP_STATUS.HTTP_401_UNAUTHORIZED
            );
        }

        const user_role = await UserRole.findByPk(user.user_role_id);

        if(!user_role || !user_role.status){
            throw new AppException(
                "Your User Role is unavailable or disabled",
                HTTP_STATUS.HTTP_401_UNAUTHORIZED
            );
        }

        // fetch user role permissions
        const user_role_permissions = PermissionResponseSchema.parse(user_role.permissions);
        // fetch user individual permissions
        const individual_permissions = PermissionResponseSchema.parse(user.individual_permissions);

        // combine both the permissions
        const effective_permissions = [
            ...new Set([
                ...user_role_permissions,
                ...individual_permissions,
            ]),
        ];


        // store authenticated user
        req.user = user;
        req.auth = {
            ...decoded,
            role: user_role.slug,
            user_role_permissions,
            individual_permissions,
            permissions: effective_permissions
        }
        // store authenticated jwt token
        req.token = token;

        next();

    } catch (error) {

        // console.log('JWT ERROR:', error.name, error.message);
        if(
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError ||
            error instanceof jwt.NotBeforeError
        ){
            return next(
                new AppException(
                    'Invalid or expired authentication token.',
                    HTTP_STATUS.HTTP_401_UNAUTHORIZED
                )
            );
        }

        return next(error);

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