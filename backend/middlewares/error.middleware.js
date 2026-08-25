import HTTP_STATUS from '../exceptions/status_codes.js';

const errorHandler = (error, req, res, next) => {

    console.error(error);

    return res.status(
        error.statusCode ||
        HTTP_STATUS.HTTP_500_INTERNAL_SERVER_ERROR.status_code
    ).json({
        success: false,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Internal server error',
        timestamp: error.timestamp || new Date().toISOString(),

        ...(error.errors && {
            errors: error.errors
        }),
    });

};

export default errorHandler;