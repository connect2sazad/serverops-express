import AppException from "../exceptions/exception.js";
import HTTP_STATUS from "../exceptions/status_codes.js";

const validate = (schema, source = 'body') => {

    return async (req, res, next) => {

        try{

            const result = schema.safeParse(req[source]);

            if(!result.success){

                const errors = result.error.issues.map(
                    issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })
                );

                throw new AppException(
                    'Validation failed!',
                    HTTP_STATUS.HTTP_422_UNPROCESSABLE_ENTITY,
                    {
                        errors
                    }
                );

            }

            // replace request data with validated data, remove unknown fields
            req[source] = result.data;

            next();

        } catch(e){
            next(e);
        }

    }

}

export default validate;