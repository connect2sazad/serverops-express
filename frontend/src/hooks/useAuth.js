import { useContext } from "react";

import { AuthContext } from '../auth/AuthContext';
import AppException from '../exceptions/exception';
import HTTP_STATUS from "../exceptions/status_codes";

export function useAuth() {

    const context = useContext(AuthContext);

    if(!context){
        throw new AppException(
            "useAuth must be used inside AuthProvider",
            HTTP_STATUS.HTTP_400_BAD_REQUEST
        );
    }
    
    return context;
}