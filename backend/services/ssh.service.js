import { Client } from 'ssh2';
import fs from 'fs/promises';

import encryptor_service from './encryption.service.js';
import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';
import { getFingerprint } from './helpers.service.js';

class SSHService {

    async buildConfig(inventory, credential, hostVerifier) {
        const config = {
            host: inventory.hostname,
            port: inventory.ssh_port ?? 22,
            username: credential.username,
            hostVerifier,
        };

        if (credential.type === 'password') {
            config.password = encryptor_service.tryDecrypt(
                credential.secret
            );
        } else if (credential.type === 'private-key') {
            config.privateKey = await fs.readFile(
                credential.secret
            );

            if (credential.passphrase) {
                config.passphrase = encryptor_service.tryDecrypt(
                    credential.passphrase
                );
            }
        } else {
            throw new AppException(
                `Unsupported credential type: ${credential.type}`,
                HTTP_STATUS.HTTP_400_BAD_REQUEST
            );
        }

        return config;
    }

    connect(config) {
        return new Promise((resolve, reject) => {
            const client = new Client();

            client
                .once('ready', () => {
                    resolve(client);
                })
                .once('error', error => {
                    reject(error);
                })
                .connect(config);
        });
    }

    // function to test connection
    async testConnection(inventory, credential) {
        let presentedFingerprint = null;

        const hostVerifier = key => {
            presentedFingerprint = getFingerprint(key);

            if (!inventory.ssh_host_key_fingerprint) {
                return false;
            }

            return (
                presentedFingerprint ===
                inventory.ssh_host_key_fingerprint
            );
        };

        const config = await this.buildConfig(
            inventory,
            credential,
            hostVerifier
        );

        const startedAt = Date.now();

        try {
            const client = await this.connect(config);

            const duration = Date.now() - startedAt;

            client.end();

            return {
                success: true,
                duration,
                startedAt
            };
        } catch (error) {
            if (!inventory.ssh_host_key_fingerprint) {
                throw {
                    code: 'HOST_KEY_NOT_TRUSTED',
                    message: 'SSH host key has not been trusted yet.',
                    fingerprint: presentedFingerprint,
                };
            }

            if (
                presentedFingerprint &&
                presentedFingerprint !==
                    inventory.ssh_host_key_fingerprint
            ) {
                throw {
                    code: 'HOST_KEY_MISMATCH',
                    message:
                        'SSH host key does not match the trusted fingerprint.',
                    expected:
                        inventory.ssh_host_key_fingerprint,
                    received: presentedFingerprint,
                };
            }

            throw {
                code: 'SSH_CONNECTION_FAILED',
                error,
            };
        }
    }

    // function to get fingerprint in case of a new server in inventory
    async getHostKeyFingerprint(inventory, credential) {
        let fingerprint = null;

        const hostVerifier = key => {
            fingerprint = getFingerprint(key);

            // Only used for discovering the host fingerprint.
            return true;
        };

        const config = await this.buildConfig(
            inventory,
            credential,
            hostVerifier
        );

        try {
            const client = await this.connect(config);

            client.end();

            return {
                fingerprint,
            };
        } catch (error) {
            throw {
                code: 'SSH_CONNECTION_FAILED',
                error,
                fingerprint,
            };
        }
    }
}

const ssh_service = new SSHService();

export default ssh_service;
