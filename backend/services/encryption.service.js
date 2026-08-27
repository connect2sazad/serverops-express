import crypto from 'crypto';

import { ENCRYPTION_ALGORITHM, ENCRYPTION_KEY } from '../config/config.js';

class ENcryptor {

    isEncrypted(value) {
        return typeof value === 'string' && value.split(':').length === 3;
    }

    tryDecrypt(value) {
        try {
            return this.decrypt(value);
        } catch {
            return null;
        }
    }

    encryptObject(object) {
        return this.encrypt(JSON.stringify(object));
    }

    decryptObject(value) {
        return JSON.parse(this.decrypt(value));
    }


    encrypt(text) {

        // generate a 12bytes initialization vector(iv) for encryption
        const iv = crypto.randomBytes(12);

        // create encryption object with algoritm, key and iv
        const cipher = crypto.createCipheriv(
            ENCRYPTION_ALGORITHM,
            ENCRYPTION_KEY,
            iv
        );

        // encrypting the plain text using the encryption object
        //  and combing all the results using Buffer
        const encrypted = Buffer.concat([
            cipher.update(text, 'utf8'),
            cipher.final()
        ]);

        // Get the authentication tag used to verify the integrity and authenticity of the encrypted data.
        const authTag = cipher.getAuthTag();

        // return the result by joining IV:AUTH_TAG:ENCRYPTED_DATA
        return [
            iv.toString('base64'),
            authTag.toString('base64'),
            encrypted.toString('base64')
        ].join(':');

    }

    decrypt(value) {

        // split the value to iv, auth tag & encrypted data
        const [
            ivBase64,
            authTagBase64,
            encryptedBase64
        ] = value.split(':');

        // decode the Base64 IV back into a Buffer.
        const iv = Buffer.from(ivBase64, 'base64');

        // decode the authentication tag back into a Buffer.
        const authTag = Buffer.from(authTagBase64, 'base64');

        // decode the ciphertext back into a Buffer.
        const encrypted = Buffer.from(encryptedBase64, 'base64');

        // create decipher
        const decipher = crypto.createDecipheriv(
            ENCRYPTION_ALGORITHM,
            ENCRYPTION_KEY,
            iv
        );

        // sset the auth tag to decrypt using decipher
        decipher.setAuthTag(authTag);

        // decrypt the ciphertext and combine the resulting plaintext chunks into one Buffer.
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);

        return decrypted.toString('utf8');
    }

}

const encryptor_service = new ENcryptor();

export default encryptor_service;