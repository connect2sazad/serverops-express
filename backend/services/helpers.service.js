import crypto from 'crypto';

export const multipliers = {
    B: 1,
    K: 1024,
    KB: 1024,
    M: 1024 ** 2,
    MB: 1024 ** 2,
    G: 1024 ** 3,
    GB: 1024 ** 3,
    T: 1024 ** 4,
    TB: 1024 ** 4,
};

export const parseMemorySize = (value) => {
    const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB|K|M|G|T)?$/i);

    if (!match) {
        throw new Error(`Invalid memory size: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = (match[2] || 'B').toUpperCase();

    return amount * multipliers[unit];
};

export const getFingerprint = (key) => {

    return `SHA256:${crypto
        .createHash('sha256')
        .update(key)
        .digest('base64')}`;

}