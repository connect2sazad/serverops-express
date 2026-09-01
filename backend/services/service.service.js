// this code is used to get services in the inventory
import { getDuration } from "./helpers.service.js";
import ssh_service from "./ssh.service.js";

class ServiceService {

    async getServices(inventory, credential) {

        const startedAt = Date.now();

        const client = await ssh_service.connect(
            inventory,
            credential
        );

        try {

            const command = `
                systemctl list-units --type=service --no-pager
            `;

            const result = await ssh_service.executeCommandOnConnection(
                client,
                command
            );

            return {
                services: this.parseServices(result.stdout),

                metadata: {
                    startedAt,
                    duration: getDuration(startedAt),
                },
            };

        } finally {
            client.end();
        }

    }

    async getService(inventory, credential, serviceName) {
        const startedAt = Date.now();

        const client = await ssh_service.connect(
            inventory,
            credential
        );

        try {

            const command = `
                systemctl show ${serviceName} --no-pager
            `;

            const result = await ssh_service.executeCommandOnConnection(
                client,
                command
            );

            return {
                service: this.parseService(result.stdout),

                metadata: {
                    startedAt,
                    duration: getDuration(startedAt),
                },
            };

        } finally {
            client.end();
        }
    }

    async service_action(inventory, credential, serviceName, action) {
        const startedAt = Date.now();

        const client = await ssh_service.connect(
            inventory,
            credential
        );

        try {

            const verificationRules = {
                start: {
                    command: `systemctl is-active ${serviceName}`,
                    expectedState: 'active',
                },
                stop: {
                    command: `systemctl is-active ${serviceName}`,
                    expectedState: 'inactive',
                },
                restart: {
                    command: `systemctl is-active ${serviceName}`,
                    expectedState: 'active',
                },
                enable: {
                    command: `systemctl is-enabled ${serviceName}`,
                    expectedState: 'enabled',
                },
                disable: {
                    command: `systemctl is-enabled ${serviceName}`,
                    expectedState: 'disabled',
                },
            }
            
            const verificationRule = verificationRules[action];

            if(!verificationRule){
                throw new Error(
                    `Unsupported service action: ${action}`
                );
            }

            const command = `sudo -n systemctl ${action} ${serviceName}`;

            const result = await ssh_service.executeCommandOnConnection(
                client,
                command
            );

            const verificationResult = await ssh_service.executeCommandOnConnection(
                client,
                verificationRule.command
            );

            const state = (
                verificationResult.stdout ||
                verificationResult.stderr
            ).trim();

            let verification = {
                checked: true,
                verified: state === verificationRule.expectedState,
                expected_state: verificationRule.expectedState,
                state
            };

            const commandSucceeded = result.exitCode === 0;

            return {
                command,
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: result.exitCode,

                commandStatus:
                    commandSucceeded && verification.verified
                        ? 'success'
                        : 'failed',

                verification,

                metadata: {
                    startedAt,
                    duration: getDuration(startedAt),
                },
            };

        } finally {
            client.end();
        }
    }

    parseServices(stdout) {

        const lines = stdout
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);

        const services = [];

        for (const line of lines) {

            // Ignore header and systemctl information
            if (
                line.startsWith('UNIT ') ||
                line.startsWith('Legend:') ||
                line.startsWith('ACTIVE') ||
                line.startsWith('SUB') ||
                line.includes('loaded units listed') ||
                line.startsWith('To show') ||
                line.startsWith('Pass --all')
            ) {
                continue;
            }

            const match = line.match(
                /^(\S+)\s+(loaded|not-found|bad|masked)\s+(\S+)\s+(\S+)\s*(.*)$/
            );

            if (!match) {
                continue;
            }

            const [
                ,
                unit,
                load,
                active,
                sub,
                description
            ] = match;

            services.push({
                name: unit.replace(/\.service$/, ''),
                unit,
                load,
                active,
                sub,
                description: description.trim(),
            });

        }

        return services;
    }

    parseService(stdout) {

        const properties = {};

        const lines = stdout
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);

        for (const line of lines) {

            const index = line.indexOf('=');

            if (index === -1) continue;

            const key = line.slice(0, index);
            const value = line.slice(index + 1);

            properties[key] = value;

        }

        return {
            name: properties.Id?.replace(/\.service$/, ''),
            unit: properties.Id ?? null,
            load_state: properties.LoadState ?? null,
            active_state: properties.ActiveState ?? null,
            sub_state: properties.SubState ?? null,
            enabled: properties.UnitFileState === 'enabled',
            description: properties.Description ?? null,
        };

    }
}

const service_service = new ServiceService();

export default service_service;