import { getDuration } from "./helpers.service.js";
import ssh_service from "./ssh.service.js";

class CommandService {

    async execute(inventory, credential, command){

        const client = await ssh_service.connect(
            inventory,
            credential
        );

        try {

            const startedAt = Date.now();

            const result =
                await ssh_service.executeCommandOnConnection(client, command);

            const duration = getDuration(startedAt);

            const status = result.exitCode === 0 ? 'success' : 'failed';

            return {
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: result.exitCode,
                status,
                metadata: {
                    startedAt,
                    duration
                }
            }

        } finally {
            client.end()
        }

    }

}

const command_service = new CommandService();

export default command_service;