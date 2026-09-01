import { getDuration, parseNumber } from "./helpers.service.js";
import ssh_service from "./ssh.service.js";
import AppException from "../exceptions/exception.js";
import HTTP_STATUS from "../exceptions/status_codes.js";

class DiscoveryService {

    async discover(inventory, credential) {

        const startedAt = Date.now();

        const client = await ssh_service.connect(
            inventory,
            credential
        );

        try {

            const command = `
                export LC_ALL=C

                printf 'HOSTNAME=%s\\n' "$(hostname)"

                printf 'OS=%s\\n' "$(
                    grep '^NAME=' /etc/os-release |
                    head -n 1 |
                    cut -d= -f2- |
                    tr -d '"'
                )"

                printf 'OS_VERSION=%s\\n' "$(
                    grep '^VERSION=' /etc/os-release |
                    head -n 1 |
                    cut -d= -f2- |
                    tr -d '"'
                )"

                printf 'OS_PRETTY_NAME=%s\\n' "$(
                    grep '^PRETTY_NAME=' /etc/os-release |
                    head -n 1 |
                    cut -d= -f2- |
                    tr -d '"'
                )"

                printf 'OS_VERSION_ID=%s\\n' "$(
                    grep '^VERSION_ID=' /etc/os-release |
                    head -n 1 |
                    cut -d= -f2- |
                    tr -d '"'
                )"

                printf 'KERNEL=%s\\n' "$(uname -r)"
                printf 'ARCH=%s\\n' "$(uname -m)"
                printf 'CPU_CORES=%s\\n' "$(nproc)"

                printf 'MEMORY_KIB=%s\\n' "$(
                    awk '/MemTotal/ {print $2}' /proc/meminfo
                )"

                printf 'UPTIME_SECONDS=%s\\n' "$(
                    awk '{print int($1)}' /proc/uptime
                )"
            `;

            const result = await ssh_service.executeCommandOnConnection(
                client,
                command
            );

            if (result.exitCode !== 0) {
                throw new AppException(
                    "Failed to discover host information",
                    HTTP_STATUS.HTTP_502_BAD_GATEWAY,
                    {
                        code: 'INVENTORY_DISCOVERY_FAILED',
                        expose: true
                    }
                );
            }

            const discovery_result = this.parseDiscovery(result.stdout);
            discovery_result.metadata.startedAt = startedAt;
            discovery_result.metadata.duration = getDuration(startedAt);
            discovery_result.metadata.collectedAt = new Date().toISOString();

            return discovery_result;

        } finally {
            client.end();
        }

    }

    parseDiscovery(output) {

        const data = {};

        output
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean)
            .forEach(line => {

                const separator = line.indexOf('=');

                if (separator === -1) return;

                const key = line.slice(0, separator).trim();

                const value = line.slice(separator + 1).trim();

                data[key] = value;
            });

        const discovery = {
            hostname: data.HOSTNAME || null,

            os: {
                name: data.OS || null,
                version: data.OS_VERSION || null,
                pretty_name: data.OS_PRETTY_NAME || null,
                version_id: data.OS_VERSION_ID || null,
            },

            kernel: data.KERNEL || null,
            architecture: data.ARCH || null,

            cpu_cores: parseNumber(data.CPU_CORES),

            memory: {
                total_kib: parseNumber(data.MEMORY_KIB),
            },

            uptime_seconds: parseNumber(data.UPTIME_SECONDS),

            metadata: {
                missing_fields: [],
                partial: false,
            }
        };

        const requiredFields = {
            hostname: discovery.hostname,
            operating_system: discovery.os.pretty_name,
            kernel: discovery.kernel,
            architecture: discovery.architecture,
            cpu_cores: discovery.cpu_cores,
            memory_total_kib: discovery.memory.total_kib,
            uptime_seconds: discovery.uptime_seconds,
        };

        discovery.metadata.missing_fields =
            Object.entries(requiredFields)
                .filter(([, value]) => value === null)
                .map(([field]) => field);

        discovery.metadata.partial = discovery.metadata.missing_fields.length > 0;

        return discovery;
    }
}

const discovery_service = new DiscoveryService();

export default discovery_service;