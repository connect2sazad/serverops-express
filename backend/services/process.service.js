// this code is used to get services in the inventory
import { getDuration } from "./helpers.service.js";
import ssh_service from "./ssh.service.js";

class ProcessService {

    async getProcesses(inventory, credential) {

        const startedAt = Date.now();

        const client = await ssh_service.connect(
            inventory,
            credential
        );

        try {

            const command = `ps -eo user,pid,pcpu,pmem,vsz,rss,tty,stat,lstart,time,args`;

            const result = await ssh_service.executeCommandOnConnection(
                client,
                command
            );

            return {
                processes: this.parseProcesses(result.stdout),

                metadata: {
                    startedAt,
                    duration: getDuration(startedAt),
                },
            };

        } finally {
            client.end();
        }

    }

    async getProcess(inventory, credential, pid) {
        const startedAt = Date.now();

        const client = await ssh_service.connect(
            inventory,
            credential
        );

        try {

            const command = `ps -p ${pid} -o user,pid,ppid,pcpu,pmem,vsz,rss,tty,stat,lstart,time,args`;

            const result = await ssh_service.executeCommandOnConnection(
                client,
                command
            );

            return {
                process: this.parseProcess(result.stdout),

                metadata: {
                    startedAt,
                    duration: getDuration(startedAt),
                },
            };

        } finally {
            client.end();
        }
    }

    async terminateProcess(inventory, credential, pid, options = {}) {
        const startedAt = Date.now();

        const client = await ssh_service.connect(
            inventory,
            credential
        );

        try {

            const force = options.force === true;
            const signal = force ? "KILL" : "TERM"

            // actual commd to be executed
            const command = `sudo -n kill -${signal} ${pid}`;

            // checks that the process exists
            const checkCommand = `ps -p ${pid} -o pid=`;

            // send check command to ssh service
            const checkResult = await ssh_service.executeCommandOnConnection(
                client,
                checkCommand
            );

            if (checkResult.exitCode !== 0) {
                return {
                    process: null,
                    command,
                    stdout: checkResult.stdout,
                    stderr: checkResult.stderr,
                    exitCode: checkResult.exitCode,
                    commandStatus: 'failed',
                    message: `Process ${pid} does not exist`,
                    metadata: {
                        startedAt,
                        duration: getDuration(startedAt),
                    },
                }
            }

            const result = await ssh_service.executeCommandOnConnection(
                client,
                command
            );

            return {
                pid,
                signal,
                command,
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: result.exitCode,
                commandStatus:
                    result.exitCode === 0
                        ? 'success'
                        : 'failed',
                metadata: {
                    startedAt,
                    duration: getDuration(startedAt),
                },
            };

        } finally {
            client.end();
        }
    }

    parseProcesses(stdout) {

        const lines = stdout
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);

        const processes = [];

        for (const line of lines) {

            // Ignore header and systemctl information
            if (line.startsWith('USER ')) continue;

            const match = line.match(
                /^(\S+)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.*)$/
            );

            if (!match) continue;

            const [
                ,
                user, pid, cpu, memory, vsz, rss, tty, stat, day, month, date, timeStarted, year, cpuTime, command
            ] = match;

            processes.push({
                user,
                pid: Number(pid),
                cpu_percent: Number(cpu),
                memory_percent: Number(memory),
                virtual_memory: Number(vsz),
                resident_memory: Number(rss),
                tty,
                state: stat,
                started_at: `${day} ${month} ${date} ${timeStarted} ${year}`,
                cpu_time: cpuTime,
                command: command.trim(),
            });

        }

        return processes;
    }

    parseProcess(stdout) {
        if (!stdout || typeof stdout !== "string") {
            return null;
        }

        const lines = stdout
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);

        // No process returned
        if (lines.length < 2) {
            return null;
        }

        // First line is the header
        const line = lines[1];

        const parts = line.split(/\s+/);

        if (parts.length < 16) {
            return null;
        }

        const user = parts[0];
        const pid = parts[1];
        const ppid = parts[2];
        const cpu = parts[3];
        const memory = parts[4];
        const vsz = parts[5];
        const rss = parts[6];
        const tty = parts[7];
        const stat = parts[8];

        // lstart = 5 fields
        const day = parts[9];
        const month = parts[10];
        const date = parts[11];
        const timeStarted = parts[12];
        const year = parts[13];

        const cpuTime = parts[14];

        // Everything after TIME is the command
        const command = parts.slice(15).join(" ");

        return {
            user,
            pid: Number(pid),
            ppid: Number(ppid),

            cpu_percent: Number(cpu),
            memory_percent: Number(memory),

            virtual_memory: Number(vsz),
            resident_memory: Number(rss),

            tty,
            state: stat,

            started_at: `${day} ${month} ${date} ${timeStarted} ${year}`,

            cpu_time: cpuTime,

            command: command.trim(),
        };
    }

}

const process_service = new ProcessService();

export default process_service;