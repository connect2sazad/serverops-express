import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';

const errorHandler = (error, req, res, next) => {

    if (res.headersSent) {
        return next(error);
    }

    const isAppError = error instanceof AppException;
    const isInvalidJson = error.type === 'entity.parse.failed';

    const statusCode = isInvalidJson
        ? 400
        : isAppError
            ? error.statusCode
            : 500

    const isPublicError = isAppError && statusCode < 500;

    // Do not log request bodies, tokens, or raw database errors.
    console.error({
        request_id: req.requestId,
        status_code: statusCode,
        error_name: error.name || 'Error',
    });

    return res.status(statusCode).json({
        success: false,
        code: isInvalidJson
            ? 'INVALID_JSON'
            : isPublicError
                ? error.code
                : 'INTERNAL_SERVER_ERROR';

        message: isInvalidJson
            ? 'Request body contains invalid JSON,'
            : isPublicError
                ? error.message
                : 'An internal server error occured.',

        request_id: req.requestId,
        timestamp: error.timestamp || new Date().toISOString(),

        ...(isPublicError &&
            statusCode === 422 &&
            Array.isArray(error.errors) && {
            errors: error.errors.map(({ field, message }) => ({
                field, message
            })),
        }),
    });

};

export default errorHandler;