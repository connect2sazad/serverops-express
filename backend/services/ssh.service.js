import { Client } from 'ssh2';
import fs from 'fs/promises';

import encryptor_service from './encryption.service.js';
import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';
import { getFingerprint, getDuration } from './helpers.service.js';

class SSHService {

    // reusable func to genrate config
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

    // reusable funtion to conect
    connectWithConfig(config) {
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

    // generate fingerprint
    fingerprintFromKey(key) {
        return getFingerprint(key);
    }

    // reuable function to verify fingerprint
    verifyFingerprint(inventory, key) {
        const fingerprint = this.fingerprintFromKey(key);

        if (!inventory.ssh_host_key_fingerprint) {
            return {
                trusted: false,
                fingerprint
            }
        }

        return {
            trusted: fingerprint === inventory.ssh_host_key_fingerprint,
            fingerprint
        };

    }

    // function to test connection
    async testConnection(inventory, credential) {
        let presentedFingerprint = null;

        const hostVerifier = key => {
            const result = this.verifyFingerprint(inventory, key);

            presentedFingerprint = result.fingerprint;

            return result.trusted;
        }

        const config = await this.buildConfig(
            inventory,
            credential,
            hostVerifier
        );

        const startedAt = Date.now();

        try {
            const client = await this.connectWithConfig(config);

            const duration = getDuration(startedAt);

            client.end();

            return {
                success: true,
                metadata: {
                    duration,
                    startedAt,
                },
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

    // fucntion to execute commands
    async executeCommand(inventory, credential, command) {

        let presentedFingerprint = null;

        const hostVerifier = key => {
            const result = this.verifyFingerprint(inventory, key);

            presentedFingerprint = result.fingerprint;

            return result.trusted;
        }

        const config = await this.buildConfig(
            inventory,
            credential,
            hostVerifier
        );

        const startedAt = Date.now();

        return new Promise((resolve, reject) => {

            const client = new Client();
            let duration;

            client.on('ready', () => {

                client.exec(command, (err, stream) => {

                    if(err){
                        duration = getDuration(startedAt);
                        client.end();
                        err.info.startedAt = startedAt;
                        err.info.duration = duration;
                        return reject(err);
                    }

                    let stdout = '';
                    let stderr = '';

                    stream.on('data', data => {
                        stdout += data.toString();
                    });

                    stream.on('close', (code) => {
                        duration = getDuration(startedAt);
                        client.end();

                        resolve({
                            stdout,
                            stderr,
                            exitCode: code
                        });
                    })

                });

            });

            client.on('error', e => {
                reject(e);
            });

            client.connect(config);

        });


    }

    // fucntion to connect to server and keep it untill it is disconnected
    async connect(inventory, credential){

        let presentedFingerprint = null;

        const hostVerifier = key => {
            const result = this.verifyFingerprint(inventory, key);

            presentedFingerprint = result.fingerprint;

            return result.trusted;
        }

        const config = await this.buildConfig(
            inventory,
            credential,
            hostVerifier
        );

        return new Promise((resolve, reject) => {

            const client = new Client();

            client
            .on('ready', () =>{
                resolve(client);
            })
            .on('error', reject)
            .connect(config);

        });

    }

    // fucntion to execute commands while the server is connevcted through this.connect()
    async executeCommandOnConnection(client, command, timeout=30000) {

        return new Promise((resolve, reject) => {

            let timer = null;
            let finished = false;

            client.exec(command, (err, stream) => {

                if(err){
                    return reject(err);
                }

                let stdout = '';
                let stderr = '';

                const cleanup = () => {
                    if(timer){
                        clearTimeout(timer);
                        timer = null;
                    }
                }

                timer = setTimeout(() => {

                    if(finished) return;

                    finished = true;

                    stream.close();

                    cleanup();

                    reject(
                        new AppException(
                            `Command timed out after ${timeout}ms`,
                            HTTP_STATUS.HTTP_408_REQUEST_TIMEOUT
                        )
                    );

                }, timeout);

                stream.on('data', data => {
                    stdout += data.toString();
                });

                stream.stderr.on('data', data => {
                    stderr += data.toString();
                });

                stream.on('close', code => {

                    if(finished) return;

                    finished = true;
                    cleanup();

                    resolve({
                        stdout,
                        stderr,
                        exitCode: code,
                    });
                })

            })

        });

    }
}

const ssh_service = new SSHService();

export default ssh_service;
