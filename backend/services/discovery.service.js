import { getDuration } from "./helpers.service.js";
import ssh_service from "./ssh.service.js";

class DiscoveryService {

    // async discover(inventory, credential) {

    //     const startedAt = Date.now();

    //     const hostnameResult = await ssh_service.executeCommand(
    //         inventory,
    //         credential,
    //         'hostname'
    //     );

    //     const osResult = await ssh_service.executeCommand(
    //         inventory,
    //         credential,
    //         'cat /etc/os-release'
    //     );

    //     const kernelResult = await ssh_service.executeCommand(
    //         inventory,
    //         credential,
    //         'uname -r'
    //     );

    //     const architectureResult = await ssh_service.executeCommand(
    //         inventory,
    //         credential,
    //         'uname -m'
    //     );

    //     const cpuResult = await ssh_service.executeCommand(
    //         inventory,
    //         credential,
    //         'nproc'
    //     );

    //     const memoryResult = await ssh_service.executeCommand(
    //         inventory,
    //         credential,
    //         "awk '/MemTotal/ {print $2}' /proc/meminfo"
    //     );

    //     const uptimeResult = await ssh_service.executeCommand(
    //         inventory,
    //         credential,
    //         'cat /proc/uptime'
    //     );
    //     const uptimeSeconds = Math.floor(
    //         Number(uptimeResult.stdout.trim().split(/\s+/)[0])
    //     );

    //     return {
    //         hostname: hostnameResult.stdout.trim(),
    //         os: parseOsRelease(osResult.stdout),
    //         kernel: kernelResult.stdout.trim(),
    //         architecture: architectureResult.stdout.trim(),
    //         cpu_cores: Number(cpuResult.stdout.trim()),
    //         memory: {
    //             total_kib: Number(memoryResult.stdout.trim()),
    //         },
    //         uptime_seconds: uptimeSeconds,
    //         startedAt,
    //         duration: getDuration(startedAt)
    //     };
    // }

    async discover(inventory, credential) {

        const startedAt = Date.now();

        const client = await ssh_service.connect(
            inventory,
            credential
        );

        try {

            const command = `
                printf 'HOSTNAME='; hostname
                printf 'OS='; . /etc/os-release && printf '%s' "$NAME"
                printf 'OS_VERSION='; . /etc/os-release && printf '%s' "$VERSION"
                printf 'OS_PRETTY_NAME='; . /etc/os-release && printf '%s' "$PRETTY_NAME"
                printf 'OS_VERSION_ID='; . /etc/os-release && printf '%s' "$VERSION_ID"
                printf 'KERNEL='; uname -r
                printf 'ARCH='; uname -m
                printf 'CPU_CORES='; nproc
                printf 'MEMORY_KIB='; awk '/MemTotal/ {print $2}' /proc/meminfo
                printf 'UPTIME_SECONDS='; awk '{print int($1)}' /proc/uptime
            `;

            const result = await ssh_service.executeCommandOnConnection(
                client,
                command
            );

            const discovery_result = this.parseDiscovery(result.stdout);
            discovery_result.metadata.startedAt = startedAt;
            discovery_result.metadata.duration = getDuration(startedAt);

            return discovery_result;

        } finally {
            client.end();
        }

    }

    parseDiscovery(output) {

        const data = {};

        output
            .split('\n')
            .filter(Boolean)
            .forEach(line => {

                const separator = line.indexOf('=');

                if (separator === -1) {
                    return;
                }

                const key =
                    line.substring(0, separator);

                const value =
                    line.substring(separator + 1);

                data[key] = value;
            });

        return {
            hostname: data.HOSTNAME,

            os: {
                name: data.OS,
                version: data.OS_VERSION,
                pretty_name: data.OS_PRETTY_NAME,
                version_id: data.OS_VERSION_ID,
            },

            kernel: data.KERNEL,

            architecture: data.ARCH,

            cpu_cores: Number(data.CPU_CORES),

            memory: {
                total_kib: Number(data.MEMORY_KIB),
            },

            uptime_seconds: Number(
                data.UPTIME_SECONDS
            ),

            metadata: {},
        };
    }
}

const discovery_service = new DiscoveryService();

export default discovery_service;