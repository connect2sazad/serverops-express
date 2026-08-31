import AppException from "../exceptions/exception.js"
import HTTP_STATUS from "../exceptions/status_codes.js";
import { UserRole } from "../models/index.js";

export const authorizeRoles = (...allowedRoles) => {

    return async (req, resizeBy, next) => {

        try {

            if(!req.user){
                throw new AppException(
                    "Authentication required!",
                    HTTP_STATUS.HTTP_401_UNAUTHORIZED
                );
            }

            const role = await UserRole.findByPk(req.user.user_role_id);

            if(!role || !role.status || !allowedRoles.includes(role.slug)){
                throw new AppException(
                    "You do not have permission to perform this action!",
                    HTTP_STATUS.HTTP_401_UNAUTHORIZED
                );
            }

            next();

        } catch(e) {

            next(e);

        }
    }
}