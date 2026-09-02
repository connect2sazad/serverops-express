import AppException from "../exceptions/exception.js"
import HTTP_STATUS from "../exceptions/status_codes.js";

export const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        try {            

            if (!req.user) {
                throw new AppException(
                    "Authentication required!",
                    HTTP_STATUS.HTTP_401_UNAUTHORIZED
                );
            }

            if(!allowedRoles.includes(req.auth.role)) {
                throw new AppException(
                    'Your role is not allowed to perform this action.',
                    HTTP_STATUS.HTTP_403_FORBIDDEN
                );
            }

            next();


        } catch (e) {

            next(e);

        }
    }
}

export const authorizePermissions = (...requiredPermissions) => {
    return (req, res, next) => {

        try {

            if (!req.user) {
                throw new AppException(
                    "Authentication required!",
                    HTTP_STATUS.HTTP_401_UNAUTHORIZED
                );
            }

            const permissions = req.auth.permissions ?? [];

            const allowed = permissions.includes('*')
                || requiredPermissions.every(
                    permission => permissions.includes(permission)
                );
            
            if(!allowed){
                throw new AppException(
                    'You do not have enough permissions to perform this action.',
                    HTTP_STATUS.HTTP_403_FORBIDDEN
                );
            }

            next();

        } catch (e) {

            next(e);

        }

    }
}