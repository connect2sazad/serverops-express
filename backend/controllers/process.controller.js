import AppException from "../exceptions/exception.js";
import HTTP_STATUS from "../exceptions/status_codes.js";
import { Inventory, Credential, CommandExecution } from "../models/index.js";
import process_service from "../services/process.service.js";

class ProcessController {

    async init(req) {

        const { id } = req.params;

        const inventory = await Inventory.findOne({
            where: {
                id,
                deleted_at: null,
            },
        });

        if (!inventory) {
            throw new AppException(
                "No inventory found!",
                HTTP_STATUS.HTTP_404_NOT_FOUND
            );
        }

        const credential = await Credential.findOne({
            where: {
                inventory_id: id,
                deleted_at: null
            }
        });

        if (!credential) {
            throw new AppException(
                "No credential found for the inventory!",
                HTTP_STATUS.HTTP_404_NOT_FOUND
            );
        };

        return {
            inventory,
            credential
        }

    }

    async getAll(req, res, next) {

        try {

            const { inventory, credential } = await this.init(req);

            const processes = await process_service.getProcesses(inventory, credential);

            // get the connection details and save in inventory
            inventory.connection_status = 'disconnected';
            inventory.last_connected_at = new Date(processes.metadata.startedAt);
            await inventory.save();

            return res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                message: "Processes retrieved successfully!",
                status: true,
                data: processes
            });

        } catch (e) {

            next(e);

        }

    }

    async get(req, res, next) {

        try {

            const { inventory, credential } = await this.init(req);
            const { pid } = req.params;

            const process_response = await process_service.getProcess(inventory, credential, pid);

            // get the connection details and save in inventory
            inventory.connection_status = 'disconnected';
            inventory.last_connected_at = new Date(process_response.metadata.startedAt);
            await inventory.save();

            return res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                message: "Process retrieved successfully!",
                status: true,
                data: process_response
            });

        } catch (e) {

            next(e);

        }

    }

    async terminateProcess(req, res, next, action) {
        try {

            const { pid } = req.params;
            const { confirm_pid, reason } = req.body;
            const { inventory, credential } = await this.init(req);

            if (confirm_pid !== pid){
                throw new AppException(
                    'Confirmed PID does not match with the requested PID.',
                    HTTP_STATUS.HTTP_400_BAD_REQUEST
                );
            }


            const actions = {
                terminate: {
                    perform: { force: false, },
                    message: {
                        success: `Process ${pid} terminated successfully!`,
                        failed: `Failed to terminate process ${pid}`,
                    }
                },
                force_kill: {
                    perform: { force: true },
                    message: {
                        success: `Process ${pid} force killed successfully!`,
                        failed: `Failed to force kill process ${pid}`,
                    }
                }
            }

            const selectedAction = actions[action];

            if(!selectedAction){
                throw new AppException(
                    'Unsupported process action',
                    HTTP_STATUS.HTTP_400_BAD_REQUEST
                );
            }

            const result = await process_service.terminateProcess(
                inventory, credential, pid, selectedAction.perform
            );

            const succeeded = result.commandStatus === 'success';

            const message = succeeded
                ? selectedAction.message.success
                : selectedAction.message.failed;

            // save the last connection details in the inventory
            inventory.connection_status = 'disconnected';
            inventory.last_connected_at = new Date(result.metadata.startedAt);
            await inventory.save();

            await CommandExecution.create({
                inventory_id: inventory.id,
                credential_id: credential.id,
                creator_id: req.auth.id,

                command: result.command,
                stdout: result.stdout,
                stderr: result.stderr,
                exit_code: result.exitCode,
                command_status: result.commandStatus,

                duration: result.metadata.duration,
                remarks: `${message} Reason: ${reason}`,
                tags: [
                    'process',
                    action,
                    String(pid),
                    inventory.hostname,
                ],

                started_at: new Date(result.metadata.startedAt),
                finished_at: new Date(
                    result.metadata.startedAt +
                    result.metadata.duration
                ),
            });

            return res.status(
                HTTP_STATUS.HTTP_200_OK.status_code
            ).json({
                message,
                success: true,
                data: result
            });

        } catch (e) {
            next(e);
        }
    }

}

const process_controller = new ProcessController();
export default process_controller;