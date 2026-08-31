import crypto from 'crypto';

export const requestUUID = (req, res, next) => {

    const requestId = crypto.randomUUID();

    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    next()    
}