import HTTP_STATUS from "./status_codes.js";

export default class AppException extends Error{

    constructor(message, statusCode = HTTP_STATUS.HTTP_500_INTERNAL_SERVER_ERROR, custom){
        super(message);
        this.name = 'AppException';
        this.statusCode = statusCode.status_code;
        this.code = statusCode.code
        this.timestamp = new Date().toISOString()
         if (custom && Reflect.ownKeys(custom).length > 0) {
            Object.assign(this, custom);
        }

        Error.captureStackTrace(this, this.constructor);
    }

}