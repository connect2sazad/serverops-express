import { Client } from 'ssh2';
import fs from 'fs/promises';

import encryptor_service from './encryption.service.js';
import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';

class SSHService {
    async testConnection(inventory, credential){

        const config = {
            host: inventory.hostname,
            port: inventory.port ?? 22,
            username: credential.username,
        };

        if(credential.type === 'password') {
            // if the credential type is a password, then decrypot the secret
            config.password = encryptor_service.tryDecrypt(credential.secret);
        } else if(credential.type === 'private-key'){
            // if the credential type is a private-key, then read the file and decrypt the passphrase
            
            // read the privbate file
            const privateKey = await fs.readFile(
                credential.secret
            );

            // store the private key in config
            config.privateKey = privateKey;

            if(credential.passphrase){
                // decrypt and store the passpharse in config
                config.passphrase = encryptor_service.tryDecrypt(credential.passphrase);
            }

        } else {

            throw new AppException(
                `Unsupported credential type: ${credential.type}`,
                HTTP_STATUS.HTTP_400_BAD_REQUEST
            );

        }

        const startedAt = Date.now();

        return new Promise((resolve, reject) => {

            // create a new client object of ssh2
            const client = new Client();

            client
                .on('ready', () => {

                    const duration = Date.now() - startedAt;

                    client.end();

                    resolve({
                        success: true,
                        duration,
                    });

                })
                .on('error', (e) => {

                    reject(e);

                })
                .connect(config);

        });


    }
}

const ssh_service = new SSHService();

export default ssh_service;