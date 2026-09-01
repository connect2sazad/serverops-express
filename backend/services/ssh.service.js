import { Client } from 'ssh2';
import fs from 'fs/promises';

import encryptor_service from './encryption.service.js';
import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';
import { getFingerprint, getDuration } from './helpers.service.js';

class SSHService {

    // reusable func to genrate config
    async buildConfig(inventory, credential, hostVerifier) {

        if (!inventory || !credential) {
            throw new AppException(
                "Inventory or Credential not found!",
                HTTP_STATUS.HTTP_404_NOT_FOUND
            );
        }

        if (!inventory.status || !credential.status) {
            throw new AppException(
                "SSH access is disabled for this inventory or credential!",
                HTTP_STATUS.HTTP_403_FORBIDDEN
            );
        }

        if (credential.inventory_id !== inventory.id) {
            throw new AppException(
                "Credential does not belong to this inventory!",
                HTTP_STATUS.HTTP_400_BAD_REQUEST
            );
        }

        const config = {
            host: inventory.hostname,
            port: inventory.ssh_port ?? 22,
            username: credential.username,
            hostVerifier,
            readyTimeout: 10000,
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
            let settled = false;

            const fail = error => {
                if (settled) return;

                settled = true;
                client.destroy();
                reject(error);
            }

            client.once('ready', () => {
                if (settled) return;
                settled = true;
                resolve(client);
            });

            client.on('error', fail);

            client.once('close', () => {
                fail(new Error(
                    'SSH connection closed before authentication completed.',
                ));
            });

            try {
                client.connect(config);
            } catch (error) {
                fail(error);
            }

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
            throw this.normalizeConnectionError(
                inventory,
                presentedFingerprint,
                error
            );
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

                    if (err) {
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
    async connect(inventory, credential) {

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

        try {
            return await this.connectWithConfig(config);
        } catch (error) {
            throw this.normalizeConnectionError(
                inventory,
                presentedFingerprint,
                error
            );
        }

    }

    // fucntion to execute commands while the server is connevcted through this.connect()
    executeCommandOnConnection(client, command, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const maxOutputBytes = 1024 * 1024;
            const stdout = [];
            const stderr = [];

            let outputBytes = 0;
            let finished = false;
            let stream;
            let timer;

            const finish = (error, result) => {
                if (finished) return;

                finished = true;
                clearTimeout(timer);

                client.removeListener('error', onClientError);
                client.removeListener('close', onClientClose);

                if (error) {
                    client.destroy();
                    reject(error);
                } else {
                    resolve(result);
                }
            };

            const fail = (
                code,
                message,
                status = HTTP_STATUS.HTTP_502_BAD_GATEWAY
            ) => {
                finish(new AppException(message, status, {
                    code,
                    expose: true,
                }));
            };

            const onClientError = () => fail(
                'SSH_CONNECTION_LOST',
                'SSH connection failed during command execution.'
            );

            const onClientClose = () => fail(
                'SSH_CONNECTION_LOST',
                'SSH connection closed before a command result was received.'
            );

            const onStreamError = () => fail(
                'COMMAND_STREAM_FAILED',
                'The SSH command stream failed.'
            );

            const collect = (chunks, data) => {
                if (finished) return;

                const chunk = Buffer.isBuffer(data)
                    ? data
                    : Buffer.from(data);

                outputBytes += chunk.length;

                if (outputBytes > maxOutputBytes) {
                    fail(
                        'COMMAND_OUTPUT_LIMIT',
                        'Command output exceeded the 1 MiB limit.'
                    );
                    return;
                }

                chunks.push(chunk);
            };

            client.on('error', onClientError);
            client.once('close', onClientClose);

            // Start before requesting the channel.
            timer = setTimeout(() => {
                fail(
                    'COMMAND_TIMEOUT',
                    'The SSH command exceeded its time limit; remote outcome is unknown.',
                    HTTP_STATUS.HTTP_408_REQUEST_TIMEOUT
                );
            }, timeout);

            try {
                client.exec(command, (error, channel) => {
                    if (error) {
                        fail(
                            'COMMAND_CHANNEL_FAILED',
                            'The SSH command channel could not be opened.'
                        );
                        return;
                    }

                    stream = channel;

                    stream.on('error', onStreamError);
                    stream.stderr.on('error', onStreamError);

                    // The channel might arrive after the timeout.
                    if (finished) {
                        stream.close();
                        return;
                    }

                    stream.on('data', data => collect(stdout, data));

                    stream.stderr.on(
                        'data',
                        data => collect(stderr, data)
                    );

                    stream.once('close', (code, signal) => {
                        if (finished) return;

                        if (!Number.isInteger(code) && !signal) {
                            fail(
                                'COMMAND_RESULT_UNKNOWN',
                                'The SSH command closed without an exit status.'
                            );
                            return;
                        }

                        finish(null, {
                            stdout: Buffer.concat(stdout).toString('utf8'),
                            stderr: Buffer.concat(stderr).toString('utf8'),
                            exitCode: code ?? null,
                            signal: signal ?? null,
                        });
                    });
                });
            } catch (error) {
                fail(
                    'COMMAND_CHANNEL_FAILED',
                    'The SSH command could not be started.'
                );
            }
        });
    }

    normalizeConnectionError(inventory, presentedFingerprint, error) {

        if (
            inventory.ssh_host_key_fingerprint &&
            presentedFingerprint &&
            presentedFingerprint !== inventory.ssh_host_key_fingerprint
        ) {
            return new AppException(
                'SSH host key does not match the trusted fingerprint.',
                HTTP_STATUS.HTTP_409_CONFLICT,
                {
                    code: 'SSH_HOST_KEY_MISMATCH'
                }
            );
        }

        if (
            !inventory.ssh_host_key_fingerprint &&
            presentedFingerprint
        ) {
            return new AppException(
                'No SSH host-key fingerprint has been approved!',
                HTTP_STATUS.HTTP_409_CONFLICT, {
                code: 'SSH_HOST_KEY_NOT_TRUSTED'
            }
            );
        }

        if (error.level === 'client-authentication') {
            return new AppException(
                'The SSH Server rejected the configured credential.',
                HTTP_STATUS.HTTP_502_BAD_GATEWAY,
                {
                    code: 'SSH_AUTHENTICATION_FAILED',
                    expose: true
                }
            );
        }

        if (
            error.code === 'ETIMEDOUT' ||
            error.level === 'client-timeout'
        ) {
            return new AppException(
                'The SSH connection timedout.',
                HTTP_STATUS.HTTP_504_GATEWAY_TIMEOUT,
                {
                    code: 'SSH_CONNECTION_TIMEOUT',
                    expose: true,
                }
            );
        }

        if (error.code === 'ECONNREFUSED') {
            return new AppException(
                'The SSH server refused the connection',
                HTTP_STATUS.HTTP_502_BAD_GATEWAY,
                {
                    code: 'SSH_CONNECTION_REFUSED',
                    expose: true,
                }
            );
        }

        if (
            error.code === 'ENOTFOUND' ||
            error.code === 'EAI_AGAIN'
        ) {
            return new AppException(
                'The SSH hostname could not be resolved.',
                HTTP_STATUS.HTTP_502_BAD_GATEWAY,
                {
                    code: 'SSH_DNS_FAILED',
                    expose: true,
                }
            );
        }

        if (
            error.code === 'EHOSTUNREACH' ||
            error.code === 'ENETUNREACH'
        ) {
            return new AppException(
                'The SSH server is unreachable.',
                HTTP_STATUS.HTTP_502_BAD_GATEWAY,
                {
                    code: 'SSH_HOST_UNREACHABLE',
                    expose: true,
                }
            );
        }

        return new AppException(
            'The SSH connection failed.',
            HTTP_STATUS.HTTP_502_BAD_GATEWAY,
            {
                code: 'SSH_CONNECTION_FAILED',
                expose: true
            }
        );

    }
}

const ssh_service = new SSHService();

export default ssh_service;